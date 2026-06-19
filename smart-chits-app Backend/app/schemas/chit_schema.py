from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChitBase(BaseModel):
    name: str
    total_members: Optional[int] = 0
    duration: Optional[int] = None
    monthly_amount: Optional[float] = None
    current_month: Optional[int] = 1
    bidding_open: Optional[bool] = False
    total_chit_amount: Optional[float] = 0
    chit_fund: Optional[float] = None
    installment_amount: Optional[float] = None
    installment_frequency: Optional[int] = 1
    total_months: Optional[int] = 12
    description: Optional[str] = None

class ChitCreate(ChitBase):
    name: str
    duration: int
    monthly_amount: float
    organization_id: Optional[int] = None

class ChitUpdate(BaseModel):
    name: Optional[str] = None
    total_members: Optional[int] = None
    chit_fund: Optional[float] = None
    installment_amount: Optional[float] = None
    installment_frequency: Optional[int] = None
    total_months: Optional[int] = None
    description: Optional[str] = None
    bidding_open: Optional[bool] = None

class ChitResponse(ChitBase):
    id: int
    organization_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ChitWithMemberCount(ChitBase):
    id: int
    organization_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    member_count: int = 0
    
    class Config:
        from_attributes = True
