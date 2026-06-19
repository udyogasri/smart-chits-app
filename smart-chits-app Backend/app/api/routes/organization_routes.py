from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.models.user_model import User
from app.models.organization_model import Organization
from app.schemas.organization_schema import OrganizationCreate, OrganizationResponse, OrganizationRegister
from app.crud.organization_crud import register_organization

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_organization_endpoint(data: OrganizationRegister, db: Session = Depends(get_db)):
    """Register a new organization with all admin and organization details stored in organization table"""
    try:
        result = register_organization(db, data)
        org = result["organization"]
        
        # Convert SQLAlchemy model to dict for serialization
        return {
            "organization": {
                "id": org.id,
                "first_name": org.first_name,
                "last_name": org.last_name,
                "email": org.email,
                "phone_number": org.phone_number,
                "organization_name": org.organization_name,
                "organization_type": org.organization_type,
                "registration_number": org.registration_number,
                "company_email": org.company_email,
                "company_phone_number": org.company_phone_number,
                "description": org.description,
                "created_at": org.created_at,
                "updated_at": org.updated_at
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization_endpoint(
    org: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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

@router.get("/", response_model=List[OrganizationResponse])
def get_organizations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all organizations"""
    if current_user.role in ["super_admin", "system_admin", "platform_admin"]:
        return db.query(Organization).offset(skip).limit(limit).all()
    else:
        return []

@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific organization by ID"""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org
