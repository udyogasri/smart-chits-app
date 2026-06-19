#!/usr/bin/env python3
"""
Direct bcrypt test to diagnose the issue
"""
import bcrypt
import sys

print(f"Python version: {sys.version}")
print(f"bcrypt version: {bcrypt.__version__ if hasattr(bcrypt, '__version__') else 'Unknown'}")

# Test password
PASSWORD = "Kondeti@07"
HASHED = "$2b$12$3Goi/gnIr6JibVrM5xk2tuZ1L.P7wEv7zF2IZQy7ZE1.V6vVl3.H."

print("\n=== Testing bcrypt directly ===")
try:
    # Try to verify the password
    result = bcrypt.checkpw(PASSWORD.encode('utf-8'), HASHED.encode('utf-8'))
    print(f"✓ bcrypt.checkpw result: {result}")
except Exception as e:
    print(f"✗ bcrypt.checkpw error: {e}")

print("\n=== Testing passlib ===")
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    result = pwd_context.verify(PASSWORD, HASHED)
    print(f"✓ passlib verify result: {result}")
except Exception as e:
    print(f"✗ passlib error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
