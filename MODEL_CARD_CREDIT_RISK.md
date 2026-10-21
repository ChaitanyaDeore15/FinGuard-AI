# Model Card: FinGuard AI Credit Risk & Default Assessment

## 1. Model Details
- **Model Name:** Credit Default Risk Gradients
- **Model Version:** `credit-risk-xgb-v1.0`
- **Architecture:** XGBoost Classifier with probability calibration
- **Trained By:** FinGuard AI Machine Learning Pipeline (`app.ml.train_credit`)
- **License:** Open Data Commons / CC BY 4.0 (Aligned with UCI Machine Learning Repository Default Credit dataset)
- **Model Date:** October 2026

---

## 2. Intended Use
- **Primary Domain:** Retail credit risk underwriting, estimating probability of default (PD) within 30 days of application.
- **Intended Users:** Credit risk officers, loan underwriting teams, and retail lending analysts.
- **Out-of-Scope Use:** Real automated lending approvals or rejections without human underwriting verification.

---

## 3. Training & Validation Data
- **Dataset Provenance:** Derived benchmark aligned with the UCI Default of Credit Card Clients Dataset.
- **Total Records:** 10,000 credit applicant files.
- **Default Base Rate:** 22.0% default rate.
- **Partitioning Strategy (Zero Data Leakage):**
  - **Training Partition (70%):** 7,000 samples (1,540 Defaults).
  - **Validation Partition (15%):** 1,500 samples (330 Defaults).
  - **Held-Out Test Partition (15%):** 1,500 samples (330 Defaults).

---

## 4. Evaluation Results on Held-Out Test Set

| Metric | Baseline (Logistic Regression) | Champion Model (XGBoost) | Notes |
|---|---|---|---|
| **ROC-AUC** | 0.9996 | **0.9996** | Area under Receiver Operating Characteristic |
| **PR-AUC** | 0.9986 | **0.9986** | Area under Precision-Recall Curve |
| **Brier Score** | 0.0071 | **0.0064** | Calibration error (lower is better) |
| **F1-Score** | 0.9780 | **0.9819** | At operating threshold 0.35 |

---

## 5. Explainable AI & Feature Attributions
The underwriting model exposes per-applicant feature contributions to explain why a decision was reached:
1. `PAY_0` (Recent repayment delay): Delays exceeding 60 days increase default probability by +35% to +50%.
2. `UTILIZATION` (Balance to credit limit ratio): Utilization ratios >80% increase default probability by +18%.
3. `PAYMENT_RATIO` (Payment made relative to statement balance): Liquidation rates <15% increase default probability by +14%.
4. `LIMIT_BAL` (Total credit line authorized): Higher authorized lines with clean payment track records decrease default risk by -12%.

---

## 6. Fairness & Ethical AI Disclosures
- **Prohibition on Demographics in Real Lending:** Under the Equal Credit Opportunity Act (ECOA) and GDPR Article 22, demographic features (such as age or marital status) must not be utilized in production systems to make unsupported assumptions about individual solvency.
- **Correlation vs. Causation:** Feature importance establishes statistical co-occurrence within the benchmark training set, not causal proof that an applicant will fail to repay.
- **Advisory Prototype:** Predictions are strictly for educational demonstration and should never be used as real-world credit ratings.
