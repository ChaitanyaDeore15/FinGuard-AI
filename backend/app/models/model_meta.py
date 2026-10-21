from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from app.database import Base

class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(128), nullable=False)
    model_type = Column(String(64), nullable=False)
    model_version = Column(String(32), unique=True, index=True, nullable=False)
    target_domain = Column(String(32), nullable=False) # "FRAUD" or "CREDIT"
    dataset_name = Column(String(128), nullable=False)
    dataset_records = Column(Integer, default=0)
    train_test_split = Column(String(64), default="70/15/15")
    pr_auc = Column(Float, nullable=False)
    roc_auc = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    optimal_threshold = Column(Float, default=0.5)
    confusion_matrix_json = Column(Text, nullable=True) # JSON: {"tn": 2843, "fp": 12, "fn": 8, "tp": 94}
    feature_importances_json = Column(Text, nullable=True) # JSON: [{"feature": "amount", "importance": 0.32}, ...]
    is_active = Column(Boolean, default=True)
    trained_at = Column(DateTime, default=datetime.utcnow)
