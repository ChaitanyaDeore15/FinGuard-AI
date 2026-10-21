import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Boolean, Index
from sqlalchemy.orm import relationship
from app.database import Base

class TransactionType(str, enum.Enum):
    POS = "POS"
    ONLINE = "ONLINE"
    ATM_WITHDRAWAL = "ATM_WITHDRAWAL"
    WIRE_TRANSFER = "WIRE_TRANSFER"
    MOBILE_PAYMENT = "MOBILE_PAYMENT"

class TransactionStatus(str, enum.Enum):
    COMPLETED = "COMPLETED"
    PENDING = "PENDING"
    FLAGGED = "FLAGGED"
    DECLINED = "DECLINED"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_reference = Column(String(64), unique=True, index=True, nullable=False)
    account_id = Column(String(64), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    merchant_name = Column(String(128), index=True, nullable=False)
    merchant_category = Column(String(64), index=True, nullable=False)
    transaction_type = Column(Enum(TransactionType), default=TransactionType.ONLINE, nullable=False)
    channel = Column(String(32), default="WEB", nullable=False)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.COMPLETED, nullable=False)
    country_code = Column(String(3), default="US", nullable=False)
    device_fingerprint = Column(String(128), nullable=True)
    is_international = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    fraud_prediction = relationship("FraudPrediction", back_populates="transaction", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("FraudReview", back_populates="transaction", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_txn_timestamp_amount", "timestamp", "amount"),
        Index("idx_txn_status_category", "status", "merchant_category"),
    )
