import json
import random
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.database import get_db
from app.models.credit import CreditAssessment, RiskTier
from app.models.user import User
from app.schemas.credit import (
    CreditRiskRequest, CreditRiskResponse, CreditAssessmentItem
)
from app.ml.inference import MLInferenceEngine
from app.services.audit_service import log_audit_event
from app.routers.auth import get_current_user

router = APIRouter(prefix="/credit", tags=["Credit Risk Assessment"])

@router.post("/assess", response_model=CreditRiskResponse)
def assess_credit_risk(
    payload: CreditRiskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ml_engine = MLInferenceEngine.get_instance()
    
    # Calculate utilization if not provided
    util = payload.utilization_ratio
    if util is None:
        util = round(min(1.5, payload.avg_bill_amount / max(1.0, payload.credit_limit)), 3)

    score_input = {
        'credit_limit': payload.credit_limit,
        'age': payload.age,
        'education_level': payload.education_level,
        'marital_status': payload.marital_status,
        'repayment_status_recent': payload.repayment_status_recent,
        'repayment_history_sum': payload.repayment_history_sum or (payload.repayment_status_recent * 2),
        'avg_bill_amount': payload.avg_bill_amount,
        'avg_payment_amount': payload.avg_payment_amount,
        'utilization_ratio': util
    }

    res = ml_engine.score_credit_application(score_input)

    ref = f"APP-2026-{random.randint(10000, 99999)}"
    assessment = CreditAssessment(
        applicant_reference=ref,
        applicant_name=payload.applicant_name,
        credit_limit=payload.credit_limit,
        age=payload.age,
        education_level=payload.education_level,
        marital_status=payload.marital_status,
        repayment_status_recent=payload.repayment_status_recent,
        repayment_history_summary=f"{payload.repayment_status_recent}, 0, 0, 0, 0, 0",
        avg_bill_amount=payload.avg_bill_amount,
        avg_payment_amount=payload.avg_payment_amount,
        utilization_ratio=util,
        probability_of_default=res['probability_of_default'],
        risk_tier=RiskTier(res['risk_tier']),
        key_risk_drivers=json.dumps(res['key_risk_drivers']),
        model_version=res['model_version'],
        assessed_at=datetime.utcnow()
    )
    db.add(assessment)
    db.commit()

    log_audit_event(
        db=db,
        action="CREDIT_RISK_ASSESSMENT",
        resource_type="CREDIT_APPLICATION",
        resource_id=ref,
        user_id=current_user.id,
        user_email=current_user.email,
        details=f"Assessed applicant {payload.applicant_name} ({ref}): PD={res['probability_of_default']:.4f}, Tier={res['risk_tier']}."
    )

    return res

@router.get("/assessments", response_model=List[CreditAssessmentItem])
def list_credit_assessments(
    tier: Optional[str] = Query("ALL"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(CreditAssessment).order_by(desc(CreditAssessment.assessed_at))
    if tier and tier != "ALL":
        query = query.filter(CreditAssessment.risk_tier == tier)

    items = query.limit(limit).all()
    res = []
    for it in items:
        drivers = []
        if it.key_risk_drivers:
            try:
                drivers = json.loads(it.key_risk_drivers)
            except Exception:
                pass

        res.append({
            "id": it.id,
            "applicant_reference": it.applicant_reference,
            "applicant_name": it.applicant_name,
            "credit_limit": it.credit_limit,
            "age": it.age,
            "education_level": it.education_level,
            "marital_status": it.marital_status,
            "repayment_status_recent": it.repayment_status_recent,
            "avg_bill_amount": it.avg_bill_amount,
            "avg_payment_amount": it.avg_payment_amount,
            "utilization_ratio": it.utilization_ratio,
            "probability_of_default": it.probability_of_default,
            "risk_tier": it.risk_tier,
            "key_risk_drivers": drivers,
            "assessed_at": it.assessed_at
        })
    return res

@router.get("/portfolio-summary")
def get_credit_portfolio_summary(db: Session = Depends(get_db)):
    total = db.query(CreditAssessment).count()
    if total == 0:
        return {"total": 0, "tiers": []}

    results = db.query(
        CreditAssessment.risk_tier,
        func.count(CreditAssessment.id).label("count"),
        func.avg(CreditAssessment.probability_of_default).label("avg_pd")
    ).group_by(CreditAssessment.risk_tier).all()

    tiers = []
    for tier, cnt, avg_pd in results:
        tiers.append({
            "tier": tier.value,
            "count": cnt,
            "percentage": round((cnt / total) * 100.0, 1),
            "avg_probability_of_default": round(float(avg_pd or 0.0), 4)
        })

    return {
        "total_applicants": total,
        "tiers": tiers
    }
