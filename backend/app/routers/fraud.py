import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.database import get_db
from app.models.fraud import FraudPrediction, FraudReview, ReviewStatus
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User
from app.schemas.fraud import (
    FraudScoreRequest, FraudScoreResponse, BatchFraudScoreRequest,
    BatchFraudScoreResponse, FraudReviewUpdate, FraudAlertItem
)
from app.ml.inference import MLInferenceEngine
from app.services.audit_service import log_audit_event
from app.routers.auth import get_current_user

router = APIRouter(prefix="/fraud", tags=["AI Fraud Detection"])

@router.post("/score", response_model=FraudScoreResponse)
def score_single_transaction(payload: FraudScoreRequest):
    ml_engine = MLInferenceEngine.get_instance()
    res = ml_engine.score_fraud_transaction(payload.dict())
    return res

@router.post("/score-batch", response_model=BatchFraudScoreResponse)
def score_batch_transactions(payload: BatchFraudScoreRequest):
    ml_engine = MLInferenceEngine.get_instance()
    results = []
    flagged = 0
    for req in payload.transactions:
        scored = ml_engine.score_fraud_transaction(req.dict())
        if scored['is_flagged']:
            flagged += 1
        results.append(FraudScoreResponse(**scored))
    
    return {
        "scored_count": len(results),
        "flagged_count": flagged,
        "results": results
    }

@router.get("/alerts", response_model=List[FraudAlertItem])
def get_fraud_alerts(
    status_filter: Optional[str] = Query("ALL", description="ALL, PENDING, CONFIRMED_FRAUD, FALSE_POSITIVE, CLEARED"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(FraudReview).join(Transaction).join(FraudPrediction).order_by(desc(Transaction.timestamp))
    
    if status_filter and status_filter != "ALL":
        query = query.filter(FraudReview.review_status == status_filter)

    reviews = query.limit(limit).all()
    alerts = []
    for r in reviews:
        txn = r.transaction
        pred = txn.fraud_prediction
        risk_factors = []
        if pred and pred.top_risk_factors:
            try:
                risk_factors = json.loads(pred.top_risk_factors)
            except Exception:
                pass

        alerts.append({
            "review_id": r.id,
            "transaction_id": txn.id,
            "transaction_reference": txn.transaction_reference,
            "account_id": txn.account_id,
            "amount": txn.amount,
            "currency": txn.currency,
            "timestamp": txn.timestamp,
            "merchant_name": txn.merchant_name,
            "merchant_category": txn.merchant_category,
            "risk_score": pred.risk_score if pred else 0.0,
            "is_flagged": pred.is_flagged if pred else True,
            "review_status": r.review_status,
            "analyst_notes": r.analyst_notes,
            "risk_factors": risk_factors
        })
    return alerts

@router.patch("/reviews/{review_id}")
def update_review_status(
    review_id: int,
    payload: FraudReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(FraudReview).filter(FraudReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Fraud review case not found")

    old_status = review.review_status
    review.review_status = payload.review_status
    review.reviewer_id = current_user.id
    if payload.analyst_notes:
        review.analyst_notes = payload.analyst_notes
    if payload.action_taken:
        review.action_taken = payload.action_taken
    review.updated_at = datetime.utcnow()

    # Sync transaction status
    txn = review.transaction
    if payload.review_status == ReviewStatus.CONFIRMED_FRAUD:
        txn.status = TransactionStatus.DECLINED
    elif payload.review_status in (ReviewStatus.FALSE_POSITIVE, ReviewStatus.CLEARED):
        txn.status = TransactionStatus.COMPLETED

    db.commit()

    log_audit_event(
        db=db,
        action="UPDATE_FRAUD_REVIEW",
        resource_type="FRAUD_REVIEW",
        resource_id=str(review.id),
        user_id=current_user.id,
        user_email=current_user.email,
        details=f"Status changed from {old_status.value} to {payload.review_status.value}. Notes: {payload.analyst_notes or 'None'}"
    )

    return {
        "success": True,
        "review_id": review.id,
        "new_status": review.review_status.value,
        "message": f"Review case updated to {review.review_status.value}."
    }

@router.get("/distribution")
def get_risk_distribution(db: Session = Depends(get_db)):
    """
    Returns counts bucketed by risk score deciles (0.0-0.1, 0.1-0.2, ... 0.9-1.0)
    """
    scores = [s[0] for s in db.query(FraudPrediction.risk_score).all()]
    buckets = [
        {"range": "0.00 - 0.10", "count": 0, "tier": "LOW"},
        {"range": "0.10 - 0.20", "count": 0, "tier": "LOW"},
        {"range": "0.20 - 0.30", "count": 0, "tier": "LOW"},
        {"range": "0.30 - 0.40", "count": 0, "tier": "MEDIUM"},
        {"range": "0.40 - 0.50", "count": 0, "tier": "MEDIUM"},
        {"range": "0.50 - 0.60", "count": 0, "tier": "MEDIUM"},
        {"range": "0.60 - 0.70", "count": 0, "tier": "HIGH"},
        {"range": "0.70 - 0.80", "count": 0, "tier": "HIGH"},
        {"range": "0.80 - 0.90", "count": 0, "tier": "CRITICAL"},
        {"range": "0.90 - 1.00", "count": 0, "tier": "CRITICAL"},
    ]

    for score in scores:
        idx = min(9, int(score * 10))
        buckets[idx]["count"] += 1

    return buckets
