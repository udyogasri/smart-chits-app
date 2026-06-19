from fastapi import FastAPI
import asyncio
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from sqlalchemy import inspect, text
from app.db.database import engine
from app.db.base import Base


from app.models import user_model
from app.models import chit_model
from app.models import auction_model
from app.models import payment_model
from app.models import notification_model
from app.models import member_model
from app.models import branch_model
from app.models import organization_model

from app.api.routes import user_routes
from app.api.routes import auth_routes
from app.api.routes import payment_routes
from app.api.routes import chit_routes
from app.api.routes import auction_routes
from app.api.routes import notification_routes
from app.api.routes import admin_routes
from app.api.routes import member_routes
from app.api.routes import organization_routes
from app.api.routes import platform_admin_routes
from app.api.routes import init_routes
from app.services.socket_service import manager as auction_socket_manager

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:4173", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        inspector = inspect(conn)

        if "chits" in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns("chits")]

            if "current_month" not in columns:
                conn.execute(text(
                    "ALTER TABLE chits ADD COLUMN current_month INTEGER DEFAULT 1 NOT NULL"
                ))

            if "bidding_open" not in columns:
                conn.execute(text(
                    "ALTER TABLE chits ADD COLUMN bidding_open BOOLEAN DEFAULT FALSE NOT NULL"
                ))

            if "total_members" not in columns:
                conn.execute(text(
                    "ALTER TABLE chits ADD COLUMN total_members INTEGER DEFAULT 0 NOT NULL"
                ))

            if "organization_id" not in columns:
                conn.execute(text(
                    "ALTER TABLE chits ADD COLUMN organization_id INTEGER"
                ))
            
            if "created_by" not in columns:
                conn.execute(text(
                    "ALTER TABLE chits ADD COLUMN created_by INTEGER"
                ))

            if "chit_fund" not in columns:
                conn.execute(text(
                    "ALTER TABLE chits ADD COLUMN chit_fund FLOAT"
                ))
            
            if "description" not in columns:
                conn.execute(text(
                    "ALTER TABLE chits ADD COLUMN description VARCHAR(500)"
                ))
            
            if "installment_amount" not in columns:
                conn.execute(text(
                    "ALTER TABLE chits ADD COLUMN installment_amount FLOAT"
                ))
            
            if "installment_frequency" not in columns:
                conn.execute(text(
                    "ALTER TABLE chits ADD COLUMN installment_frequency INTEGER DEFAULT 1"
                ))
            
            if "created_at" not in columns:
                conn.execute(text(
                    "ALTER TABLE chits ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                ))
            
            if "updated_at" not in columns:
                conn.execute(text(
                    "ALTER TABLE chits ADD COLUMN updated_at TIMESTAMP"
                ))

        if "auctions" in inspector.get_table_names():
            auction_columns = [col["name"] for col in inspector.get_columns("auctions")]

            # Upgrade old auction table schema to match the current auction model
            if "chit_group_id" not in auction_columns and "chit_id" in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions RENAME COLUMN chit_id TO chit_group_id"
                ))
                auction_columns.append("chit_group_id")
                auction_columns.remove("chit_id")

            if "auction_number" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN auction_number VARCHAR"
                ))
                auction_columns.append("auction_number")

            if "branch_id" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN branch_id INTEGER"
                ))
                auction_columns.append("branch_id")

            if "auction_month" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN auction_month INTEGER DEFAULT 1 NOT NULL"
                ))
                auction_columns.append("auction_month")

            if "auction_date" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN auction_date TIMESTAMP WITH TIME ZONE"
                ))
                auction_columns.append("auction_date")

            if "total_pool_amount" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN total_pool_amount FLOAT DEFAULT 0.0"
                ))
                auction_columns.append("total_pool_amount")

            if "foreman_commission_percent" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN foreman_commission_percent FLOAT DEFAULT 0.0"
                ))
                auction_columns.append("foreman_commission_percent")

            if "foreman_commission_amount" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN foreman_commission_amount FLOAT DEFAULT 0.0"
                ))
                auction_columns.append("foreman_commission_amount")

            if "max_bid_limit" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN max_bid_limit FLOAT DEFAULT 0.0"
                ))
                auction_columns.append("max_bid_limit")

            if "status" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN status VARCHAR DEFAULT 'PENDING' NOT NULL"
                ))
                auction_columns.append("status")

            if "winner_member_id" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN winner_member_id INTEGER"
                ))
                auction_columns.append("winner_member_id")

            if "winning_bid_amount" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN winning_bid_amount FLOAT"
                ))
                auction_columns.append("winning_bid_amount")

            if "winner_prize_amount" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN winner_prize_amount FLOAT"
                ))
                auction_columns.append("winner_prize_amount")

            if "dividend_per_member" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN dividend_per_member FLOAT"
                ))
                auction_columns.append("dividend_per_member")

            if "started_at" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN started_at TIMESTAMP WITH TIME ZONE"
                ))
                auction_columns.append("started_at")

            if "ended_at" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN ended_at TIMESTAMP WITH TIME ZONE"
                ))
                auction_columns.append("ended_at")

            if "duration_minutes" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN duration_minutes INTEGER DEFAULT 10 NOT NULL"
                ))
                auction_columns.append("duration_minutes")

            if "created_by" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN created_by INTEGER"
                ))
                auction_columns.append("created_by")

            if "updated_at" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE"
                ))
                auction_columns.append("updated_at")

            if "created_at" not in auction_columns:
                conn.execute(text(
                    "ALTER TABLE auctions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
                ))
                auction_columns.append("created_at")

            if "auction_number" in auction_columns:
                conn.execute(text(
                    "UPDATE auctions SET auction_number = concat('AUC-', md5(random()::text)) WHERE auction_number IS NULL"
                ))
            # Remove legacy auction columns from old schema
            for legacy_column in ["bid_amount", "month", "user_id", "is_winner", "winner_id"]:
                if legacy_column in auction_columns:
                    conn.execute(text(f"ALTER TABLE auctions DROP COLUMN IF EXISTS {legacy_column}"))
                    if legacy_column in auction_columns:
                        auction_columns.remove(legacy_column)
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_auctions_auction_number ON auctions(auction_number)"
            ))

        if "payments" in inspector.get_table_names():
            payment_columns = [col["name"] for col in inspector.get_columns("payments")]

            if "month" not in payment_columns:
                conn.execute(text(
                    "ALTER TABLE payments ADD COLUMN month INTEGER DEFAULT 1 NOT NULL"
                ))

            if "paid_at" not in payment_columns:
                conn.execute(text(
                    "ALTER TABLE payments ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE"
                ))

            if "status" not in payment_columns:
                conn.execute(text(
                    "ALTER TABLE payments ADD COLUMN status VARCHAR DEFAULT 'pending'"
                ))

            if "created_at" not in payment_columns:
                conn.execute(text(
                    "ALTER TABLE payments ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
                ))

            if "updated_at" not in payment_columns:
                conn.execute(text(
                    "ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
                ))

        if "members" in inspector.get_table_names():
            member_columns = [col["name"] for col in inspector.get_columns("members")]
            
            if "joined_at" not in member_columns:
                conn.execute(text(
                    "ALTER TABLE members ADD COLUMN joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                ))

            if "already_won_auction" not in member_columns:
                conn.execute(text(
                    "ALTER TABLE members ADD COLUMN already_won_auction BOOLEAN DEFAULT FALSE NOT NULL"
                ))

            if "winning_auction_id" not in member_columns:
                conn.execute(text(
                    "ALTER TABLE members ADD COLUMN winning_auction_id INTEGER"
                ))

            if "total_dividend_earned" not in member_columns:
                conn.execute(text(
                    "ALTER TABLE members ADD COLUMN total_dividend_earned FLOAT DEFAULT 0.0 NOT NULL"
                ))

        if "organizations" not in inspector.get_table_names():
            Base.metadata.create_all(bind=engine)
        else:
            org_columns = [col["name"] for col in inspector.get_columns("organizations")]
            
            # Drop old organizer_id column if it exists
            if "organizer_id" in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations DROP COLUMN organizer_id"
                ))
            
            # Drop old name column to avoid conflicts with organization_name
            if "name" in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations DROP COLUMN name"
                ))
            
            # Add new admin user details columns
            if "first_name" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN first_name VARCHAR"
                ))
            
            if "last_name" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN last_name VARCHAR"
                ))
            
            if "email" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN email VARCHAR"
                ))
            
            if "phone_number" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN phone_number VARCHAR"
                ))
            
            if "password" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN password VARCHAR"
                ))
            
            if "confirm_password" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN confirm_password VARCHAR"
                ))
            
            # Add organization_name column if not exists
            if "organization_name" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN organization_name VARCHAR"
                ))
            
            # Add organization_type column if not exists
            if "organization_type" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN organization_type VARCHAR"
                ))
            
            # Add registration_number column if not exists
            if "registration_number" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN registration_number VARCHAR"
                ))
            
            # Add company_email column if not exists
            if "company_email" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN company_email VARCHAR"
                ))
            
            # Add company_phone_number column if not exists
            if "company_phone_number" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN company_phone_number VARCHAR"
                ))
            
            # Add settings columns if not exists
            if "avatar" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN avatar TEXT"
                ))
            
            if "preferences" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN preferences JSON"
                ))
            
            if "notifications" not in org_columns:
                conn.execute(text(
                    "ALTER TABLE organizations ADD COLUMN notifications JSON"
                ))
        
        if "users" in inspector.get_table_names():
            user_columns = [col["name"] for col in inspector.get_columns("users")]
            
            # Drop password column if it exists (old schema)
            if "password" in user_columns:
                conn.execute(text(
                    "ALTER TABLE users DROP COLUMN password"
                ))
            
            if "hashed_password" not in user_columns:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN hashed_password VARCHAR(255)"
                ))
                conn.execute(text(
                    "UPDATE users SET hashed_password = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW' WHERE hashed_password IS NULL"
                ))
                conn.execute(text(
                    "ALTER TABLE users ALTER COLUMN hashed_password SET NOT NULL"
                ))
            
            if "is_active" not in user_columns:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL"
                ))
            
            if "created_at" not in user_columns:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                ))
            
            if "updated_at" not in user_columns:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN updated_at TIMESTAMP"
                ))

            if "organization_id" not in user_columns:  
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN organization_id INTEGER"
                ))
            
            # Add settings columns if not exists
            if "avatar" not in user_columns:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN avatar TEXT"
                ))
            
            if "preferences" not in user_columns:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN preferences JSON"
                ))
            
            if "notifications" not in user_columns:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN notifications JSON"
                ))

app.include_router(user_routes.router, prefix="/users", tags=["Users"])
app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(payment_routes.router, prefix="/payments", tags=["Payments"])
app.include_router(chit_routes.router, prefix="/chits", tags=["Chits"])
app.include_router(auction_routes.router, prefix="/auction", tags=["Auction"])
app.include_router(notification_routes.router, prefix="/notifications", tags=["Notifications"])
app.include_router(admin_routes.router, tags=["Admin"])
app.include_router(member_routes.router, prefix="/admin", tags=["Members"])
app.include_router(organization_routes.router, prefix="/organizations", tags=["Organizations"])
app.include_router(platform_admin_routes.router, tags=["Platform Admin"])
app.include_router(init_routes.router, tags=["Init"])


@app.on_event("startup")
async def initialize_socket_manager():
    auction_socket_manager.set_event_loop(asyncio.get_running_loop())

@app.get("/")
def home():
    return {"message": "Smart Chits Backend Running 🚀"}
