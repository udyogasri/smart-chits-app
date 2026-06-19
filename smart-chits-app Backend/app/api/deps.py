from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from jose import JWTError, ExpiredSignatureError, jwt
from fastapi.security import OAuth2PasswordBearer
import logging

from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.organization_model import Organization
from app.utils.token import SECRET_KEY, ALGORITHM

security = HTTPBearer()


class CurrentUser:
    def __init__(self, **data):
        self.__dict__.update(data)

    def dict(self):
        return self.__dict__

    def __iter__(self):
        return iter(self.__dict__.items())


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None:
            logging.warning("Token missing email")
            raise HTTPException(status_code=401, detail="Invalid token")

    except ExpiredSignatureError:
        logging.warning("JWT expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError as e:
        logging.warning(f"JWT decode error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

    # First check User table
    user = db.query(User).filter(User.email == email).first()
    if user:
        logging.info(f"Authenticated user: {email}, role: {user.role}")
        return user
    
    # Then check Organization table
    org = db.query(Organization).filter(Organization.email == email).first()
    if org:
        logging.info(f"Authenticated organization: {email}")
        # Return a user-like object for organization users
        return CurrentUser(
            id=org.id,
            email=org.email,
            first_name=org.first_name,
            last_name=org.last_name,
            phone_number=org.phone_number,
            role="admin",
            organization_id=org.id,
            is_organization=True,
            organization_name=org.organization_name
        )

    logging.warning(f"User not found for email: {email}")
    raise HTTPException(status_code=401, detail="User not found")

def get_current_admin(current_user: User = Depends(get_current_user)):
    role = getattr(current_user, "role", None)
    if role not in ["admin", "super_admin", "system_admin", "platform_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def get_platform_admin(current_user: User = Depends(get_current_user)):
    role = getattr(current_user, "role", None)
    logging.info(f"Checking platform admin access for role: {role}")
    if role not in ["super_admin", "platform_admin", "system_admin"]:
        logging.warning(f"Access denied for role: {role}")
        raise HTTPException(status_code=403, detail="Platform admin access required")
    logging.info(f"Platform admin access granted for role: {role}")
    return current_user
