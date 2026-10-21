import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class ReviewStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED_FRAUD = "CONFIRMED_FRAUD"
    FALSE_POSITIVE = "FALSE_POSITIVE"
    CLEARED = "CLEARED"

class FraudPrediction(Base):
    __tablename__ = "fraud_predictions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="CASCADE"), unique=True, nullable=False)
    risk_score = Column(Float, nullable=False, index=True) # 0.0 to 1.0
    is_flagged = Column(Boolean, default=False, index=True)
    threshold_used = Column(Float, default=0.50, nullable=False)
    predicted_label = Column(Integer, default=0, nullable=False)
    model_version = Column(String(64), default="finguard-xgb-v1.0", nullable=False)
    top_risk_factors = Column(Text, nullable=True) # JSON array of explanations
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    transaction = relationship("Transaction", back_populates="fraud_prediction")

class FraudReview(Base):
    __tablename__ = "fraud_reviews"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_status = Column(Enum(ReviewStatus), default=ReviewStatus.PENDING, nullable=False, index=True)
    analyst_notes = Column(Text, nullable=True)
    action_taken = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transaction = relationship("Transaction", back_populates="reviews")
    reviewer = relationship("User")
