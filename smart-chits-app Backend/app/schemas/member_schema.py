from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class MemberCreate(BaseModel):
    chit_id: int

class MemberResponse(BaseModel):
    id: int
    user_id: int
    chit_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    branch_id: Optional[int] = None
    chit_name: Optional[str] = None
    joined_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AddMember(BaseModel):
    user_id: int
    chit_id: int