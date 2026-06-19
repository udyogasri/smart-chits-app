from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    amount: float
    month: int = 1
    status: str = "pending"
    payment_method: Optional[str] = None
    penalty_amount: float = 0

class PaymentCreate(PaymentBase):
    chit_id: int
    user_id: Optional[int] = None

class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    status: Optional[str] = None
    month: Optional[int] = None
    payment_method: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    chit_id: int
    amount: float
    month: int
    due_date: Optional[datetime] = None
    penalty_amount: float
    status: str
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaymentSummary(BaseModel):
    total_pending: float
    paid_this_month: float
    total_paid: float
    upcoming_due: float
    overdue_amount: float
    next_due_date: Optional[datetime] = None
    pending_count: int
    total_count: int

class InstallmentDetail(BaseModel):
    id: int
    chit_id: int
    chit_name: str
    month: int
    amount: float
    due_date: Optional[datetime] = None
    penalty_amount: float
    total_payable: float
    remaining_days: int
    status: str
    paid_at: Optional[datetime] = None
