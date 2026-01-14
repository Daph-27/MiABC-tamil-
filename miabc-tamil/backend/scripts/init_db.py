#!/usr/bin/env python3
"""
Initialize SQLite database with tables.
Run this before starting the server for the first time.
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, Base
from app.models import models

def init_db():
    """Create all database tables."""
    print("🗄️  Initializing SQLite database...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    print(f"📁 Database location: {os.path.abspath('miabc.db')}")

if __name__ == "__main__":
    init_db()
