from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.schemas.chit_schema import ChitCreate, ChitResponse
from app.schemas.member_schema import AddMember, MemberResponse

from app.services.chit_service import create_chit, get_all_chits
from app.services.member_service import add_member_to_chit

from app.api.deps import get_current_admin, get_current_user
from app.models.user_model import User
from app.models.chit_model import Chit
from app.models.member_model import Member
from app.models.payment_model import Payment
from app.models.auction_model import Auction
from app.crud.payment_crud import _payment_to_dict

router = APIRouter()


# ✅ Create chit (ADMIN ONLY)
@router.post("/create", response_model=ChitResponse)
def create_chit_route(
    data: ChitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return create_chit(db, data)


# ✅ View all chits with member counts
@router.get("/", response_model=list)
def get_chits_route(db: Session = Depends(get_db)):
    """Get all chits with actual member counts"""
    chits = get_all_chits(db)
    
    # Enrich with member counts
    chits_data = []
    for chit in chits:
        member_count = db.query(func.count(Member.id)).filter(
            Member.chit_id == chit.id
        ).scalar() or 0
        
        chit_dict = {
            "id": chit.id,
            "name": chit.name,
            "description": chit.description,
            "organizer": "SmartChits",
            "amount": chit.chit_fund or 0,
            "chit_fund": chit.chit_fund or 0,
            "duration": chit.total_months or 0,
            "members": member_count,  # Real count from database
            "current_members": member_count,
            "total_members": chit.total_members,
            "monthlyContribution": chit.installment_amount or 0,
            "installment_amount": chit.installment_amount or 0,
            "status": "active" if chit.bidding_open else "upcoming",
            "bidding_open": chit.bidding_open,
            "total_months": chit.total_months or 0,
            "nextAuction": "2026-06-15",
            "organization_id": chit.organization_id,
            "created_at": chit.created_at,
            "updated_at": chit.updated_at
        }
        chits_data.append(chit_dict)
    
    return chits_data


# ✅ Get chit details with member count
@router.get("/{chit_id}")
def get_chit_details(chit_id: int, db: Session = Depends(get_db)):
    """Get specific chit details with member info"""
    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    
    if not chit:
        raise HTTPException(status_code=404, detail="Chit not found")
    
    member_count = db.query(func.count(Member.id)).filter(
        Member.chit_id == chit_id
    ).scalar() or 0
    
    return {
        "id": chit.id,
        "name": chit.name,
        "description": chit.description,
        "chit_fund": chit.chit_fund,
        "amount": chit.chit_fund,
        "installment_amount": chit.installment_amount,
        "monthlyContribution": chit.installment_amount,
        "total_members": chit.total_members,
        "current_members": member_count,
        "members": member_count,
        "duration": chit.total_months,
        "total_months": chit.total_months,
        "current_month": chit.current_month,
        "bidding_open": chit.bidding_open,
        "organization_id": chit.organization_id,
        "created_at": chit.created_at,
        "updated_at": chit.updated_at
    }


# ✅ Join chit (NORMAL USER)
@router.post("/{chit_id}/join")
def join_chit(
    chit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allow a normal user to join a chit"""
    
    # Verify user is not admin
    if current_user.role in ["admin", "superadmin", "system_admin"]:
        raise HTTPException(status_code=403, detail="Only normal users can join chits")
    
    # Call existing member service to add member
    result = add_member_to_chit(db, current_user.id, chit_id)
    
    return {
        "success": True,
        "message": "Successfully joined chit",
        "member_id": result.id,
        "chit_id": result.chit_id,
        "joined_at": result.joined_at
    }


# ✅ Check if user is already in chit
@router.get("/{chit_id}/is-member")
def is_user_member(
    chit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if current user is already a member of this chit"""
    member = db.query(Member).filter(
        Member.user_id == current_user.id,
        Member.chit_id == chit_id
    ).first()
    
    return {
        "is_member": member is not None,
        "member_id": member.id if member else None
    }


# ✅ Add member to chit (ADMIN ONLY)
@router.post("/add-member", response_model=MemberResponse)
def add_member_route(
    data: AddMember,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return add_member_to_chit(db, data.user_id, data.chit_id)


# ✅ Get payments for a specific chit
@router.get("/{chit_id}/payments")
def get_chit_payments(
    chit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all payments for a specific chit"""
    # Verify chit exists
    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    if not chit:
        raise HTTPException(status_code=404, detail="Chit not found")
    
    # Get payments for this chit
    payments = db.query(Payment).filter(Payment.chit_id == chit_id).all()
    
    return [_payment_to_dict(db, p) for p in payments]


# ✅ Get members of a specific chit with detailed info
@router.get("/{chit_id}/members")
def get_chit_members(
    chit_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all members of a specific chit with detailed information"""
    # Verify chit exists
    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    if not chit:
        raise HTTPException(status_code=404, detail="Chit not found")
    
    # Get members
    members = db.query(Member).filter(
        Member.chit_id == chit_id
    ).offset(skip).limit(limit).all()
    
    members_data = []
    for member in members:
        # Get user info
        user = member.user
        
        # Get member's payments for this chit
        member_payments = db.query(Payment).filter(
            Payment.user_id == member.user_id,
            Payment.chit_id == chit_id
        ).all()
        
        paid_months = len([p for p in member_payments if p.status == 'paid'])
        pending_months = len([p for p in member_payments if p.status == 'pending'])
        
        members_data.append({
            'member_id': member.id,
            'user_id': member.user_id,
            'name': user.name if user else 'Unknown',
            'email': user.email if user else 'Unknown',
            'joined_at': member.joined_at,
            'paid_months': paid_months,
            'pending_months': pending_months,
            'already_won': member.already_won_auction,
            'total_dividend': member.total_dividend_earned,
            'phone': getattr(user, 'phone_number', None) if user else None
        })
    
    total_members = db.query(func.count(Member.id)).filter(
        Member.chit_id == chit_id
    ).scalar() or 0
    
    return {
        'members': members_data,
        'total': total_members,
        'skip': skip,
        'limit': limit
    }


# ✅ Get auctions for a specific chit
@router.get("/{chit_id}/auctions")
def get_chit_auctions(
    chit_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get auction history for a specific chit"""
    # Verify chit exists
    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    if not chit:
        raise HTTPException(status_code=404, detail="Chit not found")
    
    # Get auctions
    auctions = db.query(Auction).filter(
        Auction.chit_group_id == chit_id
    ).offset(skip).limit(limit).all()
    
    auctions_data = []
    for auction in auctions:
        winner_name = 'Pending'
        if auction.winner_member:
            winner_user = auction.winner_member.user
            winner_name = winner_user.name if winner_user else 'Unknown'
        
        auctions_data.append({
            'auction_id': auction.id,
            'auction_number': auction.auction_number,
            'auction_month': auction.auction_month,
            'auction_date': auction.auction_date,
            'status': auction.status,
            'winning_bid_amount': auction.winning_bid_amount,
            'winner_name': winner_name,
            'total_pool': auction.total_pool_amount,
            'foreman_commission': auction.foreman_commission_amount,
            'dividend_per_member': auction.dividend_per_member,
            'started_at': auction.started_at,
            'ended_at': auction.ended_at
        })
    
    total_auctions = db.query(func.count(Auction.id)).filter(
        Auction.chit_group_id == chit_id
    ).scalar() or 0
    
    return {
        'auctions': auctions_data,
        'total': total_auctions,
        'skip': skip,
        'limit': limit
    }
