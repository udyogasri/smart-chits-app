from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.member_model import Member
from app.models.chit_model import Chit


def add_member_to_chit(db: Session, user_id: int, chit_id: int):

    # 1. Check if chit exists
    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    if not chit:
        raise HTTPException(status_code=404, detail="Chit not found")

    # 2. Check if user already added
    existing = db.query(Member).filter(
        Member.user_id == user_id,
        Member.chit_id == chit_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="User already in this chit")

    # 3. Check member limit
    member_count = db.query(Member).filter(Member.chit_id == chit_id).count()

    if member_count >= chit.total_members:
        raise HTTPException(status_code=400, detail="Chit is full")

    # 4. Add member
    member = Member(
        user_id=user_id,
        chit_id=chit_id
    )

    db.add(member)
    db.commit()
    db.refresh(member)

    return member