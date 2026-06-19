from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.payment_model import Payment
from app.models.chit_model import Chit
from app.models.member_model import Member
from app.services.notification_service import create_notification


def make_payment(db: Session, user_id: int, chit_id: int, amount: float):

    # 1. Check chit exists
    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    if not chit:
        raise HTTPException(status_code=404, detail="Chit not found")

    # 2. Prevent payment if chit is completed
    if chit.current_month > chit.duration:
        raise HTTPException(status_code=400, detail="Chit is already completed")

    # 3. Prevent payment during bidding
    if chit.bidding_open:
        raise HTTPException(status_code=400, detail="Payments are closed while bidding is open")

    current_month = chit.current_month

    # 4. Check user is member
    member = db.query(Member).filter(
        Member.user_id == user_id,
        Member.chit_id == chit_id
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="User is not a member of this chit")

    # 5. Validate amount
    if amount != chit.monthly_amount:
        raise HTTPException(status_code=400, detail="Invalid payment amount")

    # 6. Prevent duplicate payment
    existing = db.query(Payment).filter(
        Payment.user_id == user_id,
        Payment.chit_id == chit_id,
        Payment.month == current_month
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already paid for this month")

    # 7. Create payment
    payment = Payment(
        user_id=user_id,
        chit_id=chit_id,
        amount=amount,
        month=current_month,
        status="paid"
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    # 8. Check if all members paid → open bidding
    check_and_open_bidding(db, chit_id)

    return payment


def check_and_open_bidding(db: Session, chit_id: int):

    chit = db.query(Chit).filter(Chit.id == chit_id).first()

    if not chit:
        raise HTTPException(status_code=404, detail="Chit not found")

    current_month = chit.current_month

    if current_month > chit.duration:
        return "Chit already completed"

    # 🔥 FIX: count members dynamically (better than stored value)
    total_members = db.query(Member).filter(Member.chit_id == chit_id).count()

    paid_count = db.query(Payment).filter(
        Payment.chit_id == chit_id,
        Payment.month == current_month,
        Payment.status == "paid"
    ).count()

    if paid_count == total_members:
        chit.bidding_open = True
        db.commit()

        create_notification(
            db,
            None,
            f"Auction started for chit '{chit.name}' month {current_month}"
        )

        return "Auction started"

    return "Waiting for all payments"