from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models import branch_model
from app.models.user_model import User
from app.models.organization_model import Organization
from app.schemas.user_schema import UserCreate, UserUpdate
from app.utils.hashing import hash_password, verify_password

def create_user(db: Session, user: UserCreate, organization_id: int | None = None):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise ValueError("Email is already registered")

    hashed_pwd = hash_password(user.password)

    db_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        name=f"{user.first_name} {user.last_name}",  # For backward compatibility
        email=user.email,
        phone_number=user.phone_number,
        hashed_password=hashed_pwd,
        role=user.role or "user",
        organization_id=organization_id,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def create_admin(db: Session, first_name: str, last_name: str, email: str, phone_number: str, password: str):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise ValueError("Email is already registered")

    hashed_pwd = hash_password(password)

    db_user = User(
        first_name=first_name,
        last_name=last_name,
        name=f"{first_name} {last_name}",
        email=email,
        phone_number=phone_number,
        hashed_password=hashed_pwd,
        role="admin"
    )

    db.add(db_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Email is already registered")

    db.refresh(db_user)

    return db_user

def _safe_verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return verify_password(plain_password, hashed_password)
    except Exception:
        return False


def authenticate_user(db: Session, email: str, password: str):
    # First check User table
    user = db.query(User).filter(User.email == email).first()
    if user:
        if user.hashed_password and _safe_verify_password(password, user.hashed_password):
            return user

        # Legacy or manual records may have a plain-text password in the hashed_password field.
        # If so, migrate it to a secure bcrypt hash on first successful login.
        if user.hashed_password and not user.hashed_password.startswith("$2") and password == user.hashed_password:
            user.hashed_password = hash_password(password)
            db.commit()
            db.refresh(user)
            return user

    # Then check Organization table for organization users
    org = db.query(Organization).filter(Organization.email == email).first()
    if org and org.password and _safe_verify_password(password, org.password):
        # Return a user-like object for organization users
        return {
            "id": org.id,
            "email": org.email,
            "first_name": org.first_name,
            "last_name": org.last_name,
            "phone_number": org.phone_number,
            "role": "admin",
            "organization_id": org.id,
            "is_organization": True,
            "organization_name": org.organization_name
        }

    # Support plain-text fallback for legacy organization passwords as well.
    if org and org.password and not org.password.startswith("$2") and password == org.password:
        org.password = hash_password(password)
        db.commit()
        return {
            "id": org.id,
            "email": org.email,
            "first_name": org.first_name,
            "last_name": org.last_name,
            "phone_number": org.phone_number,
            "role": "admin",
            "organization_id": org.id,
            "is_organization": True,
            "organization_name": org.organization_name
        }

    return None

def get_all_users(db: Session):
    return db.query(User).all()

def get_users_by_organization(db: Session, organization_id: int, skip: int = 0, limit: int = 100):
    return db.query(User).filter(User.organization_id == organization_id).offset(skip).limit(limit).all()

def promote_to_admin(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.role = "admin"
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    # Update only provided fields
    if user_update.first_name is not None:
        user.first_name = user_update.first_name
        user.name = f"{user_update.first_name} {user.last_name or user.last_name}"
    if user_update.last_name is not None:
        user.last_name = user_update.last_name
        user.name = f"{user.first_name or user.first_name} {user_update.last_name}"
    if user_update.phone_number is not None:
        user.phone_number = user_update.phone_number
    if user_update.avatar is not None:
        user.avatar = user_update.avatar
    if user_update.preferences is not None:
        user.preferences = user_update.preferences
    if user_update.notifications is not None:
        user.notifications = user_update.notifications
    
    db.commit()
    db.refresh(user)
    return user

def update_user_by_email(db: Session, email: str, user_update: UserUpdate):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    
    # Update only provided fields
    if user_update.first_name is not None:
        user.first_name = user_update.first_name
        user.name = f"{user_update.first_name} {user.last_name or user.last_name}"
    if user_update.last_name is not None:
        user.last_name = user_update.last_name
        user.name = f"{user.first_name or user.first_name} {user_update.last_name}"
    if user_update.phone_number is not None:
        user.phone_number = user_update.phone_number
    if user_update.avatar is not None:
        user.avatar = user_update.avatar
    if user_update.preferences is not None:
        user.preferences = user_update.preferences
    if user_update.notifications is not None:
        user.notifications = user_update.notifications
    
    db.commit()
    db.refresh(user)
    return user
