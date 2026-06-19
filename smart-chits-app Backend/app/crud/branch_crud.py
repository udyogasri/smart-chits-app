from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.branch_model import Branch
from app.schemas.branch_schema import BranchCreate, BranchUpdate
from datetime import datetime


def get_all_branches(db: Session, skip: int = 0, limit: int = 100):
    """Get all branches"""
    return db.query(Branch).offset(skip).limit(limit).all()


def get_branch_by_id(db: Session, branch_id: int):
    """Get a branch by ID"""
    return db.query(Branch).filter(Branch.id == branch_id).first()


def get_branch_by_code(db: Session, code: str):
    """Get a branch by code"""
    return db.query(Branch).filter(Branch.code == code).first()


def create_branch(db: Session, branch_data: BranchCreate):
    """Create a new branch"""
    # Check if branch code already exists
    existing = get_branch_by_code(db, branch_data.code)
    if existing:
        raise ValueError(f"Branch with code '{branch_data.code}' already exists")
    
    db_branch = Branch(
        name=branch_data.name,
        code=branch_data.code,
        address=branch_data.address,
        phone=branch_data.phone,
        email=branch_data.email,
        manager_name=branch_data.manager_name,
        is_active=True,
        location=branch_data.address  # Set location for backward compatibility
    )
    
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch


def update_branch(db: Session, branch_id: int, branch_data: BranchUpdate):
    """Update a branch"""
    db_branch = get_branch_by_id(db, branch_id)
    if not db_branch:
        raise ValueError(f"Branch with ID {branch_id} not found")
    
    # Check if new code already exists (if code is being updated)
    if branch_data.code and branch_data.code != db_branch.code:
        existing = get_branch_by_code(db, branch_data.code)
        if existing:
            raise ValueError(f"Branch with code '{branch_data.code}' already exists")
    
    update_data = branch_data.dict(exclude_unset=True)
    update_data['updated_at'] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(db_branch, field, value)
    
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch


def delete_branch(db: Session, branch_id: int):
    """Delete a branch"""
    db_branch = get_branch_by_id(db, branch_id)
    if not db_branch:
        raise ValueError(f"Branch with ID {branch_id} not found")
    
    db.delete(db_branch)
    db.commit()
    return True


def deactivate_branch(db: Session, branch_id: int):
    """Deactivate a branch"""
    db_branch = get_branch_by_id(db, branch_id)
    if not db_branch:
        raise ValueError(f"Branch with ID {branch_id} not found")
    
    db_branch.is_active = False
    db_branch.updated_at = datetime.utcnow()
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch


def activate_branch(db: Session, branch_id: int):
    """Activate a branch"""
    db_branch = get_branch_by_id(db, branch_id)
    if not db_branch:
        raise ValueError(f"Branch with ID {branch_id} not found")
    
    db_branch.is_active = True
    db_branch.updated_at = datetime.utcnow()
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch
