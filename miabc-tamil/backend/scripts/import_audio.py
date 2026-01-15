#!/usr/bin/env python3
"""
Import audio files into the SQLite database.
Imports Vowels, Consonants, and Words audio files.
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.models.models import AudioFile, Base

def create_audio_table():
    """Create audio_files table if it doesn't exist."""
    print("🗄️  Creating audio_files table...")
    Base.metadata.create_all(bind=engine)
    print("✅ Table ready\n")

def get_audio_files(folder_path):
    """Get all .wav files from a folder."""
    if not os.path.exists(folder_path):
        print(f"⚠️  Folder not found: {folder_path}")
        return []
    
    wav_files = []
    for file in os.listdir(folder_path):
        if file.lower().endswith('.wav'):
            wav_files.append(file)
    
    return wav_files

def import_folder(db: Session, folder_name: str, category: str):
    """Import audio files from a folder."""
    # Navigate up from backend to project root
    project_root = Path(__file__).parent.parent.parent
    folder_path = project_root / folder_name
    
    print(f"📁 Processing: {folder_name} → {category}")
    
    files = get_audio_files(str(folder_path))
    if not files:
        return 0
    
    imported = 0
    for filename in files:
        # Clean display name
        display_name = filename.replace('.wav', '').replace('.WAV', '')
        # Remove prefix like "Vowels - ", "Consonants - ", "Words - "
        for prefix in ['Vowels - ', 'Consonants - ', 'Words - ']:
            if display_name.startswith(prefix):
                display_name = display_name[len(prefix):]
                break
        
        file_path = str(folder_path / filename)
        
        # Check if already exists
        existing = db.query(AudioFile).filter(
            AudioFile.category == category,
            AudioFile.filename == filename
        ).first()
        
        if existing:
            # Update existing
            existing.display_name = display_name
            existing.file_path = file_path
        else:
            # Create new
            audio = AudioFile(
                category=category,
                filename=filename,
                display_name=display_name,
                file_path=file_path
            )
            db.add(audio)
        
        imported += 1
        if imported % 20 == 0:
            print(f"   ✓ Imported {imported} files...")
    
    db.commit()
    print(f"✅ {category}: {imported} files imported\n")
    return imported

def display_summary(db: Session):
    """Display import summary."""
    print("📊 Import Summary:")
    print("═" * 40)
    
    categories = db.query(
        AudioFile.category,
        func.count(AudioFile.id).label('count')
    ).group_by(AudioFile.category).order_by(AudioFile.category).all()
    
    total = 0
    for cat, count in categories:
        print(f"{cat.ljust(20)} {count} files")
        total += count
    
    print("═" * 40)
    print(f"Total:               {total} files\n")

def main():
    """Main import function."""
    print("🎙️  Importing Audio Files to Backend Database\n")
    
    # Create table
    create_audio_table()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Import folders
        total = 0
        total += import_folder(db, "Vowels", "vowels")
        total += import_folder(db, "Consonants", "consonants")
        total += import_folder(db, "Words", "words")
        
        # Display summary
        display_summary(db)
        
        print("✨ Import complete!")
        print("\nDatabase location: backend/miabc.db")
        print("\nTo query audio files:")
        print("  SELECT * FROM audio_files WHERE category = 'vowels';")
        print("  SELECT * FROM audio_files WHERE display_name = 'A';")
        
    except Exception as e:
        print(f"\n❌ Import failed: {e}")
        db.rollback()
        return 1
    finally:
        db.close()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
