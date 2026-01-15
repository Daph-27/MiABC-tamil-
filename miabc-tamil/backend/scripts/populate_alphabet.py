#!/usr/bin/env python3
"""
Populate Module 1 (Alphabet) content based on PDF guidelines.
Creates proper Tamil alphabet content with vowels and consonants.
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import ModuleContent, AudioFile
import json

def get_audio_url(db: Session, category: str, display_name: str):
    """Get audio file path for a given letter."""
    audio = db.query(AudioFile).filter(
        AudioFile.category == category,
        AudioFile.display_name == display_name
    ).first()
    
    if audio:
        # Return relative path from project root
        project_root = Path(__file__).parent.parent.parent
        rel_path = Path(audio.file_path).relative_to(project_root)
        return str(rel_path).replace('\\', '/')
    return None

def create_alphabet_content(db: Session):
    """Create Module 1 Alphabet content."""
    
    print("📚 Creating Alphabet Module Content...\n")
    
    # Tamil vowels (உயிரெழுத்துக்கள்) - 12 vowels
    vowels = [
        {"english": "A", "tamil": "அ", "display": "A"},
        {"english": "Aa", "tamil": "ஆ", "display": "Aa"},
        {"english": "I", "tamil": "இ", "display": "I"},
        {"english": "Ii", "tamil": "ஈ", "display": "Ii"},
        {"english": "U", "tamil": "உ", "display": "U"},
        {"english": "Uu", "tamil": "ஊ", "display": "Uu"},
        {"english": "E", "tamil": "எ", "display": "E"},
        {"english": "Ee", "tamil": "ஏ", "display": "Ee"},
        {"english": "Ai", "tamil": "ஐ", "display": "Ai"},
        {"english": "O", "tamil": "ஒ", "display": "O"},
        {"english": "Oo", "tamil": "ஓ", "display": "Oo"},
        {"english": "Au", "tamil": "ஔ", "display": "Au"}
    ]
    
    # Tamil consonants (மெய்யெழுத்துக்கள்) - 18 consonants
    consonants = [
        {"english": "k", "tamil": "க்", "display": "Ik"},
        {"english": "ng", "tamil": "ங்", "display": "Ng"},
        {"english": "ch", "tamil": "ச்", "display": "Ich"},
        {"english": "nj", "tamil": "ஞ்", "display": "Inj"},
        {"english": "tt", "tamil": "ட்", "display": "Itt"},
        {"english": "nn", "tamil": "ண்", "display": "Inn"},
        {"english": "th", "tamil": "த்", "display": "Ith"},
        {"english": "n", "tamil": "ன்", "display": "In"},
        {"english": "p", "tamil": "ப்", "display": "Ip"},
        {"english": "m", "tamil": "ம்", "display": "Im"},
        {"english": "y", "tamil": "ய்", "display": "Iy"},
        {"english": "r", "tamil": "ர்", "display": "Ir"},
        {"english": "l", "tamil": "ல்", "display": "l"},
        {"english": "v", "tamil": "வ்", "display": "Iv"},
        {"english": "ll", "tamil": "ழ்", "display": "ill"},
        {"english": "L", "tamil": "ள்", "display": "ill"},
        {"english": "rr", "tamil": "ற்", "display": "Ir"},
        {"english": "n", "tamil": "ந்", "display": "Indh"}
    ]
    
    # Build items array
    items = []
    
    # Add vowels
    print("📝 Adding vowels...")
    for i, vowel in enumerate(vowels, 1):
        audio_url = get_audio_url(db, "vowels", vowel["display"])
        items.append({
            "id": f"v{i}",
            "type": "vowel",
            "character": vowel["tamil"],  # For new frontend
            "romanization": vowel["english"],  # For new frontend
            "example": f"{vowel['tamil']} - {vowel['display']}",  # Simple example
            "audioPath": audio_url,  # For new frontend
            # Legacy fields for backward compatibility
            "english": vowel["english"],
            "tamil": vowel["tamil"],
            "sound": vowel["display"],
            "audioUrl": audio_url,
            "position": i
        })
    print(f"✅ Added {len(vowels)} vowels")
    
    # Add consonants
    print("📝 Adding consonants...")
    for i, consonant in enumerate(consonants, 1):
        audio_url = get_audio_url(db, "consonants", consonant["display"])
        items.append({
            "id": f"c{i}",
            "type": "consonant",
            "character": consonant["tamil"],  # For new frontend
            "romanization": consonant["english"],  # For new frontend
            "example": f"{consonant['tamil']} - {consonant['display']}",  # Simple example
            "audioPath": audio_url,  # For new frontend
            # Legacy fields for backward compatibility
            "english": consonant["english"],
            "tamil": consonant["tamil"],
            "sound": consonant["display"],
            "audioUrl": audio_url,
            "position": len(vowels) + i
        })
    print(f"✅ Added {len(consonants)} consonants\n")
    
    # Check if module exists
    module = db.query(ModuleContent).filter(
        ModuleContent.module_id == "01_alphabet"
    ).first()
    
    if module:
        # Update existing
        print("📦 Updating existing module...")
        module.title = "Alphabet"
        module.tabs = json.dumps(["Vowels", "Consonants"])
        module.items = json.dumps(items)
        module.validated = True
    else:
        # Create new
        print("📦 Creating new module...")
        module = ModuleContent(
            module_id="01_alphabet",
            title="Alphabet",
            tabs=json.dumps(["Vowels", "Consonants"]),
            items=json.dumps(items),
            validated=True
        )
        db.add(module)
    
    db.commit()
    print("✅ Module saved to database\n")
    
    return module

def display_summary(db: Session):
    """Display module content summary."""
    module = db.query(ModuleContent).filter(
        ModuleContent.module_id == "01_alphabet"
    ).first()
    
    if not module:
        print("❌ Module not found")
        return
    
    items = json.loads(module.items)
    vowels = [item for item in items if item["type"] == "vowel"]
    consonants = [item for item in items if item["type"] == "consonant"]
    
    print("📊 Module Summary:")
    print("═" * 50)
    print(f"Module ID:       {module.module_id}")
    print(f"Title:           {module.title}")
    print(f"Tabs:            {', '.join(json.loads(module.tabs))}")
    print(f"Total Items:     {len(items)}")
    print(f"  - Vowels:      {len(vowels)}")
    print(f"  - Consonants:  {len(consonants)}")
    print(f"Validated:       {module.validated}")
    print("═" * 50)
    
    # Show sample items
    print("\n📝 Sample Content:")
    print("\nVowels (first 3):")
    for vowel in vowels[:3]:
        audio_status = "✓" if vowel.get("audioUrl") else "✗"
        print(f"  {vowel['position']}. {vowel['tamil']} ({vowel['english']}) - Audio: {audio_status}")
    
    print("\nConsonants (first 3):")
    for consonant in consonants[:3]:
        audio_status = "✓" if consonant.get("audioUrl") else "✗"
        print(f"  {consonant['position']}. {consonant['tamil']} ({consonant['english']}) - Audio: {audio_status}")

def main():
    """Main function."""
    print("🎯 Populating Module 1: Alphabet\n")
    
    db = SessionLocal()
    
    try:
        # Create content
        module = create_alphabet_content(db)
        
        # Display summary
        display_summary(db)
        
        print("\n✨ Module 1 (Alphabet) completed successfully!")
        print("\nNext steps:")
        print("1. Update AlphabetScreen.tsx to fetch from local database")
        print("2. Display vowels and consonants with audio playback")
        print("3. Test the module in the mobile app")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        return 1
    finally:
        db.close()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
