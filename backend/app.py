from pathlib import Path
import json

import torch
import torch.nn as nn
from flask import Flask, jsonify, request
from flask_cors import CORS


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ARTIFACT_DIR = PROJECT_ROOT / "ml" / "artifacts"
MODEL_DIR = ARTIFACT_DIR / "models"

MODEL_PATH = MODEL_DIR / "temporal_forecaster_best.pt"
CONFIG_PATH = MODEL_DIR / "temporal_forecaster_config.json"
MITRE_PATH = ARTIFACT_DIR / "mitre_stage_mapping.json"


# ============================================================
# MODEL
# ============================================================

class NextStateLSTM(nn.Module):
    """
    Exact architecture used by the trained ThreatRakshak
    Temporal Forecaster.

    Input:
        Sequence of 8 discrete UNSW-NB15 attack states.

    Output:
        Logits for the next attack state.
    """

    def __init__(
        self,
        num_states: int,
        embedding_dim: int,
        hidden_dim: int,
        num_layers: int = 1,
        dropout: float = 0.0,
    ):
        super().__init__()

        self.embedding = nn.Embedding(
            num_embeddings=num_states,
            embedding_dim=embedding_dim,
        )

        effective_dropout = dropout if num_layers > 1 else 0.0

        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=effective_dropout,
        )

        self.classifier = nn.Linear(
            hidden_dim,
            num_states,
        )

    def forward(self, x):
        embedded = self.embedding(x)

        output, _ = self.lstm(embedded)

        final_output = output[:, -1, :]

        logits = self.classifier(final_output)

        return logits


# ============================================================
# LOAD CONFIGURATION
# ============================================================

with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    CONFIG = json.load(f)

STATES = CONFIG["state_names"]
STATE_TO_ID = CONFIG["state_to_id"]

SEQUENCE_LENGTH = CONFIG["sequence_length"]
NUM_STATES = CONFIG["num_states"]
EMBEDDING_DIM = CONFIG["embedding_dim"]
HIDDEN_DIM = CONFIG["hidden_dim"]
NUM_LAYERS = CONFIG["num_layers"]
DROPOUT = CONFIG["dropout"]


# ============================================================
# LOAD MITRE INTERPRETATION
# ============================================================

if MITRE_PATH.exists():
    with open(MITRE_PATH, "r", encoding="utf-8") as f:
        MITRE_MAPPING = json.load(f).get("mapping", {})
else:
    MITRE_MAPPING = {}


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

model = NextStateLSTM(
    num_states=NUM_STATES,
    embedding_dim=EMBEDDING_DIM,
    hidden_dim=HIDDEN_DIM,
    num_layers=NUM_LAYERS,
    dropout=DROPOUT,
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=False,
)

if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    model.load_state_dict(checkpoint["model_state_dict"])
elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
    model.load_state_dict(checkpoint["state_dict"])
else:
    model.load_state_dict(checkpoint)

model.eval()


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)
CORS(app)


@app.get("/")
def home():
    return jsonify({
        "service": "ThreatRakshak Temporal Forecast API",
        "status": "online",
        "mode": "REAL_MODEL_INFERENCE",
        "model": "Temporal Forecaster",
        "dataset": "UNSW-NB15",
        "sequence_length": SEQUENCE_LENGTH,
        "num_states": NUM_STATES,
    })


@app.get("/health")
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": True,
        "mode": "REAL_MODEL_INFERENCE",
    })


@app.post("/predict")
def predict():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Request body must be a JSON object."
        }), 400

    sequence = data.get("sequence")

    if not isinstance(sequence, list):
        return jsonify({
            "error": "sequence must be a list of attack-state names."
        }), 400

    if len(sequence) != SEQUENCE_LENGTH:
        return jsonify({
            "error": (
                f"Expected exactly {SEQUENCE_LENGTH} states, "
                f"received {len(sequence)}."
            )
        }), 400

    normalized_sequence = []

    for state in sequence:
        if not isinstance(state, str):
            return jsonify({
                "error": "Every sequence state must be a string."
            }), 400

        state = state.strip().lower()

        if state not in STATE_TO_ID:
            return jsonify({
                "error": f"Unknown attack state: {state}",
                "valid_states": STATES,
            }), 400

        normalized_sequence.append(state)

    state_ids = [
        STATE_TO_ID[state]
        for state in normalized_sequence
    ]

    input_tensor = torch.tensor(
        [state_ids],
        dtype=torch.long,
    )

    with torch.no_grad():
        logits = model(input_tensor)
        probabilities = torch.softmax(logits, dim=1)[0]

    prediction_id = int(torch.argmax(probabilities).item())
    predicted_state = STATES[prediction_id]
    confidence = float(probabilities[prediction_id].item() * 100)

    probability_distribution = {
        STATES[i]: round(float(probabilities[i].item() * 100), 4)
        for i in range(NUM_STATES)
    }

    mitre_interpretation = MITRE_MAPPING.get(
        predicted_state,
        []
    )

    return jsonify({
        "mode": "REAL_MODEL_INFERENCE",
        "model": "Temporal Forecaster",
        "input_sequence": normalized_sequence,
        "predicted_next_state": predicted_state,
        "confidence": round(confidence, 2),
        "probabilities": probability_distribution,
        "mitre_interpretation": mitre_interpretation,
    })


if __name__ == "__main__":
    print("=" * 60)
    print("ThreatRakshak REAL MODEL API")
    print("=" * 60)
    print(f"Model: {MODEL_PATH}")
    print(f"States: {NUM_STATES}")
    print(f"Sequence length: {SEQUENCE_LENGTH}")
    print("Mode: REAL_MODEL_INFERENCE")
    print("Server: http://127.0.0.1:5000")
    print("=" * 60)

    app.run(
        host="0.0.0.0",
        port=int(__import__("os").environ.get("PORT", 5000)),
        debug=False,
    )



