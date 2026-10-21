from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.fraud import ReviewStatus
from app.models.transaction import TransactionStatus

class RiskFactor(BaseModel):
    factor: str
    impact: str
    contribution: float
    description: str

class FraudScoreRequest(BaseModel):
    amount: float = Field(..., gt=0)
    hour: int = Field(12, ge=0, le=23)
    velocity_1h: int = Field(1, ge=0)
    amount_to_avg_ratio: float = Field(1.0, ge=0.0)
    ip_risk_score: float = Field(0.1, ge=0.0, le=1.0)
    is_international: bool = False
    merchant_category: str = "Groceries"
    transaction_type: str = "ONLINE"
    account_id: Optional[str] = "ACC-1001"
    merchant_name: Optional[str] = "Online Store"

class FraudScoreResponse(BaseModel):
    risk_score: float
    is_flagged: bool
    threshold_used: float
    predicted_label: int
    model_version: str
    risk_factors: List[RiskFactor]

class BatchFraudScoreRequest(BaseModel):
    transactions: List[FraudScoreRequest]

class BatchFraudScoreResponse(BaseModel):
    scored_count: int
    flagged_count: int
    results: List[FraudScoreResponse]

class FraudReviewUpdate(BaseModel):
    review_status: ReviewStatus
    analyst_notes: Optional[str] = None
    action_taken: Optional[str] = None

class FraudAlertItem(BaseModel):
    review_id: int
    transaction_id: int
    transaction_reference: str
    account_id: str
    amount: float
    currency: str
    timestamp: datetime
    merchant_name: str
    merchant_category: str
    risk_score: float
    is_flagged: bool
    review_status: ReviewStatus
    analyst_notes: Optional[str] = None
    risk_factors: List[RiskFactor]

    class Config:
        from_attributes = True
