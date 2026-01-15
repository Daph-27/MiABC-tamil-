import sqlite3
import json

conn = sqlite3.connect('miabc.db')
cursor = conn.cursor()

print("=" * 60)
print("CHECKING QUIZ RESULT STORAGE")
print("=" * 60)

# Check users table
cursor.execute("SELECT userId, username, learnerName, progress FROM users")
row = cursor.fetchone()

if row:
    print(f"\n✅ User found:")
    print(f"   User ID: {row[0]}")
    print(f"   Username: {row[1]}")
    print(f"   Learner: {row[2]}")
    print(f"   Progress column: {row[3]}")
    
    if row[3]:
        try:
            progress_data = json.loads(row[3]) if isinstance(row[3], str) else row[3]
            print(f"\n📊 Progress Data:")
            print(json.dumps(progress_data, indent=2))
        except:
            print(f"   Raw progress: {row[3]}")
    else:
        print(f"\n⚠️  Progress is NULL - no quiz results saved yet")
else:
    print("❌ No users found")

# Check if learnerProgress table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='learnerProgress'")
if cursor.fetchone():
    print("\n" + "=" * 60)
    print("CHECKING learnerProgress TABLE")
    print("=" * 60)
    cursor.execute("SELECT * FROM learnerProgress LIMIT 5")
    rows = cursor.fetchall()
    if rows:
        print(f"Found {len(rows)} records:")
        for row in rows:
            print(f"  {row}")
    else:
        print("⚠️  Table exists but is empty")

conn.close()
print("\n" + "=" * 60)
