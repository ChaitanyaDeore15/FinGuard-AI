import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.database import get_db
from app.models.transaction import Transaction, TransactionStatus
from app.models.fraud import FraudPrediction, FraudReview, ReviewStatus
from app.models.credit import CreditAssessment, RiskTier
from app.models.model_meta import ModelRegistry

router = APIRouter(prefix="/dashboard", tags=["Unified Banking Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Unified intelligence dashboard combining:
    - Transaction KPIs
    - Fraud alert counts & review backlog
    - Credit portfolio risk tier distribution
    - High-risk alert ticker
    - ML model health indicators
    """
    total_txns = db.query(Transaction).count()
    total_volume = db.query(func.sum(Transaction.amount)).scalar() or 0.0
    avg_txn = total_volume / total_txns if total_txns > 0 else 0.0

    # Fraud metrics
    flagged_txns = db.query(Transaction).filter(Transaction.status == TransactionStatus.FLAGGED).count()
    pending_reviews = db.query(FraudReview).filter(FraudReview.review_status == ReviewStatus.PENDING).count()
    confirmed_fraud = db.query(FraudReview).filter(FraudReview.review_status == ReviewStatus.CONFIRMED_FRAUD).count()
    false_positives = db.query(FraudReview).filter(FraudReview.review_status == ReviewStatus.FALSE_POSITIVE).count()

    # Credit Risk distribution
    credit_total = db.query(CreditAssessment).count()
    high_risk_credit = db.query(CreditAssessment).filter(CreditAssessment.risk_tier == RiskTier.HIGH).count()
    medium_risk_credit = db.query(CreditAssessment).filter(CreditAssessment.risk_tier == RiskTier.MEDIUM).count()
    low_risk_credit = db.query(CreditAssessment).filter(CreditAssessment.risk_tier == RiskTier.LOW).count()

    # Recent High-Risk Alerts (Top 6)
    recent_alerts = db.query(FraudReview).join(Transaction).join(FraudPrediction).order_by(desc(Transaction.timestamp)).limit(6).all()
    alerts_list = []
    for r in recent_alerts:
        txn = r.transaction
        pred = txn.fraud_prediction
        alerts_list.append({
            "review_id": r.id,
            "transaction_reference": txn.transaction_reference,
            "merchant_name": txn.merchant_name,
            "merchant_category": txn.merchant_category,
            "amount": txn.amount,
            "currency": txn.currency,
            "timestamp": txn.timestamp,
            "risk_score": pred.risk_score if pred else 0.0,
            "review_status": r.review_status.value
        })

    # Active Models
    active_fraud_model = db.query(ModelRegistry).filter(
        ModelRegistry.target_domain == "FRAUD", ModelRegistry.is_active == True
    ).first()
    active_credit_model = db.query(ModelRegistry).filter(
        ModelRegistry.target_domain == "CREDIT", ModelRegistry.is_active == True
    ).first()

    return {
        "kpis": {
            "total_transactions": total_txns,
            "total_volume": round(float(total_volume), 2),
            "avg_transaction_value": round(float(avg_txn), 2),
            "flagged_transactions": flagged_txns,
            "fraud_rate_pct": round((flagged_txns / total_txns * 100.0), 2) if total_txns > 0 else 0.0,
            "pending_reviews": pending_reviews,
            "confirmed_fraud": confirmed_fraud,
            "false_positives": false_positives
        },
        "credit_portfolio": {
            "total_evaluated": credit_total,
            "low_risk_count": low_risk_credit,
            "medium_risk_count": medium_risk_credit,
            "high_risk_count": high_risk_credit,
            "high_risk_rate_pct": round((high_risk_credit / credit_total * 100.0), 1) if credit_total > 0 else 0.0
        },
        "recent_alerts": alerts_list,
        "active_models": {
            "fraud_model": {
                "name": active_fraud_model.model_name if active_fraud_model else "N/A",
                "version": active_fraud_model.model_version if active_fraud_model else "N/A",
                "pr_auc": active_fraud_model.pr_auc if active_fraud_model else 0.0,
                "roc_auc": active_fraud_model.roc_auc if active_fraud_model else 0.0,
                "threshold": active_fraud_model.optimal_threshold if active_fraud_model else 0.5
            },
            "credit_model": {
                "name": active_credit_model.model_name if active_credit_model else "N/A",
                "version": active_credit_model.model_version if active_credit_model else "N/A",
                "roc_auc": active_credit_model.roc_auc if active_credit_model else 0.0,
                "pr_auc": active_credit_model.pr_auc if active_credit_model else 0.0
            }
        }
    }
