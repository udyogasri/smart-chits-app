from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.chit_model import Chit
from app.models.member_model import Member
from app.models.payment_model import Payment
from app.models.auction_model import Auction
from app.schemas.chit_schema import ChitCreate
import logging

def create_chit(db: Session, chit: ChitCreate, created_by: int, organization_id: int = None):
    db_chit = Chit(
        name=chit.name,
        total_members=chit.total_members,
        duration=chit.duration,
        monthly_amount=chit.monthly_amount,
        current_month=chit.current_month,
        bidding_open=chit.bidding_open,
        total_chit_amount=chit.total_chit_amount,
        chit_fund=chit.chit_fund,
        installment_amount=chit.installment_amount,
        installment_frequency=chit.installment_frequency,
        total_months=chit.total_months,
        description=chit.description,
        organization_id=organization_id or chit.organization_id,
        created_by=created_by
    )
    db.add(db_chit)
    db.commit()
    db.refresh(db_chit)
    return db_chit

def get_chit_by_id(db: Session, chit_id: int):
    return db.query(Chit).filter(Chit.id == chit_id).first()

def get_all_chits(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Chit).offset(skip).limit(limit).all()

def get_all_chits_with_member_count(db: Session, skip: int = 0, limit: int = 100):
    """Get all chits with their member count"""
    chits = db.query(
        Chit,
        func.count(Member.id).label('member_count')
    ).outerjoin(Member).group_by(Chit.id).order_by(desc(Chit.created_at)).offset(skip).limit(limit).all()
    
    result = []
    for chit, member_count in chits:
        chit_dict = {
            'id': chit.id,
            'name': chit.name,
            'total_members': chit.total_members,
            'chit_fund': chit.chit_fund,
            'installment_amount': chit.installment_amount,
            'installment_frequency': chit.installment_frequency,
            'total_months': chit.total_months,
            'current_month': chit.current_month,
            'bidding_open': chit.bidding_open,
            'description': chit.description,
            'organization_id': chit.organization_id,
            'created_by': chit.created_by,
            'created_at': chit.created_at,
            'updated_at': chit.updated_at,
            'member_count': member_count or 0
        }
        result.append(chit_dict)
    
    return result

def get_chits_by_organization(db: Session, organization_id: int):
    return db.query(Chit).filter(Chit.organization_id == organization_id).all()

def get_chits_by_organization_with_member_count(db: Session, organization_id: int):
    """Get all chits in an organization with member count"""
    chits = db.query(
        Chit,
        func.count(Member.id).label('member_count')
    ).outerjoin(Member).filter(Chit.organization_id == organization_id).group_by(Chit.id).order_by(desc(Chit.created_at)).all()
    
    result = []
    for chit, member_count in chits:
        chit_dict = {
            'id': chit.id,
            'name': chit.name,
            'chit_fund': chit.chit_fund,
            'installment_amount': chit.installment_amount,
            'installment_frequency': chit.installment_frequency,
            'total_months': chit.total_months,
            'total_members': chit.total_members,
            'current_month': chit.current_month,
            'bidding_open': chit.bidding_open,
            'description': chit.description,
            'organization_id': chit.organization_id,
            'created_by': chit.created_by,
            'created_at': chit.created_at,
            'updated_at': chit.updated_at,
            'member_count': member_count or 0
        }
        result.append(chit_dict)
    
    return result

def update_chit(db: Session, chit_id: int, chit_data: dict):
    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    if not chit:
        return None
    for key, value in chit_data.items():
        if hasattr(chit, key) and value is not None:
            setattr(chit, key, value)
    db.commit()
    db.refresh(chit)
    return chit

def delete_chit(db: Session, chit_id: int):
    logging.info(f"Deleting chit {chit_id}")
    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    if chit:
        try:
            db.delete(chit)
            db.commit()
            logging.info(f"Chit {chit_id} deleted successfully")
            return chit
        except Exception as e:
            logging.error(f"Error deleting chit {chit_id}: {str(e)}")
            db.rollback()
            raise e
    logging.warning(f"Chit {chit_id} not found")
    return None
