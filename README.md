# 🛡️ ThreatRakshak

## Temporal Network Threat Detection & Attack Forecasting Platform

> **Observe. Understand. Forecast.**

ThreatRakshak is a cybersecurity-focused Security Operations Center (SOC) platform designed to analyze network attack-state progression and forecast the **next likely attack-category state** using a trained temporal deep-learning model.

The platform brings together **Cybersecurity + Machine Learning + Temporal Forecasting + MITRE ATT&CK + SOC Visualization** into one interactive and deployable solution.

---

## 🚀 Live Project

### 🌐 Live Prototype
https://threat-rakshak-sih-2026.vercel.app

### 🧠 Live Model API
https://threatrakshak.onrender.com

### 📦 GitHub Repository
https://github.com/25A31A05KF/ThreatRakshak_SIH2026

---

# 🎯 The Problem

Modern Security Operations Centers generate enormous amounts of network telemetry and security events.

Traditional security dashboards mainly answer:

> **"What is happening right now?"**

But cybersecurity teams also need to understand:

> **"Based on the sequence of events observed so far, what attack state could occur next?"**

ThreatRakshak explores this temporal forecasting problem by transforming observed attack categories into sequential states and using a trained LSTM-based model to forecast the next state.

The core idea is:

    Detection
        ↓
    Attack-State Understanding
        ↓
    Temporal Sequence Analysis
        ↓
    Next-State Forecasting
        ↓
    Security Intelligence

---

# 💡 Our Solution

ThreatRakshak converts controlled network telemetry into standardized attack-category states.

The system collects an **8-state temporal sequence** and sends it to a trained PyTorch Temporal Forecaster.

The model predicts the next likely state from **9 UNSW-NB15 attack categories** and provides:

- Predicted next state
- Model confidence
- Probability distribution across all states
- MITRE ATT&CK-oriented interpretation

The result is then presented through an interactive SOC dashboard.

---

# 🧠 Core Intelligence

The main machine-learning pipeline is:

    Controlled Network Telemetry
                │
                ▼
       Telemetry Normalization
                │
                ▼
      Attack-Category State Mapping
                │
                ▼
          8-State Sequence
                │
                ▼
          State Embedding
                │
                ▼
               LSTM
                │
                ▼
         Linear Classifier
                │
                ▼
       Next-State Prediction
                │
          ┌─────┴─────┐
          ▼           ▼
     Probability    MITRE ATT&CK
     Distribution   Interpretation
          │           │
          └─────┬─────┘
                ▼
          SOC Dashboard

---

# 🔬 Machine Learning Model

ThreatRakshak uses a temporal forecasting architecture based on:

### Embedding + LSTM + Linear Classifier

The model receives the previous **8 observed attack-category states** and predicts the next state.

## Model Configuration

| Parameter | Value |
|---|---|
| Model | Temporal Forecaster |
| Architecture | Embedding + LSTM + Linear Classifier |
| Dataset | UNSW-NB15 |
| Sequence Length | 8 |
| Number of States | 9 |
| Epochs | 30 |
| Batch Size | 128 |
| Learning Rate | 0.001 |
| Weight Decay | 0.0001 |
| Random Seed | 42 |
| Device | CPU |
| Shuffle | Disabled |

---

# 🧩 Attack States

The forecasting model currently works with the following 9 UNSW-NB15 categories:

    analysis
    backdoor
    dos
    exploits
    fuzzers
    generic
    reconnaissance
    shellcode
    worms

These categories form the state vocabulary used by the temporal forecasting pipeline.

---

# 📊 Model Validation

The temporal forecasting model was evaluated using separate training, validation, and test samples.

## Dataset Split

| Split | Temporal Samples |
|---|---:|
| Training | 20,387 |
| Validation | 4,362 |
| Test | 4,363 |

## Test Performance

| Metric | Result |
|---|---:|
| Top-1 Accuracy | **93.61%** |
| Top-3 Accuracy | **98.56%** |
| Balanced Accuracy | **33.67%** |
| Macro Precision | **~33.8%** |
| Macro Recall | **33.67%** |
| Macro F1 | **~33.4%** |
| Weighted F1 | **92.94%** |

## Why Multiple Metrics?

Cybersecurity datasets can contain significant class imbalance.

Therefore, ThreatRakshak does not rely only on overall accuracy.

The project also considers:

- Balanced accuracy
- Macro precision
- Macro recall
- Macro F1
- Weighted F1
- Confusion matrix
- Per-class performance
- Top-3 accuracy

This provides a more transparent view of model behavior across common and less frequent attack categories.

---

# 📚 Dataset

ThreatRakshak uses the **UNSW-NB15** cybersecurity dataset as the basis for attack-category state modeling.

The dataset contains network-security observations representing multiple categories of benign and malicious activity.

ThreatRakshak transforms relevant observations into temporal attack-state sequences for next-state forecasting.

## Categories Used

    Analysis
    Backdoor
    DoS
    Exploits
    Fuzzers
    Generic
    Reconnaissance
    Shellcode
    Worms

---

# 🔮 Temporal Forecasting

One of the central concepts of ThreatRakshak is **next-state forecasting**.

Instead of treating every network event independently, the system considers the sequence of previous states.

For example, an 8-state sequence can be represented as:

    generic
    generic
    reconnaissance
    reconnaissance
    reconnaissance
    reconnaissance
    reconnaissance
    reconnaissance

This sequence is provided to the Temporal Forecaster.

The model then produces a prediction such as:

    Predicted Next State
            ↓
         analysis

along with a probability distribution across all 9 possible states.

This allows the dashboard to visualize both the predicted state and the uncertainty associated with the prediction.

---

# 🗺️ MITRE ATT&CK Interpretation

ThreatRakshak includes a MITRE ATT&CK-oriented interpretation layer.

The predicted attack category can be associated with relevant attack lifecycle stages to make the model output easier to understand from a cybersecurity perspective.

The interpretation pipeline is:

    Model Prediction
          ↓
    Attack Category
          ↓
    MITRE ATT&CK Interpretation
          ↓
    Security Context

### Important Design Principle

The MITRE ATT&CK information is an **interpretation layer** associated with the model output.

It is not treated as direct ground truth produced by the neural network.

---

# 🌐 System Architecture

ThreatRakshak uses a cloud-connected architecture:

    ┌───────────────────────────────────────┐
    │           ThreatRakshak UI            │
    │          React + TypeScript           │
    │                Vite                   │
    └───────────────────┬───────────────────┘
                        │
                        │ HTTPS
                        ▼
    ┌───────────────────────────────────────┐
    │             Flask REST API            │
    │               Render                  │
    └───────────────────┬───────────────────┘
                        │
                        ▼
    ┌───────────────────────────────────────┐
    │        PyTorch Temporal Forecaster    │
    │             Embedding + LSTM           │
    └───────────────────┬───────────────────┘
                        │
                        ▼
    ┌───────────────────────────────────────┐
    │       Prediction + Probabilities      │
    │          + MITRE Interpretation        │
    └───────────────────────────────────────┘

## Deployment

| Component | Technology |
|---|---|
| Frontend | React + Vite |
| Frontend Hosting | Vercel |
| Backend | Flask |
| Backend Hosting | Render |
| ML Framework | PyTorch |
| Source Control | GitHub |

---

# 🔌 Real Model Inference API

ThreatRakshak includes a real Python inference backend rather than relying exclusively on frontend calculations.

## Health Endpoint

    GET /health

Example response:

    {
      "mode": "REAL_MODEL_INFERENCE",
      "model_loaded": true,
      "status": "healthy"
    }

## Prediction Endpoint

    POST /predict

Example request:

    {
      "sequence": [
        "generic",
        "generic",
        "reconnaissance",
        "reconnaissance",
        "reconnaissance",
        "reconnaissance",
        "reconnaissance",
        "reconnaissance"
      ]
    }

The API returns:

- Model mode
- Model name
- Input sequence
- Predicted next state
- Confidence
- Probability distribution
- MITRE interpretation

---

# 🖥️ SOC Dashboard

ThreatRakshak provides an interactive SOC-style interface designed to make complex security information easier to understand.

## 📌 Overview

The Overview dashboard provides:

- Overall risk score
- Active threats
- Predicted threats
- Network health
- Network topology
- Simulated network telemetry
- Threat detection
- Attack-stage progression
- Temporal forecasting
- Threat timeline
- Security alerts

---

# 🔮 Predictions Dashboard

The Predictions section focuses on the machine-learning forecasting pipeline.

It displays:

- Model status
- Real model inference status
- Predicted next state
- Model confidence
- 8-state model input sequence
- Probability distribution
- MITRE ATT&CK interpretation
- Prediction horizon
- Forecast explanation

The complete flow is:

    8 Observed States
            ↓
    Temporal Forecaster
            ↓
    Predicted Next State
            ↓
        Confidence
            ↓
    Probability Distribution
            ↓
    MITRE Interpretation

---

# 📊 Validation Dashboard

The Validation section provides visibility into model performance.

It includes:

- Top-1 Accuracy
- Top-3 Accuracy
- Balanced Accuracy
- Macro Precision
- Macro Recall
- Macro F1
- Weighted F1
- Confusion Matrix
- Per-Class Performance
- Dataset Split Information

This allows evaluators to inspect the model rather than relying on a single performance number.

---

# 🧠 Threat Intelligence Dashboard

The Threat Intelligence section provides prototype visualizations for:

- Recent threat events
- Risk distribution
- Attack categories
- MITRE ATT&CK stage distribution

These visualizations are currently based on controlled prototype/demo data and are not presented as live enterprise network intelligence.

---

# 🌐 Network Dashboard

The Network section provides:

- Network topology
- Node status
- Node inventory
- Traffic-volume history
- Simulated network telemetry

The current traffic data is generated as part of the controlled demonstration environment.

---

# ⚙️ Controlled Simulation

The current public prototype uses controlled simulated telemetry to demonstrate the complete forecasting pipeline.

The simulation provides a repeatable environment for demonstrating model integration and dashboard behavior without requiring a live enterprise network.

The current demonstration pipeline is:

    Controlled Simulation
            ↓
    Attack-State Sequence
            ↓
    Trained Temporal Model
            ↓
    Real API Inference
            ↓
    SOC Visualization

The model inference itself is performed by the deployed PyTorch model.

---

# 🚨 Risk Visualization

ThreatRakshak includes a SOC-oriented risk presentation layer.

The dashboard visualizes:

- Risk score
- Risk level
- Active threats
- Predicted threats
- Network health
- Security alerts
- Forecast confidence

The risk presentation is designed for demonstration and situational awareness.

It should not be interpreted as a production incident-severity engine.

---

# 🛠️ Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Component-based UI
- Data visualization

## Machine Learning

- Python
- PyTorch
- LSTM
- Embedding layers
- NumPy
- UNSW-NB15

## Backend

- Flask
- Flask-CORS
- Gunicorn
- REST API

## Deployment

- GitHub
- Vercel
- Render

## Cybersecurity

- UNSW-NB15 attack categories
- MITRE ATT&CK interpretation
- Temporal attack-state forecasting
- SOC visualization

---

# 📁 Repository Structure

    ThreatRakshak_SIH2026/
    │
    ├── backend/
    │   ├── app.py
    │   └── requirements.txt
    │
    ├── ml/
    │   ├── artifacts/
    │   │   ├── models/
    │   │   │   ├── temporal_forecaster_best.pt
    │   │   │   └── temporal_forecaster_config.json
    │   │   │
    │   │   └── mitre_stage_mapping.json
    │   │
    │   └── training / evaluation scripts
    │
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── simulation.ts
    │   ├── useSimulation.ts
    │   ├── modelApi.ts
    │   └── types.ts
    │
    ├── public/
    │
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── README.md

---

# 🔄 End-to-End Workflow

    ┌─────────────────────────┐
    │ Start ThreatRakshak     │
    └────────────┬────────────┘
                 ▼
    ┌─────────────────────────┐
    │ Controlled Telemetry    │
    │ Simulation              │
    └────────────┬────────────┘
                 ▼
    ┌─────────────────────────┐
    │ Attack-State Mapping    │
    └────────────┬────────────┘
                 ▼
    ┌─────────────────────────┐
    │ Collect 8 States        │
    └────────────┬────────────┘
                 ▼
    ┌─────────────────────────┐
    │ Send Sequence to API    │
    └────────────┬────────────┘
                 ▼
    ┌─────────────────────────┐
    │ PyTorch LSTM Inference  │
    └────────────┬────────────┘
                 ▼
    ┌─────────────────────────┐
    │ Predict Next State      │
    └────────────┬────────────┘
                 ▼
           ┌─────┴─────┐
           ▼           ▼
    ┌────────────┐ ┌───────────────┐
    │ Probability│ │ MITRE ATT&CK  │
    │ Distribution│ │ Interpretation│
    └──────┬─────┘ └───────┬───────┘
           │               │
           └───────┬───────┘
                   ▼
    ┌─────────────────────────┐
    │ SOC Dashboard           │
    │ Visualization           │
    └─────────────────────────┘

---

# ⭐ Key Features

| Feature | Description |
|---|---|
| 🔮 Temporal Forecasting | Forecasts the next attack-category state |
| 🧠 LSTM Model | Learns sequential relationships between attack states |
| 8-State Context | Uses the previous 8 states as model input |
| 📊 Probability Distribution | Displays probabilities for all 9 model states |
| 🗺️ MITRE Interpretation | Provides security-oriented interpretation |
| 🚨 SOC Dashboard | Centralized security visualization |
| 🌐 Public Model API | Deployed Flask inference service |
| 📈 Validation | Includes multiple evaluation metrics |
| 🧪 Controlled Simulation | Reproducible demonstration environment |
| ☁️ Cloud Deployment | Frontend and backend deployed independently |
| 🔍 Transparent Scope | Clearly distinguishes prototype simulation from live telemetry |

---

# 🔐 Key Engineering Considerations

## 1. Temporal Drift

Cybersecurity attack behavior changes over time.

A forecasting model trained on historical data may encounter patterns that differ from its training distribution.

### Future direction

- Periodic retraining
- Distribution monitoring
- Newer cybersecurity datasets
- Concept-drift detection
- Continuous evaluation

## 2. Class Imbalance

Cybersecurity datasets can contain highly unequal numbers of examples across attack categories.

ThreatRakshak therefore reports multiple evaluation metrics instead of relying only on accuracy.

### Future direction

- Improved minority-class representation
- Class-aware training strategies
- Additional cybersecurity datasets
- More comprehensive temporal evaluation

## 3. False Forecasts

A forecast is probabilistic.

A predicted state does not guarantee that the corresponding attack will actually occur.

ThreatRakshak therefore presents:

- Confidence
- Probability distribution
- Validation metrics
- Model limitations

rather than presenting predictions as certain future behavior.

---

# 🧪 Current Prototype Scope

## Implemented

- [x] SOC dashboard
- [x] Controlled network telemetry simulation
- [x] Attack-state mapping
- [x] 8-state temporal sequence generation
- [x] PyTorch Temporal Forecaster
- [x] Real model inference
- [x] Flask REST API
- [x] Probability distribution
- [x] MITRE interpretation layer
- [x] Model validation dashboard
- [x] Confusion matrix
- [x] Per-class evaluation
- [x] Vercel frontend deployment
- [x] Render model API deployment
- [x] Frontend-to-backend model integration

## Planned

- [ ] Live packet capture
- [ ] Real network-flow ingestion
- [ ] SIEM integration
- [ ] Streaming telemetry pipeline
- [ ] Automated feature extraction
- [ ] Multi-step attack forecasting
- [ ] Online model updating
- [ ] Concept-drift detection
- [ ] Automated incident-response workflows
- [ ] Production-scale SOC integration

---

# 🚀 Future Roadmap

## Phase 1 — Intelligent Prototype

    ✓ SOC Dashboard
    ✓ Controlled Telemetry
    ✓ Temporal Forecasting
    ✓ Model API
    ✓ Cloud Deployment
    ✓ Validation Dashboard

## Phase 2 — Live Network Intelligence

    Live Network Traffic
            ↓
    Packet / Flow Collection
            ↓
    Feature Extraction
            ↓
    Attack-State Mapping
            ↓
    Temporal Forecasting

## Phase 3 — Advanced Forecasting

    Single-Step Forecast
            ↓
    Multi-Step Forecast
            ↓
    Attack-Chain Forecasting
            ↓
    Temporal Risk Analysis

## Phase 4 — SOC Integration

    ThreatRakshak
          ↓
        SIEM
          ↓
    Threat Intelligence
          ↓
    Alert Correlation
          ↓
    Analyst Investigation
          ↓
    Response Recommendation

---

# 🏆 Why ThreatRakshak?

ThreatRakshak explores a shift from traditional alert-centric monitoring toward **temporal cybersecurity intelligence**.

Instead of asking only:

> **"What is happening?"**

ThreatRakshak asks:

> **"Given the sequence of attack states observed so far, what state could come next?"**

The project brings together:

    Cybersecurity
          +
    Machine Learning
          +
    Temporal Modeling
          +
    Network Telemetry
          +
    MITRE ATT&CK
          +
    SOC Visualization
          =
    ThreatRakshak

The objective is not to replace cybersecurity analysts.

The objective is to provide an additional **temporal intelligence layer** that can help analysts understand attack progression and investigate potential next states.

---

# 👥 Team ThreatRakshak

## Smart India Hackathon 2026

| Name | Role |
|---|---|
| **V.B. Kumar** | Team Leader |
| **A.D.V.S. Karthik** | Team Member |
| **P. Usha** | Team Member |
| **P. Bhuvana Sri** | Team Member |
| **G. Malleswari** | Team Member |
| **L.S.V. Reddy** | Team Member |

### Our Team

We are a six-member student team working collaboratively across:

- Problem analysis
- Cybersecurity research
- Machine learning
- Temporal modeling
- Frontend development
- Backend engineering
- UI/UX
- Testing
- Deployment
- Documentation
- Presentation

Our goal was to transform the problem statement into a **working, demonstrable, measurable, and deployable prototype** rather than limiting the solution to a conceptual design.

---

# 🏫 Smart India Hackathon 2026

**Hackathon:** Smart India Hackathon 2026

**Problem Statement:** SIH26153

**Team Name:** ThreatRakshak

**Category:** Software

**Domain:** Cybersecurity / Network Security

**Project:** Temporal Network Threat Detection & Attack Forecasting Platform

---

# 🧑‍💻 Development Journey

ThreatRakshak was developed as an end-to-end system rather than as a standalone frontend demonstration.

The development journey included:

    Problem Analysis
          ↓
    System Design
          ↓
    Dataset Analysis
          ↓
    Temporal Sequence Construction
          ↓
    Model Training
          ↓
    Model Evaluation
          ↓
    Flask API Development
          ↓
    Frontend Integration
          ↓
    Controlled Simulation
          ↓
    Cloud Deployment
          ↓
    End-to-End Testing

---

# 🔬 Reproducibility

The project uses:

- Defined temporal sequence length
- Fixed random seed
- Documented model configuration
- Separate training, validation, and test samples
- Saved model artifacts
- Dedicated evaluation artifacts

The repository contains the implemented application source code, backend inference service, model configuration, and relevant model artifacts.

Original third-party datasets are not redistributed through this repository.

---

# ⚠️ Limitations & Responsible Use

ThreatRakshak is currently an academic and hackathon prototype.

The public demonstration uses controlled simulated telemetry connected to a trained temporal forecasting model.

The current system does **not** claim to perform live enterprise network monitoring.

The following capabilities remain part of the future roadmap:

- Live packet capture
- Production network telemetry ingestion
- SIEM integration
- Automated incident response
- Continuous production retraining

Model predictions are probabilistic and should not be interpreted as guaranteed future attacks.

The MITRE ATT&CK information shown by the dashboard is an interpretation layer and should not be treated as direct ground truth.

---

# 🙏 Acknowledgements

We would like to acknowledge the technologies, datasets, frameworks, and communities that supported this project:

- Smart India Hackathon
- UNSW-NB15
- MITRE ATT&CK
- PyTorch
- Flask
- React
- Vite
- NumPy
- GitHub
- Vercel
- Render
- Open-source cybersecurity and machine-learning communities

---

# 📌 Project Status

    ╔══════════════════════════════════════════╗
    ║          THREATRAKSHAK STATUS            ║
    ╠══════════════════════════════════════════╣
    ║ Frontend              ✅ READY            ║
    ║ SOC Dashboard         ✅ READY            ║
    ║ ML Model              ✅ TRAINED          ║
    ║ Model Validation      ✅ AVAILABLE        ║
    ║ Real Model Inference  ✅ CONNECTED        ║
    ║ Flask API             ✅ DEPLOYED         ║
    ║ Probability Output    ✅ AVAILABLE        ║
    ║ MITRE Interpretation  ✅ AVAILABLE        ║
    ║ Cloud Deployment      ✅ ACTIVE           ║
    ║ Live Packet Capture   ⏳ FUTURE           ║
    ╚══════════════════════════════════════════╝

---

# 🔗 Project Links

🌐 **Live Prototype:**  
https://threat-rakshak-sih-2026.vercel.app

🧠 **Model API:**  
https://threatrakshak.onrender.com

📦 **GitHub Repository:**  
https://github.com/25A31A05KF/ThreatRakshak_SIH2026

---

# 🛡️ ThreatRakshak

## Observe. Understand. Forecast.

> **Built for Smart India Hackathon 2026**
>
> **Cybersecurity × Machine Learning × Temporal Intelligence**
