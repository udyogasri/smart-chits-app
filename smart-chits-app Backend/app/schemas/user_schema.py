from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    password: str
    role: str = "user"
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    name: Optional[str] = None
    email: EmailStr
    phone_number: Optional[str] = None
    role: str

    class Config:
        from_attributes = True

class AdminCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    branch_id: Optional[int] = None
    phone_number: Optional[str] = None

class AdminResponse(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: EmailStr
    phone_number: Optional[str] = None
    branch_id: Optional[int] = None
    role: str
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    notifications: Optional[Dict[str, bool]] = None