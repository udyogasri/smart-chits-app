from sqlalchemy.orm import Session
from app.models.audit_log_model import AuditLog


def create_audit_log(
    db: Session,
    user_id: int | None,
    user_name: str | None,
    action: str,
    resource: str,
    detail: str | None = None,
    success: bool = True,
):
    audit_log = AuditLog(
        user_id=user_id,
        user_name=user_name,
        action=action,
        resource=resource,
        detail=detail,
        success=success,
    )
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    return audit_log


def get_recent_audit_logs(db: Session, limit: int = 100):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
