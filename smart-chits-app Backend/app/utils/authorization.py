from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.user_model import User
from app.api.deps import get_current_user, get_db

def require_admin():
    def admin_dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in ["admin", "super_admin", "system_admin", "platform_admin"]:
            raise HTTPException(status_code=403, detail="Admin access required")
        return current_user
    return admin_dependency

def require_super_admin():
    def super_admin_dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in ["super_admin", "system_admin"]:
            raise HTTPException(status_code=403, detail="Super admin access required")
        return current_user
    return super_admin_dependency

def check_user_permission(current_user: User, target_user_id: int, action: str, db: Session):
    """Check if current user has permission to perform action on target user"""
    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Super admin can do anything
    if current_user.role in ["super_admin", "system_admin"]:
        return
    
    # Regular admin can only manage users in their organization
    if current_user.role == "admin":
        if target_user.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Cannot manage users from other organizations")
    
    # Platform admin can manage users across organizations
    if current_user.role == "platform_admin":
        return

def check_organization_permission(current_user: User, organization_id: int, action: str):
    """Check if current user has permission to perform action on organization"""
    # Super admin and system admin can access any organization
    if current_user.role in ["super_admin", "system_admin"]:
        return
    
    # Platform admin can access any organization
    if current_user.role == "platform_admin":
        return
    
    # Regular admin can only access their own organization
    if current_user.role == "admin":
        # If organization_id is not provided, use the user's organization_id
        if organization_id is None:
            organization_id = current_user.organization_id
        
        if current_user.organization_id != organization_id:
            raise HTTPException(status_code=403, detail="Cannot access other organizations")
        return
    
    raise HTTPException(status_code=403, detail="Insufficient permissions")
