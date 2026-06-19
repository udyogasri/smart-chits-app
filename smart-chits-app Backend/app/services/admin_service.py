from sqlalchemy.orm import Session
from app.models.user_model import User
from app.models.chit_model import Chit
from app.schemas.chit_schema import ChitCreate
from app.crud.chit_crud import create_chit

class AdminService:
    @staticmethod
    def create_chit_fund(db: Session, chit_data: ChitCreate, admin_id: int, organization_id: int):
        """Create a new chit fund"""
        return create_chit(db, chit_data, admin_id, organization_id)
    
    @staticmethod
    def get_organization_users(db: Session, organization_id: int):
        """Get all users in an organization"""
        return db.query(User).filter(User.organization_id == organization_id).all()
    
    @staticmethod
    def get_organization_chits(db: Session, organization_id: int):
        """Get all chits in an organization"""
        return db.query(Chit).filter(Chit.organization_id == organization_id).all()
