from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class OrganizationBase(BaseModel):
    organization_name: str
    organization_type: str
    registration_number: str
    company_email: EmailStr
    company_phone_number: str
    description: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseModel):
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    registration_number: Optional[str] = None
    company_email: Optional[EmailStr] = None
    company_phone_number: Optional[str] = None
    description: Optional[str] = None

class OrganizationResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone_number: str
    organization_name: str
    organization_type: str
    registration_number: str
    company_email: str
    company_phone_number: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class OrganizationRegister(BaseModel):
    # Admin User Details
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    password: str
    confirm_password: str
    
    # Organization Details
    organization_name: str
    organization_type: str
    registration_number: str
    company_email: EmailStr
    company_phone_number: str
    description: Optional[str] = None
