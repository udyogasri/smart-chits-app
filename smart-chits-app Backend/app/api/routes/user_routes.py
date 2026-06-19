from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.user_schema import UserCreate, UserUpdate
from app.crud.user_crud import (
    create_user,
    get_all_users,
    promote_to_admin,
    update_user_by_email
)
from app.api.deps import get_db, get_current_user, get_current_admin

router = APIRouter()

# ---------------- USER REGISTER ----------------
@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

# ---------------- GET CURRENT USER ----------------
@router.get("/me")
def get_profile(current_user = Depends(get_current_user)):
    return current_user

# ---------------- GET ALL USERS (ADMIN ONLY) ----------------
@router.get("/")
def get_all_users_endpoint(
    admin_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return get_all_users(db)

# ---------------- PROMOTE USER ----------------
@router.patch("/{user_id}/promote-admin")
def promote_user_to_admin(
    user_id: int,
    admin_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = promote_to_admin(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

# ---------------- UPDATE USER SETTINGS ----------------
@router.patch("/me/settings")
def update_user_settings(
    user_update: UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    email = current_user.email if hasattr(current_user, 'email') else current_user['email']
    
    # Check if user is from organization table
    is_organization = hasattr(current_user, 'is_organization') or (hasattr(current_user, 'get') and current_user.get('is_organization', False))
    
    if is_organization:
        # Update organization settings
        from app.models.organization_model import Organization
        org = db.query(Organization).filter(Organization.email == email).first()
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        if user_update.first_name is not None:
            org.first_name = user_update.first_name
        if user_update.last_name is not None:
            org.last_name = user_update.last_name
        if user_update.phone_number is not None:
            org.phone_number = user_update.phone_number
        if user_update.avatar is not None:
            org.avatar = user_update.avatar
        if user_update.preferences is not None:
            org.preferences = user_update.preferences
        if user_update.notifications is not None:
            org.notifications = user_update.notifications
        
        db.commit()
        db.refresh(org)
        return org
    else:
        # Update user settings
        user = update_user_by_email(db, email, user_update)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
