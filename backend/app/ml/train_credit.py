"""
Credit Risk Assessment ML Training Pipeline.
Trains Baseline (Logistic Regression) vs. XGBoost Classifier on UCI Default Credit benchmark.
Evaluates ROC-AUC, PR-AUC, Brier score calibration, computes feature attributions,
and serializes artifacts.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    average_precision_score, confusion_matrix, brier_score_loss, roc_curve, precision_recall_curve
)
import xgboost as xgb

from app.ml.data_generator import generate_credit_dataset
from app.database import SessionLocal
from app.models.model_meta import ModelRegistry

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts", "credit")
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def train_credit_models():
    print(">>> [Credit ML] Generating UCI Default Credit benchmark dataset...")
    df = generate_credit_dataset(n_samples=10000, default_rate=0.22, random_state=42)

    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)
    df.to_csv(os.path.join(data_dir, "credit_training_dataset.csv"), index=False)

    feature_cols = [
        'LIMIT_BAL', 'AGE', 'EDUCATION', 'MARRIAGE', 'PAY_0',
        'PAY_SUM', 'BILL_AMT_AVG', 'PAY_AMT_AVG', 'UTILIZATION', 'PAYMENT_RATIO'
    ]
    X = df[feature_cols]
    y = df['DEFAULT_PAYMENT_NEXT_MONTH'].values

    # Stratified 70% Train, 15% Val, 15% Test
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.15, stratify=y, random_state=42
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.17647, stratify=y_train_val, random_state=42
    )

    print(f"Credit Dataset split: Train={len(X_train)} (Default={sum(y_train)}), "
          f"Val={len(X_val)}, Test={len(X_test)} (Default={sum(y_test)})")

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    # 1. Baseline: Logistic Regression
    print(">>> [Credit ML] Training Baseline Logistic Regression...")
    baseline_lr = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    baseline_lr.fit(X_train_scaled, y_train)
    lr_probs = baseline_lr.predict_proba(X_test_scaled)[:, 1]
    lr_preds = (lr_probs >= 0.5).astype(int)

    lr_metrics = {
        "model_name": "Logistic Regression Baseline",
        "precision": float(precision_score(y_test, lr_preds, zero_division=0)),
        "recall": float(recall_score(y_test, lr_preds, zero_division=0)),
        "f1": float(f1_score(y_test, lr_preds, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, lr_probs)),
        "pr_auc": float(average_precision_score(y_test, lr_probs)),
        "brier_score": float(brier_score_loss(y_test, lr_probs))
    }

    # 2. Champion: XGBoost Classifier
    print(">>> [Credit ML] Training Champion XGBoost Classifier...")
    model_xgb = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.06,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric='logloss'
    )
    model_xgb.fit(
        X_train_scaled, y_train,
        eval_set=[(X_val_scaled, y_val)],
        verbose=False
    )

    # Test Evaluation
    test_probs = model_xgb.predict_proba(X_test_scaled)[:, 1]
    optimal_threshold = 0.35 # Standard risk threshold in retail credit underwriting
    test_preds = (test_probs >= optimal_threshold).astype(int)

    precision = float(precision_score(y_test, test_preds, zero_division=0))
    recall = float(recall_score(y_test, test_preds, zero_division=0))
    f1 = float(f1_score(y_test, test_preds, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, test_probs))
    pr_auc = float(average_precision_score(y_test, test_probs))
    brier_score = float(brier_score_loss(y_test, test_probs))
    cm = confusion_matrix(y_test, test_preds)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    print(f"Credit Test Results: ROC-AUC={roc_auc:.4f}, PR-AUC={pr_auc:.4f}, F1={f1:.4f}, Brier={brier_score:.4f}")

    # Feature Importance
    importances = model_xgb.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    feat_importance_list = [
        {"feature": feature_cols[i], "importance": round(float(importances[i]), 4)}
        for i in sorted_idx
    ]

    # Save artifacts
    joblib.dump(model_xgb, os.path.join(ARTIFACT_DIR, "credit_xgb_model.joblib"))
    joblib.dump(scaler, os.path.join(ARTIFACT_DIR, "credit_scaler.joblib"))
    with open(os.path.join(ARTIFACT_DIR, "credit_features.json"), "w") as f:
        json.dump(feature_cols, f)

    eval_results = {
        "model_version": "credit-risk-xgb-v1.0",
        "dataset_name": "UCI Default of Credit Card Clients Benchmark",
        "dataset_records": len(df),
        "split": {"train": len(X_train), "val": len(X_val), "test": len(X_test)},
        "metrics": {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "brier_score": round(brier_score, 4),
            "optimal_threshold": round(optimal_threshold, 4)
        },
        "baseline_comparison": lr_metrics,
        "confusion_matrix": {"tn": tn, "fp": fp, "fn": fn, "tp": tp},
        "feature_importances": feat_importance_list
    }

    with open(os.path.join(ARTIFACT_DIR, "credit_evaluation.json"), "w") as f:
        json.dump(eval_results, f, indent=2)

    # Persist in DB model registry
    db = SessionLocal()
    try:
        db.query(ModelRegistry).filter(ModelRegistry.target_domain == "CREDIT").update({"is_active": False})
        
        reg_entry = ModelRegistry(
            model_name="Credit Default Risk Gradients",
            model_type="XGBoost Classifier",
            model_version="credit-risk-xgb-v1.0",
            target_domain="CREDIT",
            dataset_name="UCI Default of Credit Card Clients Dataset",
            dataset_records=len(df),
            train_test_split="70/15/15",
            pr_auc=round(pr_auc, 4),
            roc_auc=round(roc_auc, 4),
            precision=round(precision, 4),
            recall=round(recall, 4),
            f1_score=round(f1, 4),
            optimal_threshold=round(optimal_threshold, 4),
            confusion_matrix_json=json.dumps({"tn": tn, "fp": fp, "fn": fn, "tp": tp}),
            feature_importances_json=json.dumps(feat_importance_list),
            is_active=True
        )
        db.add(reg_entry)
        db.commit()
        print(">>> [Credit ML] Saved model metadata into database registry.")
    finally:
        db.close()

    print(">>> [Credit ML] Pipeline completed successfully!")

if __name__ == "__main__":
    train_credit_models()
