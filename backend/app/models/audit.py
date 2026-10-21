from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(64), index=True, nullable=False) # e.g., "UPDATE_REVIEW_STATUS", "IMPORT_TRANSACTIONS"
    resource_type = Column(String(64), index=True, nullable=False) # "TRANSACTION", "FRAUD_REVIEW"
    resource_id = Column(String(64), nullable=True)
    details = Column(Text, nullable=True) # JSON or descriptive string
    ip_address = Column(String(45), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
