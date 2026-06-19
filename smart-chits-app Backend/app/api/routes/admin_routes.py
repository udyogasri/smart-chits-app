import os
import asyncio
import logging
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Body
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.db.database import SessionLocal
from app.models.user_model import User
from app.models.chit_model import Chit
from app.schemas.user_schema import UserCreate, UserResponse, AdminCreate
from app.schemas.chit_schema import ChitCreate, ChitResponse, ChitWithMemberCount
from app.schemas.auction_schema import AuctionCreate, AuctionResponse
from app.schemas.audit_log_schema import AuditLogResponse
from app.services.admin_service import AdminService
from app.services.auction_service import (
    create_auction,
    list_auctions,
    get_auction,
    update_auction,
    delete_auction,
)
from app.utils.authorization import require_admin, check_organization_permission
from app.utils.token import get_email_from_token
from app.crud.user_crud import create_admin
from app.crud.admin_crud import get_admin_statistics, get_recent_activity
from app.crud.payment_crud import (
    get_all_payments_for_admin, get_payments_by_chit, get_payment,
    update_payment, delete_payment
)

# Load environment variables
load_dotenv()
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY")

router = APIRouter(prefix="/admin")

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    """Register a new admin (requires admin secret key)"""
    if not ADMIN_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Admin secret key not set in .env")

    if admin.admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")

    return create_admin(
        db, 
        admin.first_name, 
        admin.last_name, 
        admin.email, 
        admin.phone_number, 
        admin.password
    )

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    organization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Create a new user (Admin only)"""
    if current_user.role in ["super_admin", "system_admin"]:
        pass
    elif current_user.role == "admin":
        if current_user.organization_id != organization_id:
            raise HTTPException(status_code=403, detail="Can only create users in your own organization")
    
    from app.crud.user_crud import create_user
    return create_user(db, user_data, organization_id)

@router.get("/users", response_model=List[UserResponse])
def get_organization_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Get all users in organization (Admin only)"""
    from app.crud.user_crud import get_users_by_organization, get_all_users
    
    if current_user.role in ["super_admin", "system_admin"]:
        return get_all_users(db)
    elif current_user.role == "admin" and current_user.organization_id:
        return get_users_by_organization(db, current_user.organization_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

@router.post("/chits", response_model=ChitResponse, status_code=status.HTTP_201_CREATED)
def create_chit_fund(
    chit_data: ChitCreate,
    organization_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Create a new chit fund (Admin only)"""
    # If organization_id is not provided, use current user's organization_id for regular admins
    if organization_id is None and current_user.organization_id:
        organization_id = current_user.organization_id
    
    check_organization_permission(current_user, organization_id, "create_chit")
    from app.crud.chit_crud import create_chit
    return create_chit(db, chit_data, current_user.id, organization_id)

@router.get("/chits", response_model=List[ChitWithMemberCount])
def get_organization_chits(
    skip: int = 0,
    limit: int = 100,
    organization_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Get all chit funds in organization (Admin only)"""
    # If organization_id is not provided, use current user's organization_id for regular admins
    if organization_id is None and current_user.organization_id:
        organization_id = current_user.organization_id
    
    check_organization_permission(current_user, organization_id, "read_chits")
    from app.crud.chit_crud import get_chits_by_organization_with_member_count, get_all_chits_with_member_count
    
    if current_user.role in ["super_admin", "system_admin"] and not organization_id:
        return get_all_chits_with_member_count(db, skip, limit)
    elif organization_id:
        return get_chits_by_organization_with_member_count(db, organization_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

@router.patch("/chits/{chit_id}", response_model=ChitResponse)
def update_chit_fund(
    chit_id: int,
    chit_data: ChitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Update a chit fund (Admin only)"""
    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    if not chit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chit fund not found"
        )
    
    # Check organization permission
    if current_user.organization_id:
        if chit.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot update chits from other organizations"
            )
    
    # Update fields
    chit.name = chit_data.name
    chit.total_members = chit_data.total_members
    chit.duration = chit_data.duration
    chit.monthly_amount = chit_data.monthly_amount
    chit.chit_fund = chit_data.chit_fund
    chit.installment_amount = chit_data.installment_amount
    chit.installment_frequency = chit_data.installment_frequency
    chit.total_months = chit_data.total_months
    chit.description = chit_data.description
    
    db.commit()
    db.refresh(chit)
    return chit

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Update user status (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if current_user.organization_id:
        if user.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot update users from other organizations"
            )
    
    user.is_active = is_active
    db.commit()
    return {"message": f"User status updated to {'active' if is_active else 'inactive'}"}

@router.delete("/chits/{chit_id}")
def delete_chit_fund(
    chit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Delete a chit fund (Admin only)"""
    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    if not chit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chit fund not found"
        )
    
    if current_user.organization_id:
        if chit.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot delete chits from other organizations"
            )
    
    from app.crud.chit_crud import delete_chit
    deleted_chit = delete_chit(db, chit_id)
    if not deleted_chit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chit fund not found"
        )
    return {"message": "Chit fund deleted successfully"}


# Payment Endpoints (Admin)
@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Get admin dashboard statistics for the current user's organization."""
    try:
        logging.info(f"Fetching stats for admin user: {current_user.email}, role: {current_user.role}")
        stats = get_admin_statistics(db, current_user)
        logging.info(f"Stats fetched successfully: {stats}")
        return stats
    except Exception as e:
        logging.error(f"Error fetching admin stats: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch dashboard statistics: {str(e)}"
        )


@router.get("/activity", response_model=List[AuditLogResponse])
def get_admin_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Get recent activity logs for admin dashboard."""
    try:
        logging.info(f"Fetching recent activity for admin user: {current_user.email}")
        activity = get_recent_activity(db, current_user, limit=limit)
        logging.info(f"Activity fetched successfully: {len(activity)} items")
        return activity
    except Exception as e:
        logging.error(f"Error fetching recent activity: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch recent activity: {str(e)}"
        )


@router.websocket('/ws/stats')
async def admin_stats_ws(websocket: WebSocket):
    """WebSocket endpoint that pushes admin dashboard stats every 5 seconds."""
    await websocket.accept()

    auth_header = websocket.headers.get('authorization') or websocket.headers.get('Authorization')
    token = None
    if auth_header and auth_header.lower().startswith('bearer '):
        token = auth_header.split(' ', 1)[1].strip()
    else:
        token = websocket.query_params.get('token')

    if not token:
        logging.warning('Admin stats WS rejected: missing token from %s', websocket.client)
        try:
            await websocket.close(code=1008, reason='missing token')
        except Exception:
            pass
        return

    # Validate token and get user in a separate connection (released immediately)
    try:
        email = get_email_from_token(token)
    except Exception as exc:
        logging.warning('Admin stats WS token validation failed: %s', str(exc))
        try:
            await websocket.close(code=1008, reason='invalid token')
        except Exception:
            pass
        return

    # Get user in a separate connection
    user = None
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
    except Exception as exc:
        logging.exception('Database error while fetching user for Admin stats WS: %s', str(exc))
        try:
            await websocket.close(code=1011, reason='server error')
        except Exception:
            pass
        return
    finally:
        db.close()  # Close immediately after fetching user

    if not user or getattr(user, 'role', None) not in ["admin", "super_admin", "system_admin", "platform_admin"]:
        logging.warning('Admin stats WS rejected: insufficient role for %s', email)
        try:
            await websocket.close(code=1008, reason='insufficient role')
        except Exception:
            pass
        return

    prev_payload = None
    while True:
        try:
            # Create a new connection for each stats fetch
            db = SessionLocal()
            try:
                payload = get_admin_statistics(db, user)
            finally:
                db.close()  # Close immediately after fetching stats
            
            if payload != prev_payload:
                await websocket.send_json(payload)
                prev_payload = payload
            await asyncio.sleep(5)
        except WebSocketDisconnect:
            logging.info('Admin stats WS disconnected by client for %s', email)
            break
        except Exception as exc:
            logging.exception('Unexpected error in Admin stats WS loop for %s: %s', email, str(exc))
            try:
                await websocket.close(code=1011, reason='internal server error')
            except Exception:
                pass
            break


@router.get("/payments")
def get_admin_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Get all payments for admin's chits (Admin only)"""
    return get_all_payments_for_admin(db, current_user.id, skip=skip, limit=limit)


@router.get("/chits/{chit_id}/payments")
def get_admin_chit_payments(
    chit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Get all payments for a specific chit (Admin only)"""
    chit = db.query(Chit).filter(Chit.id == chit_id).first()
    if not chit:
        raise HTTPException(status_code=404, detail="Chit not found")
    
    if current_user.organization_id and chit.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    payments = get_payments_by_chit(db, chit_id)
    from app.crud.payment_crud import _payment_to_dict
    return [_payment_to_dict(db, p) for p in payments]


@router.put("/payments/{payment_id}")
def update_admin_payment(
    payment_id: int,
    payment_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Update a payment (Admin only)"""
    from app.crud.payment_crud import update_payment, _payment_to_dict
    try:
        payment = update_payment(db, payment_id, payment_data)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return _payment_to_dict(db, payment)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ AUCTION MANAGEMENT ENDPOINTS ============

@router.get("/auctions", response_model=List[AuctionResponse])
def admin_list_auctions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
):
    """List all auctions (Admin only)"""
    return list_auctions(db, current_user)


@router.get("/auctions/{auction_id}", response_model=AuctionResponse)
def admin_get_auction(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
):
    """Get a specific auction by ID (Admin only)"""
    try:
        auction = get_auction(db, auction_id)
        if not auction:
            raise HTTPException(status_code=404, detail="Auction not found")
        # Check authorization - user should be admin of same branch or have no branch restriction
        if current_user.branch_id and auction.branch_id and current_user.branch_id != auction.branch_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this auction")
        return auction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/auctions", response_model=AuctionResponse, status_code=status.HTTP_201_CREATED)
def admin_create_auction(
    data: AuctionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
):
    """Create a new auction (Admin only)"""
    try:
        return create_auction(db, current_user, data.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/auctions/{auction_id}", response_model=AuctionResponse)
def admin_update_auction(
    auction_id: int,
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
):
    """Update an auction (Admin only, PENDING auctions only)"""
    try:
        return update_auction(db, current_user, auction_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/auctions/{auction_id}")
def admin_delete_auction(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
):
    """Delete an auction (Admin only, PENDING auctions only)"""
    try:
        return delete_auction(db, current_user, auction_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
