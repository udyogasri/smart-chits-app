from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime, timedelta
from uuid import uuid4

from app.db.database import get_db
from app.schemas.payment_schema import (
    PaymentCreate, 
    PaymentResponse,
    PaymentSummary,
    InstallmentDetail
)
from app.services.payment_service import make_payment
from app.api.deps import get_current_user
from app.models.user_model import User
from app.models.payment_model import Payment
from app.models.chit_model import Chit
from app.crud.payment_crud import get_payments_by_user, _payment_to_dict

router = APIRouter()


@router.get("/")
def get_user_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all payments for current user"""
    payments = get_payments_by_user(db, current_user.id)
    return [_payment_to_dict(db, p) for p in payments]


@router.get("/summary")
def get_payment_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payment summary for dashboard"""
    try:
        # Get all payments for user
        payments = db.query(Payment).filter(Payment.user_id == current_user.id).all()
        
        # Calculate totals - handle None values
        total_paid = sum(p.amount for p in payments if p.status == "Paid") if payments else 0.0
        
        overdue_amount = 0.0
        for p in payments:
            if p.status == "Overdue":
                penalty = (p.penalty_amount or 0.0)
                overdue_amount += p.amount + penalty
        
        pending_count = len([p for p in payments if p.status == "Pending"])
        upcoming_count = len([p for p in payments if p.status == "Upcoming"])
        
        # Get this month's paid amount
        today = datetime.now()
        month_start = datetime(today.year, today.month, 1)
        paid_this_month = sum(p.amount for p in payments 
                             if p.status == "Paid" and p.paid_at and p.paid_at >= month_start)
        
        # Get next due date
        upcoming_payments = [p for p in payments if p.status in ["Pending", "Upcoming"] and p.due_date]
        next_due = min([p.due_date for p in upcoming_payments]) if upcoming_payments else None
        
        return PaymentSummary(
            total_pending=sum(p.amount for p in payments if p.status == "Pending") if payments else 0.0,
            paid_this_month=paid_this_month,
            total_paid=total_paid,
            upcoming_due=sum(p.amount for p in payments if p.status == "Upcoming") if payments else 0.0,
            overdue_amount=overdue_amount,
            next_due_date=next_due,
            pending_count=pending_count,
            total_count=len(payments)
        )
    except Exception as e:
        print(f"Error in get_payment_summary: {e}")
        import traceback
        traceback.print_exc()
        # Return default summary on error
        return PaymentSummary(
            total_pending=0.0,
            paid_this_month=0.0,
            total_paid=0.0,
            upcoming_due=0.0,
            overdue_amount=0.0,
            next_due_date=None,
            pending_count=0,
            total_count=0
        )


@router.get("/installments", response_model=list[InstallmentDetail])
def get_pending_installments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all pending installments for user"""
    payments = db.query(Payment).filter(
        and_(
            Payment.user_id == current_user.id,
            Payment.status.in_(["Pending", "Upcoming", "Overdue", "Paid"])
        )
    ).all()
    
    installments = []
    today = datetime.now()
    
    for payment in payments:
        chit = db.query(Chit).filter(Chit.id == payment.chit_id).first()
        if not chit:
            continue
            
        # Calculate remaining days
        if payment.due_date:
            remaining_days = (payment.due_date - today).days
        else:
            remaining_days = 0
        
        # Calculate total payable
        penalty = payment.penalty_amount
        if payment.status == "Overdue" and payment.due_date:
            days_overdue = max(0, (today - payment.due_date).days)
            penalty = days_overdue * 200  # ₹200 per day
        
        installments.append(InstallmentDetail(
            id=payment.id,
            chit_id=payment.chit_id,
            chit_name=chit.name,
            month=payment.month,
            amount=payment.amount,
            due_date=payment.due_date,
            penalty_amount=penalty,
            total_payable=payment.amount + penalty,
            remaining_days=remaining_days,
            status=payment.status,
            paid_at=payment.paid_at
        ))
    
    return installments


@router.post("/process", response_model=PaymentResponse)
def process_payment(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process payment with penalty calculation"""
    # Find pending payment
    payment = db.query(Payment).filter(
        and_(
            Payment.user_id == current_user.id,
            Payment.chit_id == data.chit_id,
            Payment.month == data.month,
            Payment.status.in_(["Pending", "Overdue"])
        )
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Calculate penalty if overdue
    today = datetime.now()
    penalty = 0
    if payment.due_date and today > payment.due_date and payment.status == "Overdue":
        days_overdue = (today - payment.due_date).days
        penalty = days_overdue * 200  # ₹200 per day
    
    # Update payment
    payment.status = "Paid"
    payment.paid_at = today
    payment.penalty_amount = penalty
    payment.transaction_id = f"TXN-{uuid4().hex[:12].upper()}"
    payment.payment_method = data.payment_method
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return payment


@router.post("/", response_model=PaymentResponse)
def pay(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Legacy payment endpoint"""
    return make_payment(
        db,
        user_id=current_user.id,
        chit_id=data.chit_id,
        amount=data.amount
    )
