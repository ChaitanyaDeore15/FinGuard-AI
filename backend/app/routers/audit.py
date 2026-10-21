from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogResponse

router = APIRouter(prefix="/audit", tags=["Compliance & Audit Logs"])

@router.get("/logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog).order_by(desc(AuditLog.timestamp))
    if action:
        query = query.filter(AuditLog.action == action)
    return query.limit(limit).all()
