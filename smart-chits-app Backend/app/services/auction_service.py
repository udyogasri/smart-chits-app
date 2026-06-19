from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.chit_model import Chit
from app.models.member_model import Member
from app.models.payment_model import Payment
from app.models.auction_model import Auction
from app.models.auction_bid_model import AuctionBid
from app.services.notification_service import create_notification
from app.services.audit_log_service import create_audit_log
from app.services.socket_service import broadcast_auction_event, broadcast_auction_timer

AUCTION_STATUS_PENDING = "PENDING"
AUCTION_STATUS_LIVE = "LIVE"
AUCTION_STATUS_COMPLETED = "COMPLETED"
AUCTION_STATUS_CANCELLED = "CANCELLED"


def _generate_auction_number() -> str:
    return f"AUC-{uuid4().hex[:8].upper()}"


def create_auction(db: Session, current_user, data: dict):
    chit = db.query(Chit).filter(Chit.id == data["chit_group_id"]).first()
    if not chit:
        raise ValueError("Chit group not found")

    if data["total_pool_amount"] <= 0:
        raise ValueError("Total pool amount must be greater than zero")

    if data["max_bid_limit"] <= 0:
        raise ValueError("Max bid limit must be greater than zero")

    existing_live_auction = db.query(Auction).filter(
        Auction.chit_group_id == data["chit_group_id"],
        Auction.status == AUCTION_STATUS_LIVE
    ).first()
    if existing_live_auction:
        raise ValueError("A live auction already exists for this chit group")

    auction = Auction(
        auction_number=_generate_auction_number(),
        chit_group_id=data["chit_group_id"],
        branch_id=data.get("branch_id"),
        auction_month=data["auction_month"],
        auction_date=data.get("auction_date"),
        total_pool_amount=data["total_pool_amount"],
        foreman_commission_percent=data.get("foreman_commission_percent", 5.0),
        max_bid_limit=data["max_bid_limit"],
        status=AUCTION_STATUS_PENDING,
        duration_minutes=data.get("duration_minutes", 10),
        created_by=current_user.id,
    )

    db.add(auction)
    db.commit()
    db.refresh(auction)

    create_notification(db, current_user.id, f"Auction {auction.auction_number} created successfully")
    create_audit_log(
        db,
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email,
        action="create",
        resource="auction",
        detail=f"Created auction {auction.auction_number}",
        success=True,
    )

    return auction


def list_auctions(db: Session, current_user):
    query = db.query(Auction)
    if getattr(current_user, "role", None) == "admin" and getattr(current_user, "branch_id", None):
        query = query.filter(Auction.branch_id == current_user.branch_id)
    return query.order_by(desc(Auction.created_at)).all()


def get_auction(db: Session, auction_id: int):
    return db.query(Auction).filter(Auction.id == auction_id).first()


def start_auction(db: Session, current_user, auction_id: int):
    auction = get_auction(db, auction_id)
    if not auction:
        raise ValueError("Auction not found")

    if auction.status != AUCTION_STATUS_PENDING:
        raise ValueError("Only pending auctions can be started")

    auction.status = AUCTION_STATUS_LIVE
    auction.started_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(auction)

    create_notification(db, current_user.id, f"Auction {auction.auction_number} is now live")
    create_audit_log(
        db,
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email,
        action="update",
        resource="auction",
        detail=f"Started auction {auction.auction_number}",
        success=True,
    )

    broadcast_auction_event("auction:started", {
        "auctionId": auction.id,
        "auctionNumber": auction.auction_number,
        "message": "Auction started",
        "status": auction.status,
    }, auction.id)
    broadcast_auction_timer(auction)

    return auction


def _member_has_pending_payment(db: Session, user_id: int, chit_id: int):
    pending = db.query(Payment).filter(
        Payment.user_id == user_id,
        Payment.chit_id == chit_id,
        Payment.status != "paid"
    ).count()
    return pending > 0


def _member_by_user_and_chit(db: Session, user_id: int, chit_id: int):
    return db.query(Member).filter(Member.user_id == user_id, Member.chit_id == chit_id).first()


def place_bid(db: Session, current_user, auction_id: int, bid_amount: float):
    auction = get_auction(db, auction_id)
    if not auction:
        raise ValueError("Auction not found")

    if auction.status != AUCTION_STATUS_LIVE:
        raise ValueError("Auction is not live")

    if not getattr(current_user, "is_active", True):
        raise ValueError("Inactive members cannot place bids")

    member = _member_by_user_and_chit(db, current_user.id, auction.chit_group_id)
    if not member:
        raise ValueError("Member not eligible for this auction")

    if member.already_won_auction:
        raise ValueError("Member already won a previous auction")

    if _member_has_pending_payment(db, current_user.id, auction.chit_group_id):
        raise ValueError("Pending payments exist")

    if bid_amount > auction.max_bid_limit:
        raise ValueError("Bid exceeds maximum bid limit")

    bid = AuctionBid(
        auction_id=auction.id,
        member_id=member.id,
        bid_amount=bid_amount,
        is_winning_bid=False,
    )

    db.add(bid)
    db.commit()
    db.refresh(bid)

    if auction.winning_bid_amount is None or bid_amount > auction.winning_bid_amount:
        auction.winning_bid_amount = bid_amount
        auction.winner_member_id = member.id
        db.commit()

        db.query(AuctionBid).filter(
            AuctionBid.auction_id == auction.id,
            AuctionBid.id != bid.id
        ).update({AuctionBid.is_winning_bid: False}, synchronize_session=False)
        bid.is_winning_bid = True
        db.commit()
    else:
        bid.is_winning_bid = False
        db.commit()

    create_notification(db, current_user.id, f"Bid placed successfully for auction {auction.auction_number}")
    create_audit_log(
        db,
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email,
        action="create",
        resource="auction_bid",
        detail=f"Bid {bid_amount} placed for {auction.auction_number}",
        success=True,
    )

    broadcast_auction_event("auction:newBid", {
        "auctionId": auction.id,
        "bidId": bid.id,
        "bidAmount": bid.bid_amount,
        "memberId": member.id,
        "memberName": f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email,
        "highestBid": auction.winning_bid_amount,
    }, auction.id)

    if auction.winner_member_id == member.id:
        broadcast_auction_event("auction:highestBid", {
            "auctionId": auction.id,
            "highestBid": auction.winning_bid_amount,
            "highestBidderMemberId": auction.winner_member_id,
        }, auction.id)

    return bid


def complete_auction(db: Session, current_user, auction_id: int):
    auction = get_auction(db, auction_id)
    if not auction:
        raise ValueError("Auction not found")

    if auction.status != AUCTION_STATUS_LIVE:
        raise ValueError("Only live auctions can be completed")

    bids = db.query(AuctionBid).filter(AuctionBid.auction_id == auction.id).order_by(desc(AuctionBid.bid_amount)).all()
    if not bids:
        auction.status = AUCTION_STATUS_CANCELLED
        auction.ended_at = datetime.now(timezone.utc)
        db.commit()

        create_notification(db, current_user.id, f"Auction {auction.auction_number} cancelled because no bids were placed")
        create_audit_log(
            db,
            user_id=current_user.id,
            user_name=f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email,
            action="update",
            resource="auction",
            detail=f"Cancelled auction {auction.auction_number} due to no bids",
            success=False,
        )

        broadcast_auction_event("auction:completed", {
            "auctionId": auction.id,
            "status": auction.status,
            "message": "Auction completed with no bids",
        }, auction.id)

        return auction

    winner_bid = bids[0]
    commission = auction.total_pool_amount * (auction.foreman_commission_percent / 100)
    prize_amount = auction.total_pool_amount - commission - winner_bid.bid_amount
    dividend = winner_bid.bid_amount / max(1, auction.chit.total_members)

    auction.winner_member_id = winner_bid.member_id
    auction.winning_bid_amount = winner_bid.bid_amount
    auction.foreman_commission_amount = commission
    auction.winner_prize_amount = prize_amount
    auction.dividend_per_member = dividend
    auction.status = AUCTION_STATUS_COMPLETED
    auction.ended_at = datetime.now(timezone.utc)

    members = db.query(Member).filter(Member.chit_id == auction.chit_group_id).all()
    for member in members:
        member.total_dividend_earned += dividend
        if member.id == winner_bid.member_id:
            member.already_won_auction = True
            member.winning_auction_id = auction.id

    for bid in bids:
        bid.is_winning_bid = bid.id == winner_bid.id

    db.commit()
    db.refresh(auction)

    create_notification(db, winner_bid.member.user_id, f"You won auction {auction.auction_number} with bid {winner_bid.bid_amount}")
    create_notification(db, None, f"Auction {auction.auction_number} completed, winner selected")
    create_audit_log(
        db,
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email,
        action="update",
        resource="auction",
        detail=f"Completed auction {auction.auction_number} with winner member {winner_bid.member_id}",
        success=True,
    )

    broadcast_auction_event("auction:completed", {
        "auctionId": auction.id,
        "winnerMemberId": auction.winner_member_id,
        "winningBidAmount": auction.winning_bid_amount,
        "prizeAmount": auction.winner_prize_amount,
        "dividendPerMember": auction.dividend_per_member,
        "status": auction.status,
    }, auction.id)

    return auction


def list_auction_bids(db: Session, auction_id: int):
    return db.query(AuctionBid).filter(AuctionBid.auction_id == auction_id).order_by(desc(AuctionBid.created_at)).all()


def get_eligible_members(db: Session, auction_id: int):
    auction = get_auction(db, auction_id)
    if not auction:
        raise ValueError("Auction not found")

    members = db.query(Member).join(User, Member.user_id == User.id).filter(
        Member.chit_id == auction.chit_group_id,
        User.is_active.is_(True),
        Member.already_won_auction.is_(False),
    ).all()

    eligible_members = []
    for member in members:
        if _member_has_pending_payment(db, member.user_id, auction.chit_group_id):
            continue
        eligible_members.append(member)

    return eligible_members


def update_auction(db: Session, current_user, auction_id: int, data: dict):
    auction = get_auction(db, auction_id)
    if not auction:
        raise ValueError("Auction not found")

    # Only allow updating PENDING auctions
    if auction.status != AUCTION_STATUS_PENDING:
        raise ValueError("Only pending auctions can be updated")

    # Update allowed fields
    if "chit_group_id" in data:
        auction.chit_group_id = data["chit_group_id"]
    if "auction_month" in data:
        auction.auction_month = data["auction_month"]
    if "auction_date" in data:
        auction.auction_date = data["auction_date"]
    if "total_pool_amount" in data:
        auction.total_pool_amount = data["total_pool_amount"]
    if "foreman_commission_percent" in data:
        auction.foreman_commission_percent = data["foreman_commission_percent"]
    if "max_bid_limit" in data:
        auction.max_bid_limit = data["max_bid_limit"]
    if "duration_minutes" in data:
        auction.duration_minutes = data["duration_minutes"]
    if "branch_id" in data:
        auction.branch_id = data["branch_id"]

    db.commit()
    db.refresh(auction)

    create_audit_log(
        db,
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email,
        action="update",
        resource="auction",
        detail=f"Updated auction {auction.auction_number}",
        success=True,
    )

    return auction


def delete_auction(db: Session, current_user, auction_id: int):
    auction = get_auction(db, auction_id)
    if not auction:
        raise ValueError("Auction not found")

    # Only allow deleting PENDING auctions
    if auction.status != AUCTION_STATUS_PENDING:
        raise ValueError("Only pending auctions can be deleted")

    auction_number = auction.auction_number
    db.delete(auction)
    db.commit()

    create_audit_log(
        db,
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email,
        action="delete",
        resource="auction",
        detail=f"Deleted auction {auction_number}",
        success=True,
    )

    return {"message": f"Auction {auction_number} deleted successfully"}
