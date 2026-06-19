from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.organization_model import Organization
from app.schemas.organization_schema import OrganizationCreate, OrganizationRegister
from app.utils.hashing import hash_password

def create_organization(db: Session, org: OrganizationCreate):
    """Create a new organization"""
    db_org = Organization(
        organization_name=org.organization_name,
        organization_type=org.organization_type,
        registration_number=org.registration_number,
        company_email=org.company_email,
        company_phone_number=org.company_phone_number,
        description=org.description
    )
    
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    
    return db_org

def register_organization(db: Session, data: OrganizationRegister):
    """Register a new organization with all admin and organization details stored in organization table"""
    try:
        # Validate password confirmation
        if data.password != data.confirm_password:
            raise ValueError("Password and confirm password do not match")
        
        # Hash password
        hashed_pwd = hash_password(data.password)
        
        # Create organization with all details
        db_org = Organization(
            # Admin User Details
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            phone_number=data.phone_number,
            password=hashed_pwd,  # Store hashed password
            confirm_password=hashed_pwd,  # Store hashed password for consistency
            
            # Organization Details
            organization_name=data.organization_name,
            organization_type=data.organization_type,
            registration_number=data.registration_number,
            company_email=data.company_email,
            company_phone_number=data.company_phone_number,
            description=data.description
        )
        
        db.add(db_org)
        db.commit()
        db.refresh(db_org)
        
        return {
            "message": "Organization registered successfully",
            "organization": db_org
        }
    except IntegrityError:
        db.rollback()
        raise ValueError("Email or registration number already exists")
