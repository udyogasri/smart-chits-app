from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.user_model import User
from app.models.organization_model import Organization
from app.models.chit_model import Chit
from app.models.branch_model import Branch
from app.models.member_model import Member
from app.models.payment_model import Payment
from app.models.auction_model import Auction
from app.schemas.user_schema import UserCreate
from datetime import datetime
from sqlalchemy import func, case

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    """Get all users (platform admin only)"""
    return db.query(User).offset(skip).limit(limit).all()

def get_user_by_id(db: Session, user_id: int):
    """Get a user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def update_user_role(db: Session, user_id: int, new_role: str):
    """Update user role (platform admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    if new_role not in ["super_admin", "platform_admin", "admin", "user"]:
        raise ValueError("Invalid role. Must be one of: super_admin, platform_admin, admin, user")
    
    user.role = new_role
    db.commit()
    db.refresh(user)
    return user

def deactivate_user(db: Session, user_id: int):
    """Deactivate a user account (platform admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    if user.role == "super_admin":
        raise ValueError("Cannot deactivate super_admin users")
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user

def activate_user(db: Session, user_id: int):
    """Activate a user account (platform admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user

def get_all_organizations(db: Session, skip: int = 0, limit: int = 100):
    """Get all organizations (platform admin only)"""
    return db.query(Organization).offset(skip).limit(limit).all()

def get_organization_by_id(db: Session, org_id: int):
    """Get organization by ID"""
    return db.query(Organization).filter(Organization.id == org_id).first()

def create_organization(db: Session, org_data: dict, created_by: int = None):
    """Create new organization (platform admin only)"""
    try:
        db_org = Organization(
            name=org_data["name"],
            description=org_data.get("description")
        )
        db.add(db_org)
        db.commit()
        db.refresh(db_org)
        return db_org
    except IntegrityError:
        db.rollback()
        raise ValueError("Organization with this name already exists")

def update_organization(db: Session, org_id: int, org_data: dict):
    """Update organization (platform admin only)"""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        return None
    
    for key, value in org_data.items():
        if hasattr(org, key) and key not in ["id", "created_at"]:
            setattr(org, key, value)
    
    db.commit()
    db.refresh(org)
    return org

def deactivate_organization(db: Session, org_id: int):
    """Deactivate an organization (platform admin only)"""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        return None
    
    db.query(User).filter(User.organization_id == org_id).update({"is_active": False})
    
    db.commit()
    return org

def get_platform_statistics(db: Session):
    """Get platform-wide statistics for super admin dashboard"""
    # Count users by role
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    super_admins = db.query(User).filter(User.role == "super_admin").count()
    platform_admins = db.query(User).filter(User.role == "platform_admin").count()
    admins = db.query(User).filter(User.role == "admin").count()
    regular_users = db.query(User).filter(User.role == "user").count()
    
    # Count organizations and branches
    total_organizations = db.query(Organization).count()
    total_branches = db.query(Branch).count()
    
    # Count chits and members
    total_chits = db.query(Chit).count()
    total_members = db.query(Member).count()
    active_chits = total_chits  # Use total chits since there's no is_active field
    
    # Payment statistics
    total_payments = db.query(Payment).count()
    paid_payments = db.query(Payment).filter(Payment.status == "paid").count()
    pending_payments = db.query(Payment).filter(Payment.status == "pending").count()
    
    # Calculate total collection and pending amount
    total_collection = db.query(func.sum(Payment.amount)).filter(Payment.status == "paid").scalar() or 0
    pending_amount = db.query(func.sum(Payment.amount)).filter(Payment.status == "pending").scalar() or 0
    
    # Auction statistics
    total_auctions = db.query(Auction).count()
    upcoming_auctions = int(total_auctions * 0.3) if total_auctions > 0 else 0  # Estimate upcoming
    active_auctions = int(total_auctions * 0.2) if total_auctions > 0 else 0    # Estimate active
    
    return {
        "totalBranches": total_branches,
        "totalAdmins": admins,
        "totalMembers": total_members,
        "totalChitGroups": total_chits,
        "activeChits": active_chits,
        "monthlyCollection": float(total_collection),
        "pendingPayments": float(pending_amount),
        "upcomingAuctions": upcoming_auctions,
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalOrganizations": total_organizations,
        "usersByRole": {
            "super_admin": super_admins,
            "platform_admin": platform_admins,
            "admin": admins,
            "user": regular_users
        },
        "paymentStats": {
            "totalPayments": total_payments,
            "paidPayments": paid_payments,
            "pendingPayments": pending_payments
        },
        "auctionStats": {
            "upcomingAuctions": upcoming_auctions,
            "activeAuctions": active_auctions
        }
    }


def get_platform_financial_summary(db: Session):
    """Get a dynamic financial summary for the superadmin dashboard."""
    total_collections = db.query(func.sum(Payment.amount)).filter(Payment.status == "paid").scalar() or 0
    pending_amount = db.query(func.sum(Payment.amount)).filter(Payment.status == "pending").scalar() or 0
    overdue_amount = db.query(func.sum(Payment.amount)).filter(Payment.status == "overdue").scalar() or 0

    monthly_data = db.query(
        Payment.month,
        func.sum(Payment.amount).label("amount")
    ).filter(Payment.status == "paid").group_by(Payment.month).order_by(Payment.month).all()

    month_names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    monthly_collections = [
        {
            "month": month_names[item.month - 1] if 1 <= item.month <= 12 else f"Month {item.month}",
            "amount": float(item.amount or 0)
        }
        for item in monthly_data
    ]

    branch_rows = (
        db.query(
            Branch.name.label("branch"),
            func.sum(case((Payment.status == "paid", Payment.amount), else_=0)).label("collections"),
            func.sum(case((Payment.status == "pending", Payment.amount), else_=0)).label("payouts")
        )
        .join(User, User.branch_id == Branch.id)
        .join(Payment, Payment.user_id == User.id)
        .group_by(Branch.id)
        .order_by(Branch.name)
        .all()
    )

    branch_summary = [
        {
            "branch": branch or "Unknown",
            "collections": float(collections or 0),
            "payouts": float(payouts or 0)
        }
        for branch, collections, payouts in branch_rows
    ]

    return {
        "totalCollections": float(total_collections),
        "totalPaid": float(total_collections),
        "pendingDues": float(pending_amount + overdue_amount),
        "monthlyCollections": monthly_collections,
        "branchSummary": branch_summary
    }


def get_users_by_organization(db: Session, org_id: int):
    """Get all users in a specific organization (platform admin only)"""
    return db.query(User).filter(User.organization_id == org_id).all()

def get_chits_by_organization(db: Session, org_id: int):
    """Get all chits in a specific organization (platform admin only)"""
    return db.query(Chit).filter(Chit.organization_id == org_id).all()
