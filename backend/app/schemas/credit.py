from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.credit import RiskTier

class FeatureAttribution(BaseModel):
    factor: str
    impact: str
    contribution: float
    description: str

class CreditRiskRequest(BaseModel):
    applicant_name: str = "Jane Doe"
    credit_limit: float = Field(..., gt=0)
    age: int = Field(..., ge=18, le=100)
    education_level: str = "University" # "Graduate School", "University", "High School", "Other"
    marital_status: str = "Single" # "Married", "Single", "Other"
    repayment_status_recent: int = Field(0, ge=-2, le=8)
    repayment_history_sum: Optional[int] = 0
    avg_bill_amount: float = Field(..., ge=0)
    avg_payment_amount: float = Field(..., ge=0)
    utilization_ratio: Optional[float] = None

class CreditRiskResponse(BaseModel):
    probability_of_default: float
    risk_tier: RiskTier
    credit_score_equivalent: int
    model_version: str
    key_risk_drivers: List[FeatureAttribution]

class CreditAssessmentItem(BaseModel):
    id: int
    applicant_reference: str
    applicant_name: str
    credit_limit: float
    age: int
    education_level: str
    marital_status: str
    repayment_status_recent: int
    avg_bill_amount: float
    avg_payment_amount: float
    utilization_ratio: float
    probability_of_default: float
    risk_tier: RiskTier
    key_risk_drivers: List[FeatureAttribution]
    assessed_at: datetime

    class Config:
        from_attributes = True
