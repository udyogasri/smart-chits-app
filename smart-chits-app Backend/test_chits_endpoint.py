"""
Quick test to verify the admin chits endpoint is working after fixes
Run this after starting the backend server
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_chits_endpoint():
    """Test the /admin/chits endpoint"""
    
    print("🧪 Testing Admin Chits Endpoint")
    print("=" * 50)
    
    # First, we need to get an auth token by logging in
    print("\n1️⃣ Attempting to fetch chits (requires valid token)...")
    
    headers = {
        "Content-Type": "application/json",
        # Add your auth token here if testing locally
        # "Authorization": "Bearer YOUR_TOKEN_HERE"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/admin/chits", headers=headers)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ SUCCESS! Retrieved {len(data)} chit groups")
            
            if data:
                print("\n   Sample Chit Group:")
                chit = data[0]
                print(f"   - Name: {chit.get('name')}")
                print(f"   - Chit Fund: ₹{chit.get('chit_fund'):,}")
                print(f"   - Members: {chit.get('member_count', 0)}/{chit.get('total_members')}")
                print(f"   - Installment: ₹{chit.get('installment_amount'):,}")
                print(f"   - Duration: {chit.get('total_months')} months")
            
            print(f"\n✅ All {len(data)} chit groups retrieved successfully!")
            return True
        
        elif response.status_code == 401:
            print("   ⚠️ UNAUTHORIZED - Need to login first")
            print("   Tip: Send login request to get auth token")
            return False
        
        elif response.status_code == 403:
            error_msg = response.json().get('detail', 'Access denied')
            print(f"   ❌ FORBIDDEN: {error_msg}")
            print("   This is the error that was fixed!")
            return False
        
        else:
            print(f"   ❌ Error: {response.status_code}")
            print(f"   Response: {response.json()}")
            return False
    
    except requests.exceptions.ConnectionError:
        print("   ❌ Cannot connect to API server")
        print("   Make sure backend is running on http://localhost:8000")
        return False
    
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n🔍 Admin Chits Endpoint Verification")
    print("=" * 50)
    print("This script checks if the admin chits endpoint is working")
    print("after the organization permission fixes.")
    print("\nNote: You may need a valid auth token to test")
    print("=" * 50 + "\n")
    
    success = test_chits_endpoint()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ ENDPOINT TEST PASSED!")
    else:
        print("❌ ENDPOINT TEST FAILED - See details above")
    print("=" * 50)
