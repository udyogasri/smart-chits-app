from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging
from app.api.deps import get_db, get_current_user
from app.models.user_model import User
from app.models.organization_model import Organization
from app.models.chit_model import Chit
from app.schemas.user_schema import UserCreate, UserResponse
from app.schemas.organization_schema import OrganizationCreate, OrganizationResponse
from app.schemas.branch_schema import BranchCreate, BranchUpdate, BranchResponse
from app.schemas.user_schema import AdminCreate, AdminResponse
from app.schemas.audit_log_schema import AuditLogResponse
from app.schemas.member_schema import MemberResponse, AddMember
from app.schemas.chit_schema import ChitResponse, ChitCreate, ChitUpdate, ChitWithMemberCount
from app.crud.platform_admin_crud import (
    get_all_users, get_user_by_id, update_user_role, deactivate_user, activate_user,
    get_all_organizations, get_organization_by_id, create_organization, update_organization, deactivate_organization,
    get_platform_statistics, get_platform_financial_summary, get_users_by_organization, get_chits_by_organization
)
from app.crud.branch_crud import (
    get_all_branches, get_branch_by_id, create_branch, update_branch, delete_branch, 
    deactivate_branch, activate_branch
)
from app.crud.admin_crud import (
    get_all_admins, get_admin_by_id, create_admin, delete_admin, update_admin_branch
)
from app.crud.member_crud import (
    get_all_members, get_members_by_chit, get_member_by_id, add_member_to_chit, remove_member_from_chit
)
from app.crud.chit_crud import (
    get_all_chits_with_member_count, get_chit_by_id, create_chit, update_chit, delete_chit
)
from app.crud.payment_crud import (
    get_all_payments, get_all_payments_for_organization, get_all_payments_for_admin, 
    get_payments_by_chit, get_payment, update_payment, delete_payment
)
from app.api.deps import get_platform_admin
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
from app.db.database import SessionLocal
from app.utils.token import get_email_from_token
from app.services.audit_log_service import get_recent_audit_logs

router = APIRouter(prefix="/platform-admin")

@router.get("/users", response_model=List[UserResponse])
def get_all_platform_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get all users (platform admin only)"""
    return get_all_users(db, skip=skip, limit=limit)

@router.get("/users/{user_id}", response_model=UserResponse)
def get_platform_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get a user by ID (platform admin only)"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}/role")
def update_user_role_endpoint(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Update user role (platform admin only)"""
    try:
        user = update_user_role(db, user_id, new_role)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": f"User role updated to {new_role}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/users/{user_id}/deactivate")
def deactivate_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Deactivate a user account (platform admin only)"""
    user = deactivate_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user.name} deactivated successfully"}

@router.patch("/users/{user_id}/activate")
def activate_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Activate a user account (platform admin only)"""
    user = activate_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user.name} activated successfully"}

@router.get("/organizations", response_model=List[OrganizationResponse])
def get_all_platform_organizations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get all organizations (platform admin only)"""
    return get_all_organizations(db, skip=skip, limit=limit)

@router.get("/organizations/{org_id}", response_model=OrganizationResponse)
def get_platform_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get organization by ID (platform admin only)"""
    org = get_organization_by_id(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.post("/organizations", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_platform_organization(
    org_data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Create new organization (platform admin only)"""
    try:
        return create_organization(db, org_data.dict(), current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/organizations/{org_id}")
def update_platform_organization(
    org_id: int,
    org_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Update organization (platform admin only)"""
    org = update_organization(db, org_id, org_data)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return {"message": "Organization updated successfully"}

@router.patch("/organizations/{org_id}/deactivate")
def deactivate_platform_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Deactivate an organization (platform admin only)"""
    org = deactivate_organization(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return {"message": f"Organization {org.name} deactivated successfully"}

@router.get("/statistics")
def get_platform_statistics_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get platform-wide statistics (platform admin only)"""
    stats = get_platform_statistics(db)
    return stats

@router.get("/financial-summary")
def get_platform_financial_summary_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get a dynamic financial summary for the superadmin dashboard."""
    return get_platform_financial_summary(db)


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_platform_audit_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get recent audit logs for platform admin dashboard."""
    return get_recent_audit_logs(db, limit=limit)


@router.websocket('/ws/financial-summary')
async def financial_summary_ws(websocket: WebSocket):
    """WebSocket endpoint that pushes financial summary updates every 5 seconds.

    Expects an `Authorization: Bearer <token>` header on the WebSocket request.
    """
    await websocket.accept()

    # Extract bearer token from headers or query params (query param used by browser WebSocket fallback)
    auth_header = websocket.headers.get('authorization') or websocket.headers.get('Authorization')
    token = None
    if auth_header and auth_header.lower().startswith('bearer '):
        token = auth_header.split(' ', 1)[1].strip()
    else:
        # Fallback: look for ?token=... in query params
        token = websocket.query_params.get('token')

    if not token:
        try:
            logging.warning('WS connection rejected: missing token from %s', websocket.client)
            await websocket.close(code=1008, reason='missing token')
        except Exception:
            pass
        return

    # Validate token and ensure platform-level role
    db = SessionLocal()
    try:
        try:
            email = get_email_from_token(token)
        except Exception as exc:
            logging.warning('WS token validation failed: %s', str(exc))
            try:
                await websocket.close(code=1008, reason='invalid token')
            except Exception:
                pass
            return

        user = None
        try:
            user = db.query(User).filter(User.email == email).first()
        except Exception as exc:
            logging.exception('Database error while fetching user for WS: %s', str(exc))
            try:
                await websocket.close(code=1011, reason='server error')
            except Exception:
                pass
            return

        if not user or getattr(user, 'role', None) not in ["super_admin", "platform_admin", "system_admin"]:
            logging.warning('WS connection rejected: insufficient role for %s', email)
            try:
                await websocket.close(code=1008, reason='insufficient role')
            except Exception:
                pass
            return

        # Push financial summary updates periodically
        prev_payload = None
        while True:
            try:
                payload = get_platform_financial_summary(db)
                if payload != prev_payload:
                    await websocket.send_json(payload)
                    prev_payload = payload
                await asyncio.sleep(5)
            except WebSocketDisconnect:
                logging.info('WS disconnected by client for %s', email)
                break
            except Exception as exc:
                logging.exception('Unexpected error in WS loop for %s: %s', email, str(exc))
                try:
                    await websocket.close(code=1011, reason='internal server error')
                except Exception:
                    pass
                break
    finally:
        db.close()


@router.websocket('/ws/audit-logs')
async def audit_logs_ws(websocket: WebSocket):
    await websocket.accept()

    auth_header = websocket.headers.get('authorization') or websocket.headers.get('Authorization')
    token = None
    if auth_header and auth_header.lower().startswith('bearer '):
        token = auth_header.split(' ', 1)[1].strip()
    else:
        token = websocket.query_params.get('token')

    if not token:
        try:
            logging.warning('Audit logs WS rejected: missing token from %s', websocket.client)
            await websocket.close(code=1008, reason='missing token')
        except Exception:
            pass
        return

    db = SessionLocal()
    try:
        try:
            email = get_email_from_token(token)
        except Exception as exc:
            logging.warning('Audit logs WS token validation failed: %s', str(exc))
            try:
                await websocket.close(code=1008, reason='invalid token')
            except Exception:
                pass
            return

        user = None
        try:
            user = db.query(User).filter(User.email == email).first()
        except Exception as exc:
            logging.exception('Database error while fetching user for Audit logs WS: %s', str(exc))
            try:
                await websocket.close(code=1011, reason='server error')
            except Exception:
                pass
            return

        if not user or getattr(user, 'role', None) not in ["super_admin", "platform_admin", "system_admin"]:
            logging.warning('Audit logs WS rejected: insufficient role for %s', email)
            try:
                await websocket.close(code=1008, reason='insufficient role')
            except Exception:
                pass
            return

        def serialize_log(log):
            return {
                'id': log.id,
                'user_id': log.user_id,
                'user_name': log.user_name,
                'action': log.action,
                'resource': log.resource,
                'detail': log.detail,
                'success': log.success,
                'timestamp': log.timestamp.isoformat() if log.timestamp else None,
            }

        prev_payload = None
        while True:
            try:
                logs = get_recent_audit_logs(db, limit=100)
                payload = [serialize_log(log) for log in logs]
                if payload != prev_payload:
                    await websocket.send_json(payload)
                    prev_payload = payload
                await asyncio.sleep(5)
            except WebSocketDisconnect:
                logging.info('Audit logs WS disconnected by client for %s', email)
                break
            except Exception as exc:
                logging.exception('Unexpected error in Audit logs WS loop for %s: %s', email, str(exc))
                await asyncio.sleep(5)
                continue
    finally:
        db.close()


@router.get("/organizations/{org_id}/users", response_model=List[UserResponse])
def get_organization_users_platform(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get all users in a specific organization (platform admin only)"""
    return get_users_by_organization(db, org_id)

@router.get("/organizations/{org_id}/chits", response_model=List[ChitResponse])
def get_organization_chits_platform(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get all chits in a specific organization (platform admin only)"""
    return get_chits_by_organization(db, org_id)


@router.get("/chits")
def get_all_chits_platform(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get all chits with member counts (platform admin only)"""
    result = get_all_chits_with_member_count(db, skip=skip, limit=limit)
    # Convert datetime objects to strings for JSON serialization
    processed_result = []
    for chit in result:
        chit_copy = dict(chit)  # Make a copy to avoid modifying original
        if chit_copy.get('created_at'):
            chit_copy['created_at'] = chit_copy['created_at'].isoformat()
        if chit_copy.get('updated_at'):
            chit_copy['updated_at'] = chit_copy['updated_at'].isoformat()
        processed_result.append(chit_copy)
    return processed_result


@router.get("/chits/{chit_id}", response_model=ChitResponse)
def get_chit_platform(
    chit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get a chit by ID (platform admin only)"""
    chit = get_chit_by_id(db, chit_id)
    if not chit:
        raise HTTPException(status_code=404, detail="Chit not found")
    return chit


@router.post("/chits", response_model=ChitResponse, status_code=status.HTTP_201_CREATED)
def create_chit_platform(
    chit_data: ChitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Create a new chit (platform admin only)"""
    try:
        return create_chit(db, chit_data, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/chits/{chit_id}", response_model=ChitResponse)
def update_chit_platform(
    chit_id: int,
    chit_data: ChitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Update a chit (platform admin only)"""
    try:
        chit = update_chit(db, chit_id, chit_data.dict(exclude_unset=True))
        if not chit:
            raise HTTPException(status_code=404, detail="Chit not found")
        return chit
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/chits/{chit_id}")
def delete_chit_platform(
    chit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Delete a chit (platform admin only)"""
    logging.info(f"Platform admin {current_user.email} attempting to delete chit {chit_id}")
    try:
        chit = delete_chit(db, chit_id)
        if not chit:
            logging.warning(f"Chit {chit_id} not found")
            raise HTTPException(status_code=404, detail="Chit not found")
        logging.info(f"Chit {chit_id} deleted successfully by {current_user.email}")
        return {"message": "Chit deleted successfully"}
    except Exception as e:
        logging.error(f"Failed to delete chit {chit_id}: {str(e)}")
        logging.error(f"Exception type: {type(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# Branch Management Endpoints
@router.get("/branches", response_model=List[BranchResponse])
def get_branches(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get all branches (platform admin only)"""
    return get_all_branches(db, skip=skip, limit=limit)


@router.get("/branches/{branch_id}", response_model=BranchResponse)
def get_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get a branch by ID (platform admin only)"""
    branch = get_branch_by_id(db, branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch


@router.post("/branches", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
def create_branch_endpoint(
    branch_data: BranchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Create a new branch (platform admin only)"""
    try:
        return create_branch(db, branch_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/branches/{branch_id}", response_model=BranchResponse)
def update_branch_endpoint(
    branch_id: int,
    branch_data: BranchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Update a branch (platform admin only)"""
    try:
        return update_branch(db, branch_id, branch_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/branches/{branch_id}")
def delete_branch_endpoint(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Delete a branch (platform admin only)"""
    try:
        delete_branch(db, branch_id)
        return {"message": "Branch deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/branches/{branch_id}/deactivate", response_model=BranchResponse)
def deactivate_branch_endpoint(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Deactivate a branch (platform admin only)"""
    try:
        return deactivate_branch(db, branch_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/branches/{branch_id}/activate", response_model=BranchResponse)
def activate_branch_endpoint(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Activate a branch (platform admin only)"""
    try:
        return activate_branch(db, branch_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Admin Management Endpoints
@router.get("/admins", response_model=List[AdminResponse])
def get_admins(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get all admins (platform admin only)"""
    return get_all_admins(db, skip=skip, limit=limit)


@router.get("/admins/{admin_id}", response_model=AdminResponse)
def get_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get an admin by ID (platform admin only)"""
    admin = get_admin_by_id(db, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin


@router.post("/admins", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin_endpoint(
    admin_data: AdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Create a new admin (platform admin only)"""
    try:
        return create_admin(db, admin_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/admins/{admin_id}")
def delete_admin_endpoint(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Delete an admin (platform admin only)"""
    try:
        return delete_admin(db, admin_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Member Management Endpoints
@router.get("/members", response_model=List[MemberResponse])
def get_all_members_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get all members across all chits (platform admin only)"""
    members = get_all_members(db, skip=skip, limit=limit)
    return members


@router.get("/chits/{chit_id}/members", response_model=List[MemberResponse])
def get_chit_members_endpoint(
    chit_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get all members of a specific chit (platform admin only)"""
    members = get_members_by_chit(db, chit_id, skip=skip, limit=limit)
    return members


@router.post("/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def add_member_endpoint(
    member_data: AddMember,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Add a member to a chit (platform admin only)"""
    try:
        return add_member_to_chit(db, member_data.user_id, member_data.chit_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/members/{member_id}")
def remove_member_endpoint(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Remove a member from a chit (platform admin only)"""
    try:
        remove_member_from_chit(db, member_id)
        return {"message": "Member removed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Payment Management Endpoints
@router.get("/payments")
def get_all_payments_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get all payments (platform admin only)"""
    return get_all_payments(db, skip=skip, limit=limit)


@router.get("/chits/{chit_id}/payments")
def get_chit_payments_endpoint(
    chit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get all payments for a specific chit (platform admin only)"""
    payments = get_payments_by_chit(db, chit_id)
    from app.crud.payment_crud import _payment_to_dict
    return [_payment_to_dict(db, p) for p in payments]


@router.get("/payments/{payment_id}")
def get_payment_endpoint(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Get a payment by ID (platform admin only)"""
    payment = get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    from app.crud.payment_crud import _payment_to_dict
    return _payment_to_dict(db, payment)


@router.put("/payments/{payment_id}")
def update_payment_endpoint(
    payment_id: int,
    payment_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Update a payment (platform admin only)"""
    try:
        payment = update_payment(db, payment_id, payment_data)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        from app.crud.payment_crud import _payment_to_dict
        return _payment_to_dict(db, payment)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/payments/{payment_id}")
def delete_payment_endpoint(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_platform_admin)
):
    """Delete a payment (platform admin only)"""
    try:
        payment = delete_payment(db, payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return {"message": "Payment deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
