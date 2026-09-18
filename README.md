# 🛡️ ThreatRakshak
### Temporal Network Threat Detection & Attack Forecasting Platform

> **From detecting what happened to forecasting what may happen next.**

ThreatRakshak is a cybersecurity-focused SOC dashboard designed to help security teams understand network attack progression and forecast the **next likely attack-category state** using a trained temporal deep-learning model.

The platform combines:

- 🌐 Network telemetry simulation
- 🧠 Temporal Machine Learning
- 📊 SOC-style security visualization
- 🔮 Next-state attack forecasting
- 🗺️ MITRE ATT&CK interpretation
- 🚨 Risk and threat monitoring
- ☁️ Cloud-deployed model inference

---

## 🚀 Live Prototype

### 🌐 Interactive Demo
**Live Prototype:** `YOUR_VERCEL_LIVE_URL`

### 🧠 Model API
**Model API:** `YOUR_RENDER_API_URL`

### 📦 GitHub Repository
**Source Code:** `YOUR_GITHUB_REPOSITORY_URL`

> The live prototype is connected to a deployed Flask inference API running the trained PyTorch Temporal Forecaster.

---

# 🎯 Problem Statement

Modern Security Operations Centers generate large amounts of network telemetry. Detecting an ongoing suspicious event is important, but security teams also need to understand:

> **"What attack state is likely to occur next?"**

Traditional dashboards often focus primarily on current alerts and historical events.

ThreatRakshak explores a temporal forecasting approach where a sequence of observed attack-category states is provided to a trained model, which predicts the **next state in the attack progression**.

This enables a transition from:

**Detection → Understanding → Temporal Forecasting → Security Awareness**

---

# 💡 Our Solution

ThreatRakshak converts simulated network telemetry into a sequence of standardized attack-category states and feeds an **8-state temporal sequence** into a trained PyTorch model.

The model predicts the next likely state from **9 UNSW-NB15 attack categories**.

### 🔄 Core Pipeline

```text
Simulated Network Telemetry
            │
            ▼
   Telemetry Normalization
            │
            ▼
   Attack-Category Mapping
            │
            ▼
     8-State Sequence
            │
            ▼
 Embedding + LSTM + Linear
      Temporal Forecaster
            │
            ▼
   Next-State Prediction
            │
            ├───────────────┐
            ▼               ▼
 Probability Distribution   MITRE ATT&CK
                            Interpretation
            │               │
            └───────┬───────┘
                    ▼
             SOC Dashboard
