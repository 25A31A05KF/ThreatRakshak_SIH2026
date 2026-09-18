      # ============================================================
# THREATRAKSHAK - TEMPORAL NEXT-STATE FORECASTER
# ============================================================
#
# Purpose:
#   Train a real temporal LSTM model that predicts the next
#   observed UNSW-NB15 attack-category state.
#
# Safety:
#   - Original datasets are NOT modified.
#   - Progression artifacts are NOT modified.
#   - Train/validation/test order is preserved.
#   - No random shuffling is performed.
#   - Test data is evaluated only after model selection.
#
# Important:
#   - "labels" inside the progression artifacts are STRINGS.
#   - "current_state_ids" and "next_state_ids" are INTEGER IDs.
#   - Labels are NEVER converted using int("fuzzers").
#
# ============================================================

from __future__ import annotations

import json
import random
import sys
from collections import Counter
from pathlib import Path
from typing import Any

import numpy as np


# ============================================================
# PYTORCH IMPORT
# ============================================================

try:
    import torch
    import torch.nn as nn
    from torch.utils.data import Dataset, DataLoader

except ImportError:
    print()
    print("ERROR: PyTorch is not installed.")
    print()
    print("Activate the .venv environment and run:")
    print()
    print("    python -m pip install torch")
    print()
    sys.exit(1)


# ============================================================
# PROJECT PATHS
# ============================================================

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent

ARTIFACT_DIR = SCRIPT_DIR / "artifacts" / "progression"
MODEL_DIR = SCRIPT_DIR / "artifacts" / "models"

TRAIN_FILE = ARTIFACT_DIR / "train_progression.npz"
VAL_FILE = ARTIFACT_DIR / "validation_progression.npz"
TEST_FILE = ARTIFACT_DIR / "test_progression.npz"

VOCAB_FILE = ARTIFACT_DIR / "state_vocabulary.json"


# ============================================================
# MODEL CONFIGURATION
# ============================================================

SEQUENCE_LENGTH = 8

EMBEDDING_DIM = 16
HIDDEN_DIM = 32

NUM_LAYERS = 1
DROPOUT = 0.0

BATCH_SIZE = 128
EPOCHS = 30

LEARNING_RATE = 0.001
WEIGHT_DECAY = 1e-4

PATIENCE = 7

NUM_STATES = 9

SEED = 42


# ============================================================
# DEFAULT STATE VOCABULARY
# ============================================================

DEFAULT_STATES = [
    "analysis",
    "backdoor",
    "dos",
    "exploits",
    "fuzzers",
    "generic",
    "reconnaissance",
    "shellcode",
    "worms",
]


# ============================================================
# TERMINAL HELPERS
# ============================================================

def separator(char: str = "=", length: int = 72) -> None:
    print(char * length)


def section(title: str) -> None:
    print()
    separator()
    print(title)
    separator()


def info(message: str) -> None:
    print(f"[INFO] {message}")


def ok(message: str) -> None:
    print(f"[OK]   {message}")


def warning(message: str) -> None:
    print(f"[WARN] {message}")


def fail(message: str) -> None:
    print(f"[ERROR] {message}")


# ============================================================
# REPRODUCIBILITY
# ============================================================

def set_seed(seed: int = SEED) -> None:
    random.seed(seed)
    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

    try:
        torch.use_deterministic_algorithms(True)
    except Exception:
        pass


set_seed()


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# LABEL NORMALIZATION
# ============================================================

def normalize_label(value: Any) -> str:
    """
    Safely normalize an artifact label to lowercase text.

    Examples:
        "fuzzers"          -> "fuzzers"
        np.str_("fuzzers") -> "fuzzers"
        b"fuzzers"        -> "fuzzers"

    IMPORTANT:
        This function does NOT attempt int(value).
    """

    if isinstance(value, bytes):
        try:
            value = value.decode("utf-8")
        except UnicodeDecodeError:
            value = value.decode("utf-8", errors="replace")

    return str(value).strip().lower()


# ============================================================
# VOCABULARY LOADING
# ============================================================

def load_vocabulary() -> tuple[list[str], dict[str, int]]:
    """
    Load the state vocabulary.

    If state_vocabulary.json is unavailable, use the known
    9-state UNSW-NB15 vocabulary.

    No files are modified.
    """

    if not VOCAB_FILE.exists():
        warning(
            "state_vocabulary.json was not found."
        )
        warning(
            "Using the expected UNSW-NB15 9-state vocabulary."
        )

        states = DEFAULT_STATES.copy()

    else:
        try:
            with VOCAB_FILE.open(
                "r",
                encoding="utf-8",
            ) as file:
                data = json.load(file)

            states = data.get("states")

            if not isinstance(states, list):
                raise ValueError(
                    "'states' must be a list."
                )

            states = [
                normalize_label(value)
                for value in states
            ]

        except Exception as exc:
            raise RuntimeError(
                "Could not read state vocabulary: "
                f"{exc}"
            ) from exc

    if len(states) != NUM_STATES:
        raise ValueError(
            f"Expected exactly {NUM_STATES} states, "
            f"but found {len(states)}."
        )

    if len(set(states)) != NUM_STATES:
        raise ValueError(
            "State vocabulary contains duplicate names."
        )

    state_to_id = {
        name: index
        for index, name in enumerate(states)
    }

    return states, state_to_id


# ============================================================
# INTEGER STATE-ID VALIDATION
# ============================================================

def validate_integer_state_ids(
    values: np.ndarray,
    name: str,
) -> np.ndarray:
    """
    Validate numeric state IDs.

    This function is ONLY for current_state_ids and
    next_state_ids.

    It is deliberately NOT used for labels.
    """

    values = np.asarray(values)

    if values.ndim != 1:
        raise ValueError(
            f"{name} must be 1-dimensional; "
            f"got shape {values.shape}."
        )

    if values.size == 0:
        raise ValueError(
            f"{name} is empty."
        )

    try:
        values = values.astype(
            np.int64,
            copy=False,
        )
    except Exception as exc:
        raise ValueError(
            f"{name} could not be converted to "
            f"integer state IDs: {exc}"
        ) from exc

    min_id = int(values.min())
    max_id = int(values.max())

    if min_id < 0 or max_id >= NUM_STATES:
        raise ValueError(
            f"{name} contains invalid state IDs. "
            f"Found range {min_id}..{max_id}; "
            f"expected 0..{NUM_STATES - 1}."
        )

    return values


# ============================================================
# LABEL VALIDATION
# ============================================================

def validate_labels(
    labels: np.ndarray,
    states: list[str],
    split_name: str,
) -> np.ndarray:
    """
    Validate string labels.

    Labels are intentionally kept as strings.

    Example:
        'fuzzers'
        'generic'
        'exploits'

    They are NOT converted using int().
    """

    labels = np.asarray(labels)

    if labels.ndim != 1:
        raise ValueError(
            f"{split_name}: labels must be 1D; "
            f"got {labels.shape}."
        )

    if labels.size == 0:
        raise ValueError(
            f"{split_name}: labels are empty."
        )

    normalized = np.asarray(
        [
            normalize_label(value)
            for value in labels
        ],
        dtype=object,
    )

    valid_states = set(states)

    invalid = sorted(
        {
            value
            for value in normalized
            if value not in valid_states
        }
    )

    if invalid:
        preview = invalid[:10]

        raise ValueError(
            f"{split_name}: found labels not present "
            f"in the state vocabulary: {preview}"
        )

    return normalized


# ============================================================
# LOAD ONE PROGRESSION ARTIFACT
# ============================================================

def load_progression_artifact(
    path: Path,
    split_name: str,
    states: list[str],
) -> dict[str, np.ndarray]:
    """
    Load one progression artifact.

    allow_pickle=True is required because labels are stored
    as an object/string array.

    The artifact is read-only.
    """

    if not path.exists():
        raise FileNotFoundError(
            f"{split_name} artifact not found:\n{path}"
        )

    print()
    print(f"Loading {split_name} artifact:")
    print(f"  {path}")

    try:
        with np.load(
            path,
            allow_pickle=True,
        ) as data:

            required_keys = {
                "labels",
                "current_state_ids",
                "next_state_ids",
                "transition_counts",
            }

            actual_keys = set(data.files)

            missing = required_keys - actual_keys

            if missing:
                raise ValueError(
                    f"Missing required keys: "
                    f"{sorted(missing)}"
                )

            artifact = {
                "labels": np.asarray(
                    data["labels"]
                ),
                "current_state_ids": np.asarray(
                    data["current_state_ids"]
                ),
                "next_state_ids": np.asarray(
                    data["next_state_ids"]
                ),
                "transition_counts": np.asarray(
                    data["transition_counts"]
                ),
            }

    except Exception as exc:
        raise RuntimeError(
            f"Could not load {split_name} artifact: {exc}"
        ) from exc

    # --------------------------------------------------------
    # Validate labels as STRINGS
    # --------------------------------------------------------

    artifact["labels"] = validate_labels(
        artifact["labels"],
        states,
        split_name,
    )

    # --------------------------------------------------------
    # Validate numeric state IDs
    # --------------------------------------------------------

    current_ids = validate_integer_state_ids(
        artifact["current_state_ids"],
        f"{split_name} current_state_ids",
    )

    next_ids = validate_integer_state_ids(
        artifact["next_state_ids"],
        f"{split_name} next_state_ids",
    )

    if len(current_ids) != len(next_ids):
        raise ValueError(
            f"{split_name}: current_state_ids and "
            f"next_state_ids have different lengths: "
            f"{len(current_ids)} vs {len(next_ids)}."
        )

    if len(artifact["labels"]) != len(current_ids) + 1:
        raise ValueError(
            f"{split_name}: labels/transitions alignment "
            f"failed.\n"
            f"labels = {len(artifact['labels'])}\n"
            f"transitions = {len(current_ids)}"
        )

    # --------------------------------------------------------
    # Validate transition matrix
    # --------------------------------------------------------

    transition_counts = artifact[
        "transition_counts"
    ]

    if transition_counts.shape != (
        NUM_STATES,
        NUM_STATES,
    ):
        raise ValueError(
            f"{split_name}: transition_counts must have "
            f"shape ({NUM_STATES}, {NUM_STATES}), "
            f"got {transition_counts.shape}."
        )

    if not np.issubdtype(
        transition_counts.dtype,
        np.integer,
    ):
        raise ValueError(
            f"{split_name}: transition_counts must "
            f"contain integers."
        )

    if np.any(transition_counts < 0):
        raise ValueError(
            f"{split_name}: transition_counts contains "
            f"negative values."
        )

    artifact["current_state_ids"] = current_ids
    artifact["next_state_ids"] = next_ids

    return artifact


# ============================================================
# ARTIFACT SUMMARY
# ============================================================

def print_artifact_summary(
    split_name: str,
    artifact: dict[str, np.ndarray],
    states: list[str],
) -> None:

    labels = artifact["labels"]
    current_ids = artifact["current_state_ids"]
    transition_counts = artifact[
        "transition_counts"
    ]

    print()
    print(f"{split_name.upper()} SUMMARY")
    print("-" * 50)

    print(
        f"Labels:              {len(labels):,}"
    )

    print(
        f"Transitions:         {len(current_ids):,}"
    )

    print(
        f"Transition matrix:   {transition_counts.shape}"
    )

    print("State distribution:")

    # --------------------------------------------------------
    # IMPORTANT FIX
    #
    # labels are strings such as "fuzzers".
    #
    # DO NOT DO:
    #     int(x)
    #
    # --------------------------------------------------------

    normalized_labels = [
        normalize_label(value)
        for value in labels
    ]

    counts = Counter(
        normalized_labels
    )

    for state_id, state_name in enumerate(states):

        count = counts.get(
            state_name,
            0,
        )

        percentage = (
            100.0 * count / len(labels)
            if len(labels) > 0
            else 0.0
        )

        print(
            f"  {state_id}: "
            f"{state_name:<16} "
            f"{count:>7,} "
            f"({percentage:6.2f}%)"
        )


# ============================================================
# CROSS-SPLIT VALIDATION
# ============================================================

def validate_all_artifacts(
    train: dict[str, np.ndarray],
    validation: dict[str, np.ndarray],
    test: dict[str, np.ndarray],
) -> None:

    for split_name, artifact in [
        ("train", train),
        ("validation", validation),
        ("test", test),
    ]:

        current_ids = artifact[
            "current_state_ids"
        ]

        next_ids = artifact[
            "next_state_ids"
        ]

        labels = artifact["labels"]

        if len(current_ids) != len(next_ids):
            raise ValueError(
                f"{split_name}: transition lengths "
                f"do not match."
            )

        if len(current_ids) != len(labels) - 1:
            raise ValueError(
                f"{split_name}: labels/transitions "
                f"alignment failed."
            )

    ok(
        "All progression artifacts passed "
        "structural validation."
    )


# ============================================================
# PART 1 COMPLETE
# ============================================================
# ============================================================
# PART 2: TEMPORAL DATASET + LSTM MODEL
# ============================================================


# ============================================================
# TEMPORAL DATASET
# ============================================================

class TemporalStateDataset(Dataset):
    """
    Convert an ordered state sequence into forecasting samples.

    Example with sequence length 4:

        States:
            A B C D E F

        Sample 1:
            A B C D -> E

        Sample 2:
            B C D E -> F

    No random shuffling is performed here.
    """

    def __init__(
        self,
        current_state_ids: np.ndarray,
        next_state_ids: np.ndarray,
        sequence_length: int,
    ) -> None:

        if sequence_length < 1:
            raise ValueError(
                "sequence_length must be at least 1."
            )

        current_state_ids = np.asarray(
            current_state_ids,
            dtype=np.int64,
        )

        next_state_ids = np.asarray(
            next_state_ids,
            dtype=np.int64,
        )

        if len(current_state_ids) != len(
            next_state_ids
        ):
            raise ValueError(
                "Current and next state arrays must "
                "have the same length."
            )

        if len(current_state_ids) < sequence_length:
            raise ValueError(
                f"Not enough transitions "
                f"({len(current_state_ids)}) for "
                f"sequence length {sequence_length}."
            )

        # Reconstruct the ordered state sequence.
        #
        # If transitions are:
        #
        # A -> B
        # B -> C
        # C -> D
        #
        # then current IDs are:
        #
        # A B C
        #
        # and final next ID is:
        #
        # D
        #
        # giving:
        #
        # A B C D

        self.states = np.concatenate(
            [
                current_state_ids,
                next_state_ids[-1:].copy(),
            ]
        )

        self.sequence_length = sequence_length

        self.length = (
            len(self.states)
            - sequence_length
        )

        if self.length <= 0:
            raise ValueError(
                "Temporal dataset contains no samples."
            )

    def __len__(self) -> int:
        return self.length

    def __getitem__(
        self,
        index: int,
    ) -> tuple[torch.Tensor, torch.Tensor]:

        start = index

        end = (
            index
            + self.sequence_length
        )

        x = self.states[start:end]

        y = self.states[end]

        return (
            torch.tensor(
                x,
                dtype=torch.long,
            ),
            torch.tensor(
                y,
                dtype=torch.long,
            ),
        )


# ============================================================
# LSTM MODEL
# ============================================================

class NextStateLSTM(nn.Module):
    """
    Embedding -> LSTM -> Linear classifier.

    Input:
        Ordered sequence of discrete network states.

    Output:
        Logits for the next state among NUM_STATES states.
    """

    def __init__(
        self,
        num_states: int,
        embedding_dim: int,
        hidden_dim: int,
        num_layers: int = 1,
        dropout: float = 0.0,
    ) -> None:

        super().__init__()

        self.embedding = nn.Embedding(
            num_embeddings=num_states,
            embedding_dim=embedding_dim,
        )

        effective_dropout = (
            dropout
            if num_layers > 1
            else 0.0
        )

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

    def forward(
        self,
        x: torch.Tensor,
    ) -> torch.Tensor:

        embedded = self.embedding(x)

        output, _ = self.lstm(
            embedded
        )

        final_output = output[:, -1, :]

        logits = self.classifier(
            final_output
        )

        return logits


# ============================================================
# DATASET CREATION
# ============================================================

def create_dataset(
    artifact: dict[str, np.ndarray],
    split_name: str,
) -> TemporalStateDataset:

    dataset = TemporalStateDataset(
        current_state_ids=artifact[
            "current_state_ids"
        ],
        next_state_ids=artifact[
            "next_state_ids"
        ],
        sequence_length=SEQUENCE_LENGTH,
    )

    info(
        f"{split_name}: created "
        f"{len(dataset):,} temporal "
        f"forecasting samples."
    )

    return dataset


# ============================================================
# CLASS WEIGHTS
# ============================================================

def calculate_class_weights(
    train_dataset: TemporalStateDataset,
) -> torch.Tensor:
    """
    Calculate inverse-frequency class weights from
    training targets only.

    Validation/test data are NOT used.

    Weights are clipped for stability.
    """

    targets = []

    for index in range(
        len(train_dataset)
    ):

        _, target = train_dataset[index]

        targets.append(
            int(target.item())
        )

    counts = np.bincount(
        np.asarray(
            targets,
            dtype=np.int64,
        ),
        minlength=NUM_STATES,
    )

    total = int(
        counts.sum()
    )

    weights = np.ones(
        NUM_STATES,
        dtype=np.float32,
    )

    for class_id in range(
        NUM_STATES
    ):

        if counts[class_id] > 0:

            weights[class_id] = (
                total
                / (
                    NUM_STATES
                    * counts[class_id]
                )
            )

        else:

            weights[class_id] = 1.0

    weights = np.clip(
        weights,
        0.25,
        5.0,
    )

    mean_weight = float(
        weights.mean()
    )

    if mean_weight > 0:
        weights = (
            weights
            / mean_weight
        )

    print()
    print("TRAINING CLASS WEIGHTS")
    print("-" * 50)

    for class_id, weight in enumerate(
        weights
    ):

        print(
            f"  State {class_id}: "
            f"{weight:.4f}"
        )

    return torch.tensor(
        weights,
        dtype=torch.float32,
        device=DEVICE,
    )


# ============================================================
# DATALOADER
# ============================================================

def create_dataloader(
    dataset: TemporalStateDataset,
) -> DataLoader:

    # IMPORTANT:
    #
    # shuffle=False
    #
    # Temporal order must be preserved.

    return DataLoader(
        dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0,
        pin_memory=False,
    )


# ============================================================
# METRICS
# ============================================================

def calculate_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
) -> dict[str, Any]:

    y_true = np.asarray(
        y_true,
        dtype=np.int64,
    )

    y_pred = np.asarray(
        y_pred,
        dtype=np.int64,
    )

    if len(y_true) != len(y_pred):
        raise ValueError(
            "y_true and y_pred must have "
            "equal lengths."
        )

    if len(y_true) == 0:
        raise ValueError(
            "Cannot calculate metrics on empty arrays."
        )

    confusion = np.zeros(
        (
            NUM_STATES,
            NUM_STATES,
        ),
        dtype=np.int64,
    )

    for true_value, pred_value in zip(
        y_true,
        y_pred,
    ):

        if not (
            0 <= true_value < NUM_STATES
        ):
            raise ValueError(
                f"Invalid true state: {true_value}"
            )

        if not (
            0 <= pred_value < NUM_STATES
        ):
            raise ValueError(
                f"Invalid predicted state: "
                f"{pred_value}"
            )

        confusion[
            true_value,
            pred_value,
        ] += 1

    accuracy = float(
        np.mean(
            y_true == y_pred
        )
    )

    recalls = []
    precisions = []
    f1_scores = []

    per_class = {}

    for class_id in range(
        NUM_STATES
    ):

        tp = int(
            confusion[
                class_id,
                class_id,
            ]
        )

        actual = int(
            confusion[
                class_id,
                :,
            ].sum()
        )

        predicted = int(
            confusion[
                :,
                class_id,
            ].sum()
        )

        fn = actual - tp
        fp = predicted - tp

        if actual > 0:

            recall = (
                tp / actual
            )

            recalls.append(
                recall
            )

        else:

            recall = None

        if predicted > 0:

            precision = (
                tp / predicted
            )

            precisions.append(
                precision
            )

        else:

            precision = 0.0

        if (
            precision is not None
            and recall is not None
            and precision + recall > 0
        ):

            f1 = (
                2.0
                * precision
                * recall
                / (
                    precision
                    + recall
                )
            )

            f1_scores.append(
                f1
            )

        else:

            f1 = 0.0

        per_class[
            str(class_id)
        ] = {
            "support": actual,
            "precision": (
                float(precision)
                if precision is not None
                else 0.0
            ),
            "recall": (
                float(recall)
                if recall is not None
                else 0.0
            ),
            "f1": float(f1),
            "tp": tp,
            "fp": fp,
            "fn": fn,
        }

    active_recalls = [
        item["recall"]
        for item in per_class.values()
        if item["support"] > 0
    ]

    balanced_accuracy = (
        float(
            np.mean(
                active_recalls
            )
        )
        if active_recalls
        else 0.0
    )

    macro_precision = float(np.mean([item["precision"] for item in per_class.values()])) if per_class else 0.0

    macro_recall = (
        float(
            np.mean(
                recalls
            )
        )
        if recalls
        else 0.0
    )

    macro_f1 = float(np.mean([item["f1"] for item in per_class.values()])) if per_class else 0.0

    total = len(y_true)

    weighted_f1 = 0.0

    for class_id in range(
        NUM_STATES
    ):

        support = per_class[
            str(class_id)
        ]["support"]

        f1 = per_class[
            str(class_id)
        ]["f1"]

        weighted_f1 += (
            (
                support
                / total
            )
            * f1
        )

    return {
        "samples": int(total),
        "accuracy": accuracy,
        "balanced_accuracy":
            balanced_accuracy,
        "macro_precision":
            macro_precision,
        "macro_recall":
            macro_recall,
        "macro_f1":
            macro_f1,
        "weighted_f1":
            float(weighted_f1),
        "confusion_matrix":
            confusion.tolist(),
        "per_class":
            per_class,
    }


# ============================================================
# PART 2 COMPLETE
# ============================================================
# ============================================================
# PART 3: TRAINING + EVALUATION
# ============================================================


# ============================================================
# TOP-K ACCURACY
# ============================================================

def top_k_accuracy(
    logits: torch.Tensor,
    targets: torch.Tensor,
    k: int,
) -> float:

    k = min(
        k,
        logits.shape[1],
    )

    top_k = torch.topk(
        logits,
        k=k,
        dim=1,
    ).indices

    correct = (
        top_k
        == targets.unsqueeze(1)
    ).any(
        dim=1
    )

    return float(
        correct.float()
        .mean()
        .item()
    )


# ============================================================
# MODEL EVALUATION
# ============================================================

def evaluate_model(
    model: nn.Module,
    dataloader: DataLoader,
    loss_function: nn.Module,
) -> tuple[
    float,
    dict[str, Any],
    np.ndarray,
    np.ndarray,
]:

    model.eval()

    total_loss = 0.0
    total_samples = 0

    all_true = []
    all_pred = []

    top1_correct = 0
    top3_correct = 0

    with torch.no_grad():

        for x, y in dataloader:

            x = x.to(DEVICE)
            y = y.to(DEVICE)

            logits = model(x)

            loss = loss_function(
                logits,
                y,
            )

            batch_size = y.size(0)

            total_loss += (
                loss.item()
                * batch_size
            )

            total_samples += batch_size

            predictions = torch.argmax(
                logits,
                dim=1,
            )

            all_true.extend(
                y.cpu()
                .numpy()
                .tolist()
            )

            all_pred.extend(
                predictions.cpu()
                .numpy()
                .tolist()
            )

            top1_correct += int(
                (
                    predictions == y
                )
                .sum()
                .item()
            )

            top3 = torch.topk(
                logits,
                k=min(
                    3,
                    NUM_STATES,
                ),
                dim=1,
            ).indices

            top3_correct += int(
                (
                    (
                        top3
                        == y.unsqueeze(1)
                    )
                    .any(dim=1)
                    .sum()
                    .item()
                )
            )

    if total_samples == 0:
        raise ValueError(
            "Evaluation dataloader "
            "contains no samples."
        )

    average_loss = (
        total_loss
        / total_samples
    )

    y_true = np.asarray(
        all_true,
        dtype=np.int64,
    )

    y_pred = np.asarray(
        all_pred,
        dtype=np.int64,
    )

    metrics = calculate_metrics(
        y_true,
        y_pred,
    )

    metrics["loss"] = float(
        average_loss
    )

    metrics["top1_accuracy"] = (
        top1_correct
        / total_samples
    )

    metrics["top3_accuracy"] = (
        top3_correct
        / total_samples
    )

    return (
        float(average_loss),
        metrics,
        y_true,
        y_pred,
    )


# ============================================================
# TRAIN ONE EPOCH
# ============================================================

def train_one_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    optimizer: torch.optim.Optimizer,
    loss_function: nn.Module,
) -> float:

    model.train()

    total_loss = 0.0
    total_samples = 0

    for x, y in dataloader:

        x = x.to(DEVICE)
        y = y.to(DEVICE)

        optimizer.zero_grad(
            set_to_none=True
        )

        logits = model(x)

        loss = loss_function(
            logits,
            y,
        )

        loss.backward()

        # Gradient clipping for stability.
        torch.nn.utils.clip_grad_norm_(
            model.parameters(),
            max_norm=1.0,
        )

        optimizer.step()

        batch_size = y.size(0)

        total_loss += (
            loss.item()
            * batch_size
        )

        total_samples += batch_size

    if total_samples == 0:
        raise ValueError(
            "Training dataloader "
            "contains no samples."
        )

    return (
        total_loss
        / total_samples
    )


# ============================================================
# EPOCH DISPLAY
# ============================================================

def print_epoch_result(
    epoch: int,
    train_loss: float,
    val_loss: float,
    val_metrics: dict[str, Any],
) -> None:

    print(
        f"Epoch {epoch:02d}/{EPOCHS} | "
        f"Train Loss: {train_loss:.4f} | "
        f"Val Loss: {val_loss:.4f} | "
        f"Val Acc: "
        f"{val_metrics['accuracy']:.4f} | "
        f"Val Macro-F1: "
        f"{val_metrics['macro_f1']:.4f}"
    )


# ============================================================
# JSON SAVER
# ============================================================

def save_json(
    path: Path,
    data: dict[str, Any],
) -> None:

    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with path.open(
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            data,
            file,
            indent=2,
        )


# ============================================================
# FINAL MODEL SAVER
# ============================================================

def save_model(
    model: nn.Module,
    optimizer: torch.optim.Optimizer,
    epoch: int,
    validation_metrics: dict[str, Any],
    states: list[str],
) -> Path:

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    model_path = (
        MODEL_DIR
        / "temporal_forecaster.pt"
    )

    checkpoint = {
        "model_state_dict":
            model.state_dict(),

        "optimizer_state_dict":
            optimizer.state_dict(),

        "epoch":
            int(epoch),

        "num_states":
            NUM_STATES,

        "sequence_length":
            SEQUENCE_LENGTH,

        "embedding_dim":
            EMBEDDING_DIM,

        "hidden_dim":
            HIDDEN_DIM,

        "num_layers":
            NUM_LAYERS,

        "dropout":
            DROPOUT,

        "state_names":
            states,

        "seed":
            SEED,

        "validation_metrics":
            validation_metrics,
    }

    torch.save(
        checkpoint,
        model_path,
    )

    return model_path


# ============================================================
# FINAL METRIC DISPLAY
# ============================================================

def print_final_metrics(
    split_name: str,
    metrics: dict[str, Any],
    states: list[str],
) -> None:

    section(
        f"{split_name.upper()} FINAL RESULTS"
    )

    print(
        f"Samples:             "
        f"{metrics['samples']:,}"
    )

    print(
        f"Loss:                "
        f"{metrics['loss']:.4f}"
    )

    print(
        f"Top-1 Accuracy:      "
        f"{metrics['top1_accuracy']:.4f}"
    )

    print(
        f"Top-3 Accuracy:      "
        f"{metrics['top3_accuracy']:.4f}"
    )

    print(
        f"Balanced Accuracy:   "
        f"{metrics['balanced_accuracy']:.4f}"
    )

    print(
        f"Macro Precision:     "
        f"{metrics['macro_precision']:.4f}"
    )

    print(
        f"Macro Recall:        "
        f"{metrics['macro_recall']:.4f}"
    )

    print(
        f"Macro F1:            "
        f"{metrics['macro_f1']:.4f}"
    )

    print(
        f"Weighted F1:         "
        f"{metrics['weighted_f1']:.4f}"
    )

    print()
    print("PER-STATE RESULTS")
    print("-" * 72)

    for state_id, state_name in enumerate(
        states
    ):

        row = metrics[
            "per_class"
        ][
            str(state_id)
        ]

        print(
            f"{state_id}: "
            f"{state_name:<16} "
            f"support={row['support']:>6} | "
            f"precision={row['precision']:.4f} | "
            f"recall={row['recall']:.4f} | "
            f"F1={row['f1']:.4f}"
        )

    print()
    print("CONFUSION MATRIX")
    print("-" * 72)

    print(
        "Rows = actual state, "
        "columns = predicted state"
    )

    header = (
        "       "
        + " ".join(
            f"{i:>6}"
            for i in range(
                NUM_STATES
            )
        )
    )

    print(header)

    for row_id, row in enumerate(
        metrics[
            "confusion_matrix"
        ]
    ):

        print(
            f"{row_id:>5} "
            + " ".join(
                f"{value:>6}"
                for value in row
            )
        )


# ============================================================
# CHECKPOINT LOADING
# ============================================================

def load_checkpoint_safely(
    path: Path,
) -> dict[str, Any]:

    if not path.exists():
        raise FileNotFoundError(
            f"Checkpoint not found:\n{path}"
        )

    try:
        checkpoint = torch.load(
            path,
            map_location=DEVICE,
            weights_only=False,
        )

    except TypeError:
        # Compatibility fallback for PyTorch versions
        # that do not accept weights_only.
        checkpoint = torch.load(
            path,
            map_location=DEVICE,
        )

    if not isinstance(
        checkpoint,
        dict,
    ):
        raise ValueError(
            "Checkpoint does not contain "
            "a dictionary."
        )

    if "model_state_dict" not in checkpoint:
        raise ValueError(
            "Checkpoint is missing "
            "'model_state_dict'."
        )

    return checkpoint


# ============================================================
# PART 3 COMPLETE
# ============================================================
# ============================================================
# PART 4: MAIN TRAINING EXPERIMENT
# ============================================================


def main() -> None:

    # ========================================================
    # HEADER
    # ========================================================

    section(
        "THREATRAKSHAK - "
        "TEMPORAL NEXT-STATE FORECASTER"
    )

    print("Purpose:")
    print(
        "Train a real LSTM model to forecast "
        "the next observed UNSW-NB15 state."
    )

    print()
    print("SAFETY:")
    print(
        "Original datasets will NOT be modified."
    )
    print(
        "Progression artifacts will NOT be modified."
    )
    print(
        "Train/validation/test order will NOT be shuffled."
    )
    print(
        "The test split will only be evaluated "
        "after model selection."
    )

    print()
    print(
        f"Python: {sys.version.split()[0]}"
    )

    print(
        f"PyTorch: {torch.__version__}"
    )

    print(
        f"Device: {DEVICE}"
    )

    # ========================================================
    # VOCABULARY
    # ========================================================

    section(
        "LOADING STATE VOCABULARY"
    )

    states, state_to_id = (
        load_vocabulary()
    )

    print()

    for state_id, state_name in enumerate(
        states
    ):

        print(
            f"{state_id}: {state_name}"
        )

    # ========================================================
    # INPUT ARTIFACTS
    # ========================================================

    section(
        "CHECKING INPUT ARTIFACTS"
    )

    train_artifact = (
        load_progression_artifact(
            TRAIN_FILE,
            "train",
            states,
        )
    )

    validation_artifact = (
        load_progression_artifact(
            VAL_FILE,
            "validation",
            states,
        )
    )

    test_artifact = (
        load_progression_artifact(
            TEST_FILE,
            "test",
            states,
        )
    )

    ok(
        "All three progression artifacts loaded."
    )

    validate_all_artifacts(
        train_artifact,
        validation_artifact,
        test_artifact,
    )

    # ========================================================
    # ARTIFACT SUMMARIES
    # ========================================================

    section(
        "ARTIFACT SUMMARIES"
    )

    print_artifact_summary(
        "train",
        train_artifact,
        states,
    )

    print_artifact_summary(
        "validation",
        validation_artifact,
        states,
    )

    print_artifact_summary(
        "test",
        test_artifact,
        states,
    )

    # ========================================================
    # TEMPORAL DATASETS
    # ========================================================

    section(
        "BUILDING TEMPORAL WINDOWS"
    )

    train_dataset = create_dataset(
        train_artifact,
        "train",
    )

    validation_dataset = create_dataset(
        validation_artifact,
        "validation",
    )

    test_dataset = create_dataset(
        test_artifact,
        "test",
    )

    ok(
        "Temporal windows created "
        "without shuffling."
    )

    # ========================================================
    # DATALOADERS
    # ========================================================

    train_loader = create_dataloader(
        train_dataset
    )

    validation_loader = create_dataloader(
        validation_dataset
    )

    test_loader = create_dataloader(
        test_dataset
    )

    # ========================================================
    # MODEL
    # ========================================================

    section(
        "BUILDING LSTM MODEL"
    )

    model = NextStateLSTM(
        num_states=NUM_STATES,
        embedding_dim=EMBEDDING_DIM,
        hidden_dim=HIDDEN_DIM,
        num_layers=NUM_LAYERS,
        dropout=DROPOUT,
    ).to(DEVICE)

    parameter_count = sum(
        parameter.numel()
        for parameter in model.parameters()
    )

    print(
        f"Model parameters: "
        f"{parameter_count:,}"
    )

    print(
        f"Sequence length:  "
        f"{SEQUENCE_LENGTH}"
    )

    print(
        f"Embedding dim:    "
        f"{EMBEDDING_DIM}"
    )

    print(
        f"Hidden dim:       "
        f"{HIDDEN_DIM}"
    )

    # ========================================================
    # LOSS
    # ========================================================

    class_weights = (
        calculate_class_weights(
            train_dataset
        )
    )

    loss_function = (
        nn.CrossEntropyLoss(
            weight=class_weights
        )
    )

    # ========================================================
    # OPTIMIZER
    # ========================================================

    optimizer = (
        torch.optim.AdamW(
            model.parameters(),
            lr=LEARNING_RATE,
            weight_decay=WEIGHT_DECAY,
        )
    )

    # ========================================================
    # TRAINING
    # ========================================================

    section("TRAINING")

    best_val_macro_f1 = -1.0
    best_epoch = 0
    patience_counter = 0

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    best_checkpoint_path = (
        MODEL_DIR
        / "temporal_forecaster_best.pt"
    )

    # --------------------------------------------------------
    # Remove only our previous BEST checkpoint.
    #
    # This is NOT a progression artifact and does not touch
    # the original datasets.
    #
    # --------------------------------------------------------

    if best_checkpoint_path.exists():
        try:
            best_checkpoint_path.unlink()
        except Exception as exc:
            warning(
                "Could not remove previous best "
                f"checkpoint: {exc}"
            )

    for epoch in range(
        1,
        EPOCHS + 1,
    ):

        train_loss = train_one_epoch(
            model,
            train_loader,
            optimizer,
            loss_function,
        )

        (
            val_loss,
            val_metrics,
            _,
            _,
        ) = evaluate_model(
            model,
            validation_loader,
            loss_function,
        )

        print_epoch_result(
            epoch,
            train_loss,
            val_loss,
            val_metrics,
        )

        current_score = float(
            val_metrics[
                "macro_f1"
            ]
        )

        if current_score > best_val_macro_f1:

            best_val_macro_f1 = (
                current_score
            )

            best_epoch = epoch

            patience_counter = 0

            best_checkpoint = {
                "model_state_dict":
                    model.state_dict(),

                "optimizer_state_dict":
                    optimizer.state_dict(),

                "epoch":
                    epoch,

                "num_states":
                    NUM_STATES,

                "sequence_length":
                    SEQUENCE_LENGTH,

                "embedding_dim":
                    EMBEDDING_DIM,

                "hidden_dim":
                    HIDDEN_DIM,

                "num_layers":
                    NUM_LAYERS,

                "dropout":
                    DROPOUT,

                "state_names":
                    states,

                "state_to_id":
                    state_to_id,

                "seed":
                    SEED,

                "validation_metrics":
                    val_metrics,
            }

            torch.save(
                best_checkpoint,
                best_checkpoint_path,
            )

            print(
                "  -> New best validation "
                f"Macro-F1: "
                f"{best_val_macro_f1:.4f}"
            )

        else:

            patience_counter += 1

            print(
                "  -> No improvement "
                f"({patience_counter}/"
                f"{PATIENCE})"
            )

        if patience_counter >= PATIENCE:

            print()
            print(
                "Early stopping triggered."
            )

            break

    # ========================================================
    # RESTORE BEST MODEL
    # ========================================================

    section(
        "RESTORING BEST MODEL"
    )

    if not best_checkpoint_path.exists():

        raise RuntimeError(
            "Best model checkpoint was "
            "not created."
        )

    checkpoint = (
        load_checkpoint_safely(
            best_checkpoint_path
        )
    )

    model.load_state_dict(
        checkpoint[
            "model_state_dict"
        ]
    )

    best_epoch = int(
        checkpoint[
            "epoch"
        ]
    )

    ok(
        "Restored best model from "
        f"epoch {best_epoch}."
    )

    # ========================================================
    # VALIDATION EVALUATION
    # ========================================================

    section(
        "FINAL VALIDATION EVALUATION"
    )

    (
        val_loss,
        val_metrics,
        _,
        _,
    ) = evaluate_model(
        model,
        validation_loader,
        loss_function,
    )

    val_metrics["loss"] = (
        float(val_loss)
    )

    print_final_metrics(
        "validation",
        val_metrics,
        states,
    )

    # ========================================================
    # FINAL TEST EVALUATION
    #
    # IMPORTANT:
    # This happens only after model selection.
    # ========================================================

    section(
        "FINAL TEST EVALUATION"
    )

    (
        test_loss,
        test_metrics,
        y_true,
        y_pred,
    ) = evaluate_model(
        model,
        test_loader,
        loss_function,
    )

    test_metrics["loss"] = (
        float(test_loss)
    )

    print_final_metrics(
        "test",
        test_metrics,
        states,
    )

    # ========================================================
    # SAVE FINAL MODEL
    # ========================================================

    final_model_path = save_model(
        model=model,
        optimizer=optimizer,
        epoch=best_epoch,
        validation_metrics=val_metrics,
        states=states,
    )

    # ========================================================
    # SAVE EVALUATION JSON
    # ========================================================

    evaluation = {

        "experiment": {

            "name":
                "ThreatRakshak Temporal "
                "Next-State Forecasting",

            "task":
                "Predict next observed "
                "UNSW-NB15 attack-category state",

            "model":
                "Embedding + LSTM + "
                "Linear classifier",

            "sequence_length":
                SEQUENCE_LENGTH,

            "seed":
                SEED,

            "device":
                str(DEVICE),

            "epochs_requested":
                EPOCHS,

            "best_epoch":
                best_epoch,

            "batch_size":
                BATCH_SIZE,

            "learning_rate":
                LEARNING_RATE,

            "weight_decay":
                WEIGHT_DECAY,

            "no_shuffle":
                True,

            "original_datasets_modified":
                False,

            "progression_artifacts_modified":
                False,
        },

        "state_vocabulary": {
            str(index): name
            for index, name
            in enumerate(states)
        },

        "dataset_sizes": {

            "train_temporal_samples":
                len(train_dataset),

            "validation_temporal_samples":
                len(validation_dataset),

            "test_temporal_samples":
                len(test_dataset),
        },

        "validation":
            val_metrics,

        "test":
            test_metrics,
    }

    evaluation_path = (
        MODEL_DIR
        / "temporal_forecaster_evaluation.json"
    )

    save_json(
        evaluation_path,
        evaluation,
    )

    # ========================================================
    # SAVE TRAINING CONFIGURATION
    # ========================================================

    config = {

        "seed":
            SEED,

        "sequence_length":
            SEQUENCE_LENGTH,

        "num_states":
            NUM_STATES,

        "embedding_dim":
            EMBEDDING_DIM,

        "hidden_dim":
            HIDDEN_DIM,

        "num_layers":
            NUM_LAYERS,

        "dropout":
            DROPOUT,

        "batch_size":
            BATCH_SIZE,

        "epochs":
            EPOCHS,

        "learning_rate":
            LEARNING_RATE,

        "weight_decay":
            WEIGHT_DECAY,

        "patience":
            PATIENCE,

        "device":
            str(DEVICE),

        "state_names":
            states,

        "state_to_id":
            state_to_id,

        "train_artifact":
            str(TRAIN_FILE),

        "validation_artifact":
            str(VAL_FILE),

        "test_artifact":
            str(TEST_FILE),
    }

    config_path = (
        MODEL_DIR
        / "temporal_forecaster_config.json"
    )

    save_json(
        config_path,
        config,
    )

    # ========================================================
    # SAVE MODEL CARD
    # ========================================================

    model_card_path = (
        MODEL_DIR
        / "MODEL_CARD.txt"
    )

    with model_card_path.open(
        "w",
        encoding="utf-8",
    ) as file:

        file.write(
            "THREATRAKSHAK TEMPORAL "
            "NEXT-STATE FORECASTER\n"
        )

        file.write(
            "=" * 60
            + "\n\n"
        )

        file.write(
            "Purpose\n"
        )

        file.write(
            "-------\n"
        )

        file.write(
            "Forecast the next observed "
            "UNSW-NB15 attack-category "
            "state from a short ordered "
            "history of previous states.\n\n"
        )

        file.write(
            "Important terminology\n"
        )

        file.write(
            "---------------------\n"
        )

        file.write(
            "The nine UNSW-NB15 attack "
            "categories are used as network-state "
            "labels for this experiment.\n"
        )

        file.write(
            "They are NOT automatically treated "
            "as MITRE ATT&CK stages.\n\n"
        )

        file.write(
            "Model\n"
        )

        file.write(
            "-----\n"
        )

        file.write(
            "Embedding -> LSTM -> "
            "Linear classifier\n"
        )

        file.write(
            f"Sequence length: "
            f"{SEQUENCE_LENGTH}\n"
        )

        file.write(
            f"Best epoch: "
            f"{best_epoch}\n"
        )

        file.write(
            f"Seed: "
            f"{SEED}\n\n"
        )

        file.write(
            "Data handling\n"
        )

        file.write(
            "-------------\n"
        )

        file.write(
            "Chronological train/validation/test "
            "progression artifacts were used.\n"
        )

        file.write(
            "No random shuffling was performed.\n"
        )

        file.write(
            "Original datasets were not modified.\n"
        )

        file.write(
            "Progression artifacts were not modified.\n\n"
        )

        file.write(
            "Validation results\n"
        )

        file.write(
            "------------------\n"
        )

        file.write(
            f"Accuracy: "
            f"{val_metrics['accuracy']:.6f}\n"
        )

        file.write(
            "Balanced Accuracy: "
            f"{val_metrics['balanced_accuracy']:.6f}\n"
        )

        file.write(
            f"Macro F1: "
            f"{val_metrics['macro_f1']:.6f}\n\n"
        )

        file.write(
            "Test results\n"
        )

        file.write(
            "------------\n"
        )

        file.write(
            f"Accuracy: "
            f"{test_metrics['accuracy']:.6f}\n"
        )

        file.write(
            "Balanced Accuracy: "
            f"{test_metrics['balanced_accuracy']:.6f}\n"
        )

        file.write(
            f"Macro F1: "
            f"{test_metrics['macro_f1']:.6f}\n"
        )

        file.write(
            f"Weighted F1: "
            f"{test_metrics['weighted_f1']:.6f}\n"
        )

        file.write(
            f"Top-3 Accuracy: "
            f"{test_metrics['top3_accuracy']:.6f}\n\n"
        )

        file.write(
            "Interpretation warning\n"
        )

        file.write(
            "----------------------\n"
        )

        file.write(
            "These results measure next-state "
            "forecasting within the prepared "
            "UNSW-NB15 progression representation.\n"
        )

        file.write(
            "They should not be described as proof "
            "of real-world attack prediction without "
            "additional validation.\n"
        )

    # ========================================================
    # FINAL OUTPUT
    # ========================================================

    section(
        "TEMPORAL FORECASTING "
        "EXPERIMENT COMPLETE"
    )

    print("SUCCESS.")
    print()

    print(
        "Created model artifacts:"
    )

    print(
        f"  {final_model_path}"
    )

    print(
        f"  {evaluation_path}"
    )

    print(
        f"  {config_path}"
    )

    print(
        f"  {model_card_path}"
    )

    print()

    print(
        "Original UNSW-NB15 datasets "
        "were NOT modified."
    )

    print(
        "Progression artifacts "
        "were NOT modified."
    )

    print(
        "No data shuffling was performed."
    )

    print()

    print(
        "The next step is to inspect the "
        "REAL test metrics before connecting "
        "the model to the dashboard."
    )


# ============================================================
# SAFE PROGRAM ENTRY
# ============================================================

if __name__ == "__main__":

    try:

        main()

    except KeyboardInterrupt:

        print()
        separator("=")

        print(
            "EXPERIMENT INTERRUPTED BY USER"
        )

        separator("=")

        warning(
            "Training was interrupted."
        )

        print(
            "No original dataset was modified."
        )

        print(
            "No progression artifact was intentionally modified."
        )

        sys.exit(130)

    except Exception as exc:

        print()
        separator("=")

        print(
            "EXPERIMENT STOPPED SAFELY"
        )

        separator("=")

        fail(
            f"{type(exc).__name__}: {exc}"
        )

        print()

        print(
            "No original dataset was modified."
        )

        print(
            "No progression artifact was intentionally modified."
        )

        print()    

        sys.exit(1)

