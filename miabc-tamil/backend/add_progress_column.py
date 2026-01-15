"""
Migration script to add 'progress' column to users table.
Run this once to update the existing database.
"""
import sqlite3
import os

# Get the backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(backend_dir, 'miabc.db')

print(f"Connecting to database: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if column already exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'progress' not in columns:
        print("Adding 'progress' column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN progress TEXT")
        conn.commit()
        print("✅ Successfully added 'progress' column")
    else:
        print("ℹ️ 'progress' column already exists")
    
    conn.close()
    print("✅ Migration completed successfully!")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    if conn:
        conn.close()
