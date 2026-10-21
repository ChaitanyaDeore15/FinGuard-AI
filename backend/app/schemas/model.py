from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ModelRegistryResponse(BaseModel):
    id: int
    model_name: str
    model_type: str
    model_version: str
    target_domain: str
    dataset_name: str
    dataset_records: int
    train_test_split: str
    pr_auc: float
    roc_auc: float
    precision: float
    recall: float
    f1_score: float
    optimal_threshold: float
    confusion_matrix: Dict[str, int]
    feature_importances: List[Dict[str, Any]]
    is_active: bool
    trained_at: datetime

    class Config:
        from_attributes = True
