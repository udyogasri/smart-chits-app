from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import logging

from app.crud.user_crud import authenticate_user
from app.api.deps import get_db
from app.utils.token import create_access_token

router = APIRouter()
logger = logging.getLogger(__name__)


class LoginRequest(BaseModel):
    email: str
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "password123"
            }
        }


@router.post("/login")
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    logger.info(f"Login attempt for email: {login_data.email}")
    
    try:
        user = authenticate_user(db, login_data.email, login_data.password)

        if not user:
            logger.warning(f"Failed login attempt: credentials invalid for {login_data.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        logger.info(f"Login successful for user: {login_data.email}, role: {getattr(user, 'role', user.get('role', 'user')) if isinstance(user, dict) else user.role}")

        # Handle both User objects and dictionaries
        email = user.email if hasattr(user, 'email') else user['email']
        role = user.role if hasattr(user, 'role') else user.get('role', 'user')
        user_id = user.id if hasattr(user, 'id') else user.get('id')
        
        access_token = create_access_token(data={"sub": email})

        # Get avatar if available
        avatar = user.avatar if hasattr(user, 'avatar') else user.get('avatar')
        first_name = user.first_name if hasattr(user, 'first_name') else user.get('first_name', '')
        last_name = user.last_name if hasattr(user, 'last_name') else user.get('last_name', '')
        
        response = {
            "access_token": access_token,
            "token_type": "bearer",
            "role": role,
            "user": {
                "id": user_id,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "name": user.name if hasattr(user, 'name') else f"{first_name} {last_name}".strip(),
                "avatar": avatar if avatar else None,
                "organization_id": user.organization_id if hasattr(user, 'organization_id') else user.get('organization_id')
            }
        }
        
        logger.info(f"Login response prepared for {email}: role={role}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error for {login_data.email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during login")
