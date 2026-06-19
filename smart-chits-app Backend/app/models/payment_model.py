from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    chit_id = Column(Integer, ForeignKey("chits.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    month = Column(Integer, default=1)
    due_date = Column(DateTime(timezone=True), nullable=True)
    penalty_amount = Column(Float, default=0)
    status = Column(String, default="pending")  # pending, paid, overdue, upcoming
    payment_method = Column(String, nullable=True)  # UPI, Card, Net Banking, Wallet
    transaction_id = Column(String, nullable=True, unique=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    chit = relationship("Chit", back_populates="payments")
    user = relationship("User")
