from datetime import datetime
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log_audit_event(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: str = "127.0.0.1"
):
    try:
        event = AuditLog(
            user_id=user_id,
            user_email=user_email,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            timestamp=datetime.utcnow()
        )
        db.add(event)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Audit Warning] Could not record audit log: {e}")
