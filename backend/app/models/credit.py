import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text
from app.database import Base

class RiskTier(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class CreditAssessment(Base):
    __tablename__ = "credit_assessments"

    id = Column(Integer, primary_key=True, index=True)
    applicant_reference = Column(String(64), unique=True, index=True, nullable=False)
    applicant_name = Column(String(128), nullable=False)
    credit_limit = Column(Float, nullable=False)
    age = Column(Integer, nullable=False)
    education_level = Column(String(64), nullable=False)
    marital_status = Column(String(32), nullable=False)
    repayment_status_recent = Column(Integer, default=0, nullable=False)
    repayment_history_summary = Column(String(64), default="0, 0, 0, 0, 0, 0")
    avg_bill_amount = Column(Float, default=0.0)
    avg_payment_amount = Column(Float, default=0.0)
    utilization_ratio = Column(Float, default=0.0)
    probability_of_default = Column(Float, nullable=False, index=True)
    risk_tier = Column(Enum(RiskTier), nullable=False, index=True)
    key_risk_drivers = Column(Text, nullable=True) # JSON list of SHAP/feature attributions
    model_version = Column(String(64), default="credit-risk-v1.0", nullable=False)
    assessed_at = Column(DateTime, default=datetime.utcnow, index=True)
