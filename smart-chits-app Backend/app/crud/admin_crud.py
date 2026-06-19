from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, desc
import logging
from app.models.user_model import User
from app.models.chit_model import Chit
from app.models.member_model import Member
from app.models.payment_model import Payment
from app.models.auction_model import Auction
from app.models.audit_log_model import AuditLog
from app.schemas.user_schema import AdminCreate
from app.utils.hashing import hash_password
from datetime import datetime


def get_all_admins(db: Session, skip: int = 0, limit: int = 100):
    """Get all admins (users with admin role)"""
    admins = db.query(User).filter(User.role == "admin").offset(skip).limit(limit).all()
    
    # Ensure all admins have valid first_name and last_name
    for admin in admins:
        if not admin.first_name:
            admin.first_name = "Admin"
        if not admin.last_name:
            admin.last_name = "User"
    
    return admins


def get_admin_by_id(db: Session, admin_id: int):
    """Get an admin by ID"""
    admin = db.query(User).filter(User.id == admin_id, User.role == "admin").first()
    if admin:
        if not admin.first_name:
            admin.first_name = "Admin"
        if not admin.last_name:
            admin.last_name = "User"
    return admin


def get_admin_by_email(db: Session, email: str):
    """Get an admin by email"""
    return db.query(User).filter(User.email == email, User.role == "admin").first()


def create_admin(db: Session, admin_data: AdminCreate):
    """Create a new admin user"""
    # Check if email already exists
    existing_admin = get_admin_by_email(db, admin_data.email)
    if existing_admin:
        raise ValueError(f"Admin with email '{admin_data.email}' already exists")
    
    # Check if email exists in any role
    existing_user = db.query(User).filter(User.email == admin_data.email).first()
    if existing_user:
        raise ValueError(f"Email '{admin_data.email}' is already registered")
    
    hashed_pwd = hash_password(admin_data.password)
    
    db_admin = User(
        first_name=admin_data.first_name or "Admin",
        last_name=admin_data.last_name or "User",
        name=f"{admin_data.first_name or 'Admin'} {admin_data.last_name or 'User'}",
        email=admin_data.email,
        phone_number=admin_data.phone_number or "",
        hashed_password=hashed_pwd,
        role="admin",
        branch_id=admin_data.branch_id,
        is_active=True
    )
    
    db.add(db_admin)
    try:
        db.commit()
        db.refresh(db_admin)
        return db_admin
    except IntegrityError as e:
        db.rollback()
        raise ValueError(f"Failed to create admin: {str(e)}")


def get_admin_statistics(db: Session, current_user: User):
    """Get organization-scoped statistics for admin dashboard."""
    org_id = None
    if current_user.role == "admin":
        org_id = getattr(current_user, "organization_id", None)

    try:
        logging.info(f"Calculating stats for org_id: {org_id}, user_role: {current_user.role}")
        
        # 1. Count total chit groups
        chit_query = db.query(Chit)
        if org_id:
            chit_query = chit_query.filter(Chit.organization_id == org_id)
        total_chit_groups = chit_query.count()
        logging.info(f"Total chit groups: {total_chit_groups}")

        # 2. Count total members (distinct user_id in members for the organization's chits)
        member_query = db.query(func.count(func.distinct(Member.user_id)))
        member_query = member_query.join(Chit, Member.chit_id == Chit.id)
        if org_id:
            member_query = member_query.filter(Chit.organization_id == org_id)
        total_members = member_query.scalar() or 0
        logging.info(f"Total members: {total_members}")

        # 3. Count active chits (chits with bidding_open = True)
        active_chits_query = db.query(Chit)
        if org_id:
            active_chits_query = active_chits_query.filter(Chit.organization_id == org_id)
        active_chits = active_chits_query.filter(Chit.bidding_open == True).count()
        logging.info(f"Active chits: {active_chits}")

        # 4. Calculate monthly collection (paid payments)
        collection_query = db.query(func.coalesce(func.sum(Payment.amount), 0.0))
        collection_query = collection_query.join(Chit, Payment.chit_id == Chit.id)
        if org_id:
            collection_query = collection_query.filter(Chit.organization_id == org_id)
        collection_query = collection_query.filter(Payment.status == "paid")
        monthly_collection = float(collection_query.scalar() or 0.0)
        logging.info(f"Monthly collection: {monthly_collection}")

        # 5. Calculate pending payments
        pending_query = db.query(func.coalesce(func.sum(Payment.amount), 0.0))
        pending_query = pending_query.join(Chit, Payment.chit_id == Chit.id)
        if org_id:
            pending_query = pending_query.filter(Chit.organization_id == org_id)
        pending_query = pending_query.filter(Payment.status == "pending")
        pending_payments = float(pending_query.scalar() or 0.0)
        logging.info(f"Pending payments: {pending_payments}")

        # 6. Count upcoming auctions (Auction uses chit_group_id)
        auction_query = db.query(func.count(Auction.id))
        auction_query = auction_query.join(Chit, Auction.chit_group_id == Chit.id)
        if org_id:
            auction_query = auction_query.filter(Chit.organization_id == org_id)
        # Filter for upcoming auctions (not completed)
        upcoming_auctions = auction_query.scalar() or 0
        logging.info(f"Upcoming auctions: {upcoming_auctions}")

        result = {
            "totalMembers": int(total_members),
            "totalChitGroups": int(total_chit_groups),
            "activeChits": int(active_chits),
            "monthlyCollection": monthly_collection,
            "pendingPayments": pending_payments,
            "upcomingAuctions": int(upcoming_auctions)
        }
        logging.info(f"Final stats result: {result}")
        return result
        
    except Exception as e:
        logging.error(f"Error calculating admin statistics: {str(e)}", exc_info=True)
        # Return default stats on error
        return {
            "totalMembers": 0,
            "totalChitGroups": 0,
            "activeChits": 0,
            "monthlyCollection": 0.0,
            "pendingPayments": 0.0,
            "upcomingAuctions": 0
        }


def delete_admin(db: Session, admin_id: int):
    """Delete an admin user"""
    db_admin = get_admin_by_id(db, admin_id)
    if not db_admin:
        raise ValueError(f"Admin with ID {admin_id} not found")
    
    db.delete(db_admin)
    db.commit()
    return {"message": "Admin deleted successfully"}


def update_admin_branch(db: Session, admin_id: int, branch_id: int):
    """Update admin's branch assignment"""
    db_admin = get_admin_by_id(db, admin_id)
    if not db_admin:
        raise ValueError(f"Admin with ID {admin_id} not found")
    
    db_admin.branch_id = branch_id
    db.commit()
    db.refresh(db_admin)
    return db_admin


def get_recent_activity(db: Session, current_user: User, limit: int = 10):
    """Get recent activity logs for admin dashboard"""
    try:
        # Fetch recent activity logs ordered by timestamp descending
        query = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit)
        
        # If user is branch admin, filter by their branch (from audit logs where user_id matches branch)
        if current_user.role == "admin" and current_user.branch_id:
            # You can add branch-specific filtering here if needed
            # For now, returning all activity visible to the admin
            pass
        
        activity_logs = query.all()
        return activity_logs
    except Exception as e:
        logging.error(f"Error fetching recent activity: {str(e)}", exc_info=True)
        return []
