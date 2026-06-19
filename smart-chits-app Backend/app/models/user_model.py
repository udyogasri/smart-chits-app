from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    name = Column(String, nullable=True)  # Kept for backward compatibility
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Settings fields
    avatar = Column(Text, nullable=True)  # Base64 encoded image
    preferences = Column(JSON, nullable=True)  # {language, timezone, currency}
    notifications = Column(JSON, nullable=True)  # {payment_reminders, chit_announcements, monthly_statements, security_alerts, marketing_emails}
    
    # Relationships
    branch = relationship("Branch", back_populates="users")
    organization = relationship("Organization", back_populates="users")
    