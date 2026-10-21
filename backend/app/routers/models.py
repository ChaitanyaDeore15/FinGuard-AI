import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.model_meta import ModelRegistry

router = APIRouter(prefix="/models", tags=["Model Lab & Explainable AI"])

@router.get("")
def list_models(db: Session = Depends(get_db)):
    models = db.query(ModelRegistry).order_by(ModelRegistry.target_domain).all()
    results = []
    for m in models:
        cm = {}
        if m.confusion_matrix_json:
            try: cm = json.loads(m.confusion_matrix_json)
            except Exception: pass

        fi = []
        if m.feature_importances_json:
            try: fi = json.loads(m.feature_importances_json)
            except Exception: pass

        results.append({
            "id": m.id,
            "model_name": m.model_name,
            "model_type": m.model_type,
            "model_version": m.model_version,
            "target_domain": m.target_domain,
            "dataset_name": m.dataset_name,
            "dataset_records": m.dataset_records,
            "train_test_split": m.train_test_split,
            "pr_auc": m.pr_auc,
            "roc_auc": m.roc_auc,
            "precision": m.precision,
            "recall": m.recall,
            "f1_score": m.f1_score,
            "optimal_threshold": m.optimal_threshold,
            "confusion_matrix": cm,
            "feature_importances": fi,
            "is_active": m.is_active,
            "trained_at": m.trained_at
        })
    return results

@router.get("/evaluation-details")
def get_evaluation_details():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    fraud_eval_file = os.path.join(base_dir, "ml", "artifacts", "fraud", "fraud_evaluation.json")
    credit_eval_file = os.path.join(base_dir, "ml", "artifacts", "credit", "credit_evaluation.json")

    fraud_eval = {}
    credit_eval = {}

    if os.path.exists(fraud_eval_file):
        with open(fraud_eval_file, "r") as f:
            fraud_eval = json.load(f)

    if os.path.exists(credit_eval_file):
        with open(credit_eval_file, "r") as f:
            credit_eval = json.load(f)

    return {
        "fraud_model": fraud_eval,
        "credit_model": credit_eval
    }
