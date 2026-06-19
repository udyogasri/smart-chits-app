from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    chit_id = Column(Integer, ForeignKey("chits.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    already_won_auction = Column(Boolean, default=False, nullable=False)
    winning_auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=True)
    total_dividend_earned = Column(Float, default=0.0, nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    chit = relationship("Chit", back_populates="members")
    user = relationship("User")
    winning_auction = relationship("Auction", foreign_keys=[winning_auction_id])
