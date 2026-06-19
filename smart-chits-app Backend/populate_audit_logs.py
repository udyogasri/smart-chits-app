#!/usr/bin/env python3
"""
Script to populate audit logs with sample data for testing the Recent Activity component
"""
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

print(f"Connecting to database: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.models.audit_log_model import AuditLog
from app.models.user_model import User

def populate_audit_logs():
    """Populate audit logs with sample data"""
    db = SessionLocal()
    
    try:
        # Get current admin user (Ganesh's user)
        admin_user = db.query(User).filter(User.email == "kondetiganesh43@gmail.com").first()
        if not admin_user:
            print("❌ Error: Could not find admin user")
            return
        
        admin_id = admin_user.id
        print(f"Using admin user: {admin_user.name} (ID: {admin_id})")
        
        # Sample activity data
        activities = [
            {
                "user_id": admin_id,
                "action": "CREATE",
                "resource": "Member",
                "detail": "Created new member: Rajesh Kumar",
                "user_name": admin_user.name,
                "success": True,
                "timestamp": datetime.utcnow() - timedelta(minutes=5)
            },
            {
                "user_id": admin_id,
                "action": "UPDATE",
                "resource": "Payment",
                "detail": "Marked payment as completed - Amount: ₹50000",
                "user_name": admin_user.name,
                "success": True,
                "timestamp": datetime.utcnow() - timedelta(minutes=15)
            },
            {
                "user_id": admin_id,
                "action": "CREATE",
                "resource": "Auction",
                "detail": "Created new auction: AUC-GK-006 - ₹400000",
                "user_name": admin_user.name,
                "success": True,
                "timestamp": datetime.utcnow() - timedelta(hours=1)
            },
            {
                "user_id": admin_id,
                "action": "DELETE",
                "resource": "Member",
                "detail": "Removed member from chit group",
                "user_name": admin_user.name,
                "success": True,
                "timestamp": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "user_id": admin_id,
                "action": "CREATE",
                "resource": "ChitGroup",
                "detail": "Created new chit group: Investment Fund",
                "user_name": admin_user.name,
                "success": True,
                "timestamp": datetime.utcnow() - timedelta(hours=3)
            },
            {
                "user_id": admin_id,
                "action": "UPDATE",
                "resource": "Auction",
                "detail": "Updated auction status to ACTIVE",
                "user_name": admin_user.name,
                "success": True,
                "timestamp": datetime.utcnow() - timedelta(hours=4)
            },
            {
                "user_id": admin_id,
                "action": "LOGIN",
                "resource": "User",
                "detail": "User logged in from 192.168.1.100",
                "user_name": admin_user.name,
                "success": True,
                "timestamp": datetime.utcnow() - timedelta(hours=5)
            },
            {
                "user_id": admin_id,
                "action": "UPDATE",
                "resource": "Member",
                "detail": "Updated member contact information",
                "user_name": admin_user.name,
                "success": True,
                "timestamp": datetime.utcnow() - timedelta(hours=6)
            },
            {
                "user_id": admin_id,
                "action": "CREATE",
                "resource": "Payment",
                "detail": "Created payment reminder for overdue payments",
                "user_name": "System",
                "success": True,
                "timestamp": datetime.utcnow() - timedelta(hours=7)
            },
            {
                "user_id": admin_id,
                "action": "EXPORT",
                "resource": "Report",
                "detail": "Exported monthly financial report",
                "user_name": admin_user.name,
                "success": True,
                "timestamp": datetime.utcnow() - timedelta(hours=8)
            },
        ]
        
        # Clear existing audit logs (optional)
        db.query(AuditLog).delete()
        
        # Add new audit logs
        for activity in activities:
            log = AuditLog(**activity)
            db.add(log)
        
        db.commit()
        print(f"✅ Successfully populated {len(activities)} audit log entries")
        
        # Display the logs
        logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
        print("\n📊 Audit Logs:")
        print("-" * 100)
        for log in logs:
            status = "✓" if log.success else "✗"
            timestamp = log.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            print(f"{status} [{timestamp}] {log.action:8} | {log.resource:15} | {log.detail} | by {log.user_name}")
        print("-" * 100)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    populate_audit_logs()
