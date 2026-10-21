# Model Card: FinGuard AI Fraud Detection Ensemble

## 1. Model Details
- **Model Name:** FinGuard Extreme Gradient Booster
- **Model Version:** `finguard-xgb-v1.0`
- **Architecture:** XGBoost (Extreme Gradient Boosting) Classifier with calibrated `scale_pos_weight`
- **Trained By:** FinGuard AI Machine Learning Pipeline (`app.ml.train_fraud`)
- **License:** CC BY 4.0 (Aligned with European Cardholders Fraud Benchmark)
- **Model Date:** October 2026

---

## 2. Intended Use
- **Primary Domain:** Real-time financial transaction fraud scoring and decision support for banking fraud analysts.
- **Intended Users:** Risk analysts, fraud compliance officers, and automated payment gateways.
- **Out-of-Scope Use:** Autonomous account termination, real money movement blocking, or automated credit scoring without human oversight.

---

## 3. Training & Validation Data
- **Dataset Provenance:** Derived benchmark based on European Cardholders Credit Card Fraud distribution.
- **Total Records:** 15,000 synthetic transactions.
- **Positive Rate (Class Imbalance):** 1.8% positive (fraud) instances, reflecting real-world financial transaction distributions.
- **Partitioning Strategy (Zero Data Leakage):**
  - **Training Partition (70%):** 10,500 samples (189 Fraud). Preprocessors (`StandardScaler`, `OneHotEncoder`) fitted strictly on this split.
  - **Validation Partition (15%):** 2,250 samples (40 Fraud). Used exclusively for decision threshold tuning.
  - **Held-Out Test Partition (15%):** 2,250 samples (41 Fraud). Held strictly blind until final metric reporting.

---

## 4. Evaluation Results on Held-Out Test Set

| Metric | Baseline (Logistic Regression) | Champion Model (XGBoost) | Operational Impact |
|---|---|---|---|
| **PR-AUC** | 0.9994 | **0.9994** | Area under Precision-Recall Curve |
| **ROC-AUC** | 1.0000 | **1.0000** | True Positive vs False Positive trade-off |
| **Precision** | 0.9756 | **0.9756** | 97.6% of flagged alerts are genuine fraud |
| **Recall** | 0.9756 | **0.9756** | Intercepts 97.6% of fraudulent activity |
| **F1-Score** | 0.9756 | **0.9756** | Harmonic mean of precision & recall |
| **Threshold** | 0.5000 | **0.6500** | Selected via Validation F1-maximization |

### Confusion Matrix on Unseen Held-Out Test Data (N = 2,250)
- **True Negatives (TN):** 2,208 (Legitimate transactions correctly approved)
- **False Positives (FP):** 1 (Type I error — false alarm)
- **False Negatives (FN):** 1 (Type II error — missed fraud)
- **True Positives (TP):** 40 (Fraudulent transactions correctly intercepted)

---

## 5. Feature Importances (Top Risk Predictors)
1. `amount_to_avg_ratio`: Ratio of current transaction amount to customer's 30-day baseline spend.
2. `velocity_1h`: Number of transactions initiated across the preceding 60 minutes.
3. `ip_risk_score`: Originating IP / proxy risk indicator.
4. `hour`: Transaction hour of day (overnight anomaly clusters).
5. `is_international`: Cross-border foreign settlement flag.
6. `merchant_category_Crypto/Gaming` & `Electronics`: Elevated chargeback sector multipliers.

---

## 6. Limitations & Governance
- **Synthetic Benchmark:** Training data is derived from benchmark distributions and does not contain live customer PII.
- **Concept Drift:** Payment patterns evolve across shopping seasons (e.g., Black Friday). Production systems require scheduled model retraining and drift monitoring.
- **Human Oversight:** Predictions are advisory alerts for the investigation review queue and do not initiate real bank account freezes.
