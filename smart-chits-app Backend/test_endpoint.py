from app.db.database import SessionLocal
from app.models.user_model import User
from app.utils.token import create_access_token

db = SessionLocal()

# Get the test user
user = db.query(User).filter(User.email == "test@smartchits.com").first()

if user:
    # Create token
    token = create_access_token(data={
        "sub": user.email,
        "role": user.role,
        "your_claim": "specific"
    })
    print(f"Token: {token}")
    
    # Test endpoint with token
    import requests
    response = requests.get(
        'http://localhost:8000/platform-admin/members',
        headers={'Authorization': f'Bearer {token}', 'Origin': 'http://localhost:3001'}
    )
    
    print(f"\nStatus: {response.status_code}")
    print(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'MISSING')}")
    print(f"Response: {response.text[:200]}")
else:
    print("User not found")

db.close()
