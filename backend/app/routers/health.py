from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.config import settings
from app.ml.inference import MLInferenceEngine

router = APIRouter(tags=["System Health"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    ml_engine = MLInferenceEngine.get_instance()
    fraud_ready = ml_engine.fraud_model is not None
    credit_ready = ml_engine.credit_model is not None

    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "ml_engines": {
            "fraud_detection_engine": "ready" if fraud_ready else "not_loaded",
            "credit_risk_engine": "ready" if credit_ready else "not_loaded"
        }
    }
