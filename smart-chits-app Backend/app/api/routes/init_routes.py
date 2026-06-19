from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserResponse

router = APIRouter(prefix="/init")

ADMIN_ROLES = ["admin", "super_admin", "system_admin", "platform_admin"]


class BootstrapAdminCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "admin"
    phone_number: str | None = None
    organization_id: int | None = None


@router.get("/status")
def get_bootstrap_status(db: Session = Depends(get_db)):
    active_admin_count = db.query(User).filter(
        User.role.in_(ADMIN_ROLES),
        User.is_active.is_(True),
    ).count()

    return {
        "bootstrap_allowed": active_admin_count == 0,
        "active_admin_count": active_admin_count,
    }


@router.post("/bootstrap", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def bootstrap_admin(admin_data: BootstrapAdminCreate, db: Session = Depends(get_db)):
    active_admin_count = db.query(User).filter(
        User.role.in_(ADMIN_ROLES),
        User.is_active.is_(True),
    ).count()

    if active_admin_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Bootstrap is disabled because {active_admin_count} active admin account(s) "
                "already exist. Use /auth/login and the regular admin endpoints instead."
            ),
        )

    if admin_data.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'admin' or 'super_admin'",
        )

    from app.crud.user_crud import create_user

    name_parts = admin_data.name.strip().split()
    first_name = name_parts[0]
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
    phone_number = admin_data.phone_number or "0000000000"

    user_create = UserCreate(
        first_name=first_name,
        last_name=last_name,
        email=admin_data.email,
        phone_number=phone_number,
        password=admin_data.password,
        role=admin_data.role,
    )

    try:
        return create_user(db, user_create)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
