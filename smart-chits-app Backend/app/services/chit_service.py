from sqlalchemy.orm import Session
from app.models.chit_model import Chit
from app.models.member_model import Member
from app.services.notification_service import create_notification


# ✅ Create chit
def create_chit(db: Session, data):
    chit = Chit(**data.model_dump())
    db.add(chit)
    db.commit()
    db.refresh(chit)

    create_notification(db, None, f"Payment due for chit '{chit.name}' month {chit.current_month}")
    return chit


# ✅ Get all chits
def get_all_chits(db: Session):
    return db.query(Chit).all()


# ✅ Join chit
def join_chit(db: Session, user_id: int, chit_id: int):

    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    if not chit:
        raise Exception("Chit not found")

    # check already joined
    existing = db.query(Member).filter(
        Member.user_id == user_id,
        Member.chit_id == chit_id
    ).first()

    if existing:
        raise Exception("Already joined")

    # check limit
    count = db.query(Member).filter(Member.chit_id == chit_id).count()
    if count >= chit.total_members:
        raise Exception("Chit is full")

    member = Member(user_id=user_id, chit_id=chit_id)
    db.add(member)
    db.commit()
    db.refresh(member)

    return member