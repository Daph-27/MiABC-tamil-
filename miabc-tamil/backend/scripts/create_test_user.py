#!/usr/bin/env python3
"""
Create a test user for development.
Username: testuser
Password: password123
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import User
from app.core.security import get_password_hash
from datetime import datetime

def create_test_user():
    """Create a test user for development."""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == "testuser").first()
        
        if existing_user:
            print("✅ Test user already exists!")
            print(f"   Username: testuser")
            print(f"   Password: password123")
            print(f"   Learner: {existing_user.learnerName}")
            return
        
        # Create test user
        hashed_password = get_password_hash("password123")
        
        test_user = User(
            accessCode="123456",
            guardianName="Test Guardian",
            guardianRelation="Parent",
            guardianEmail="test@example.com",
            guardianPhone="1234567890",
            learnerName="Test Student",
            learnerAge=8,
            learnerGrade="3rd Grade",
            username="testuser",
            password=hashed_password,
            parentalLock="0000",
            createdAt=datetime.utcnow()
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("✅ Test user created successfully!")
        print(f"   Username: testuser")
        print(f"   Password: password123")
        print(f"   Learner: {test_user.learnerName}")
        print(f"   User ID: {test_user.userId}")
        print("\nYou can now login with these credentials!")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()
        return 1
    finally:
        db.close()
    
    return 0

if __name__ == "__main__":
    sys.exit(create_test_user())
