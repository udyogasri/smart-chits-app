from sqlalchemy.orm import Session
from app.models.payment_model import Payment
from app.models.user_model import User
from app.models.chit_model import Chit
from app.schemas.payment_schema import PaymentCreate, PaymentUpdate
from datetime import datetime

def create_payment(db: Session, payment: PaymentCreate):
    """Create a new payment record"""
    db_payment = Payment(
        user_id=payment.user_id,
        chit_id=payment.chit_id,
        amount=payment.amount,
        status=payment.status,
        month=payment.month
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def get_payment(db: Session, payment_id: int):
    """Get payment by ID"""
    return db.query(Payment).filter(Payment.id == payment_id).first()

def get_payments_by_user(db: Session, user_id: int):
    """Get all payments for a specific user"""
    return db.query(Payment).filter(Payment.user_id == user_id).all()

def get_payments_by_chit(db: Session, chit_id: int):
    """Get all payments for a specific chit"""
    return db.query(Payment).filter(Payment.chit_id == chit_id).all()

def get_all_payments(db: Session, skip: int = 0, limit: int = 100):
    """Get all payments with related data"""
    payments = db.query(Payment).offset(skip).limit(limit).all()
    return [_payment_to_dict(db, p) for p in payments]

def get_all_payments_for_organization(db: Session, organization_id: int, skip: int = 0, limit: int = 100):
    """Get all payments for chits in an organization"""
    payments = db.query(Payment).join(
        Chit, Payment.chit_id == Chit.id
    ).filter(
        Chit.organization_id == organization_id
    ).offset(skip).limit(limit).all()
    return [_payment_to_dict(db, p) for p in payments]

def get_all_payments_for_admin(db: Session, admin_user_id: int, skip: int = 0, limit: int = 100):
    """Get all payments for chits created by an admin"""
    payments = db.query(Payment).join(
        Chit, Payment.chit_id == Chit.id
    ).filter(
        Chit.created_by == admin_user_id
    ).offset(skip).limit(limit).all()
    return [_payment_to_dict(db, p) for p in payments]

def _payment_to_dict(db: Session, payment: Payment):
    """Convert payment to dictionary with related data"""
    user = db.query(User).filter(User.id == payment.user_id).first()
    chit = db.query(Chit).filter(Chit.id == payment.chit_id).first()
    
    return {
        'id': payment.id,
        'user_id': payment.user_id,
        'chit_id': payment.chit_id,
        'amount': payment.amount,
        'month': payment.month,
        'status': payment.status,
        'paid_at': payment.paid_at.isoformat() if payment.paid_at else None,
        'created_at': payment.created_at.isoformat() if payment.created_at else None,
        'updated_at': payment.updated_at.isoformat() if payment.updated_at else None,
        'member_name': user.name if user else 'Unknown',
        'user_email': user.email if user else 'Unknown',
        'chit_name': chit.name if chit else 'Unknown',
        'date': payment.created_at.strftime('%Y-%m-%d') if payment.created_at else 'N/A'
    }

def update_payment(db: Session, payment_id: int, payment_data: dict):
    """Update a payment record"""
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if db_payment:
        for key, value in payment_data.items():
            if value is not None and hasattr(db_payment, key):
                if key == 'status' and value == 'paid' and not db_payment.paid_at:
                    db_payment.paid_at = datetime.utcnow()
                setattr(db_payment, key, value)
        db.commit()
        db.refresh(db_payment)
    return db_payment

def delete_payment(db: Session, payment_id: int):
    """Delete a payment record"""
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if db_payment:
        db.delete(db_payment)
        db.commit()
    return db_payment

def get_pending_payments(db: Session, skip: int = 0, limit: int = 100):
    """Get all pending payments"""
    payments = db.query(Payment).filter(Payment.status == "pending").offset(skip).limit(limit).all()
    return [_payment_to_dict(db, p) for p in payments]

def mark_payment_paid(db: Session, payment_id: int):
    """Mark a payment as paid"""
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if db_payment:
        db_payment.status = "paid"
        db_payment.paid_at = datetime.utcnow()
        db.commit()
        db.refresh(db_payment)
    return db_payment

def get_payment_statistics(db: Session, chit_id: int = None):
    """Get payment statistics"""
    query = db.query(Payment)
    
    if chit_id:
        query = query.filter(Payment.chit_id == chit_id)
    
    total_payments = query.count()
    paid_count = query.filter(Payment.status == "paid").count()
    pending_count = query.filter(Payment.status == "pending").count()
    total_amount = sum([p.amount for p in query.all()]) or 0
    
    return {
        'total_payments': total_payments,
        'paid_count': paid_count,
        'pending_count': pending_count,
        'total_amount': total_amount
    }
