#!/usr/bin/env python3
"""
Firestore Content Seeder for MiABC Tamil

This script populates Firestore with initial content for all 10 modules.
Run this after setting up your Firebase Admin SDK credentials.

Usage:
    python seed_firestore.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings


def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    if not firebase_admin._apps:
        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        if not os.path.exists(cred_path):
            print(f"❌ Error: Firebase credentials not found at {cred_path}")
            print("Please download your service account key and save it as serviceAccountKey.json")
            return None
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    
    return firestore.client()


def seed_alphabet_module(db):
    """Seed Alphabet module content."""
    print("📝 Seeding Alphabet module...")
    
    module_data = {
        "id": "01_alphabet",
        "title": "Alphabet",
        "tabs": ["Vowels", "Consonants"],
        "items": [
            # Tamil Vowels (உயிரெழுத்துக்கள்)
            {"type": "letter", "tamil": "அ", "english": "A", "sound": "a", "position": 1},
            {"type": "letter", "tamil": "ஆ", "english": "Aa", "sound": "aa", "position": 2},
            {"type": "letter", "tamil": "இ", "english": "I", "sound": "i", "position": 3},
            {"type": "letter", "tamil": "ஈ", "english": "Ee", "sound": "ee", "position": 4},
            {"type": "letter", "tamil": "உ", "english": "U", "sound": "u", "position": 5},
            {"type": "letter", "tamil": "ஊ", "english": "Oo", "sound": "oo", "position": 6},
            {"type": "letter", "tamil": "எ", "english": "E", "sound": "e", "position": 7},
            {"type": "letter", "tamil": "ஏ", "english": "Ay", "sound": "ay", "position": 8},
            {"type": "letter", "tamil": "ஐ", "english": "Ai", "sound": "ai", "position": 9},
            {"type": "letter", "tamil": "ஒ", "english": "O", "sound": "o", "position": 10},
            {"type": "letter", "tamil": "ஓ", "english": "Oh", "sound": "oh", "position": 11},
            {"type": "letter", "tamil": "ஔ", "english": "Au", "sound": "au", "position": 12},
            # Tamil Consonants (மெய்யெழுத்துக்கள்)
            {"type": "letter", "tamil": "க", "english": "Ka", "sound": "ka", "position": 13},
            {"type": "letter", "tamil": "ங", "english": "Nga", "sound": "nga", "position": 14},
            {"type": "letter", "tamil": "ச", "english": "Cha", "sound": "cha", "position": 15},
            {"type": "letter", "tamil": "ஞ", "english": "Nja", "sound": "nja", "position": 16},
            {"type": "letter", "tamil": "ட", "english": "Ta", "sound": "ta", "position": 17},
            {"type": "letter", "tamil": "ண", "english": "Na", "sound": "na", "position": 18},
            {"type": "letter", "tamil": "த", "english": "Tha", "sound": "tha", "position": 19},
            {"type": "letter", "tamil": "ந", "english": "Nha", "sound": "nha", "position": 20},
            {"type": "letter", "tamil": "ப", "english": "Pa", "sound": "pa", "position": 21},
            {"type": "letter", "tamil": "ம", "english": "Ma", "sound": "ma", "position": 22},
            {"type": "letter", "tamil": "ய", "english": "Ya", "sound": "ya", "position": 23},
            {"type": "letter", "tamil": "ர", "english": "Ra", "sound": "ra", "position": 24},
            {"type": "letter", "tamil": "ல", "english": "La", "sound": "la", "position": 25},
            {"type": "letter", "tamil": "வ", "english": "Va", "sound": "va", "position": 26},
            {"type": "letter", "tamil": "ழ", "english": "Zha", "sound": "zha", "position": 27},
            {"type": "letter", "tamil": "ள", "english": "La", "sound": "la", "position": 28},
            {"type": "letter", "tamil": "ற", "english": "Ra", "sound": "ra", "position": 29},
            {"type": "letter", "tamil": "ன", "english": "Na", "sound": "na", "position": 30},
        ],
        "validated": True
    }
    
    db.collection('content').document('module_01_alphabet').set(module_data)
    print("✅ Alphabet module seeded")


def seed_alphabet_quiz(db):
    """Seed Alphabet quiz."""
    print("📝 Seeding Alphabet quiz...")
    
    quiz_data = {
        "moduleId": "01_alphabet",
        "title": "Alphabet Quiz",
        "passingScore": 80,
        "questions": [
            {
                "id": "q1",
                "text": "Which is the first Tamil vowel?",
                "options": [
                    {"id": "o1", "text": "அ (A)", "isCorrect": True},
                    {"id": "o2", "text": "க (Ka)", "isCorrect": False},
                    {"id": "o3", "text": "ச (Cha)", "isCorrect": False},
                ]
            },
            {
                "id": "q2",
                "text": "How many vowels are in Tamil?",
                "options": [
                    {"id": "o1", "text": "5", "isCorrect": False},
                    {"id": "o2", "text": "12", "isCorrect": True},
                    {"id": "o3", "text": "18", "isCorrect": False},
                ]
            },
            {
                "id": "q3",
                "text": "Which letter is 'க'?",
                "options": [
                    {"id": "o1", "text": "Ka", "isCorrect": True},
                    {"id": "o2", "text": "Cha", "isCorrect": False},
                    {"id": "o3", "text": "Ta", "isCorrect": False},
                ]
            },
        ],
        "validated": True
    }
    
    db.collection('content').document('quiz_01_alphabet').set(quiz_data)
    print("✅ Alphabet quiz seeded")


def seed_colors_module(db):
    """Seed Colors module content."""
    print("📝 Seeding Colors module...")
    
    module_data = {
        "id": "10_colors",
        "title": "Colors",
        "tabs": ["Basic Colors", "Advanced Colors"],
        "items": [
            # Basic Colors
            {"type": "color", "tamil": "சிவப்பு", "english": "Red", "hex": "#FF0000", "category": "basic"},
            {"type": "color", "tamil": "நீலம்", "english": "Blue", "hex": "#0000FF", "category": "basic"},
            {"type": "color", "tamil": "மஞ்சள்", "english": "Yellow", "hex": "#FFFF00", "category": "basic"},
            {"type": "color", "tamil": "பச்சை", "english": "Green", "hex": "#00FF00", "category": "basic"},
            {"type": "color", "tamil": "ஆரஞ்சு", "english": "Orange", "hex": "#FFA500", "category": "basic"},
            {"type": "color", "tamil": "ஊதா", "english": "Purple", "hex": "#800080", "category": "basic"},
            # Advanced Colors
            {"type": "color", "tamil": "இளஞ்சிவப்பு", "english": "Pink", "hex": "#FFC0CB", "category": "advanced"},
            {"type": "color", "tamil": "பழுப்பு", "english": "Brown", "hex": "#8B4513", "category": "advanced"},
            {"type": "color", "tamil": "சாம்பல்", "english": "Gray", "hex": "#808080", "category": "advanced"},
            {"type": "color", "tamil": "கருப்பு", "english": "Black", "hex": "#000000", "category": "advanced"},
            {"type": "color", "tamil": "வெள்ளை", "english": "White", "hex": "#FFFFFF", "category": "advanced"},
            {"type": "color", "tamil": "தங்கம்", "english": "Gold", "hex": "#FFD700", "category": "advanced"},
        ],
        "validated": True
    }
    
    db.collection('content').document('module_10_colors').set(module_data)
    print("✅ Colors module seeded")


def seed_mathematics_module(db):
    """Seed Mathematics module content."""
    print("📝 Seeding Mathematics module...")
    
    module_data = {
        "id": "03_mathematics",
        "title": "Mathematics",
        "tabs": ["Numbers", "Geometric Figures"],
        "items": [
            # Numbers 0-20 (sample)
            {"type": "number", "value": 0, "tamil": "பூஜ்யம்", "english": "Zero"},
            {"type": "number", "value": 1, "tamil": "ஒன்று", "english": "One"},
            {"type": "number", "value": 2, "tamil": "இரண்டு", "english": "Two"},
            {"type": "number", "value": 3, "tamil": "மூன்று", "english": "Three"},
            {"type": "number", "value": 4, "tamil": "நான்கு", "english": "Four"},
            {"type": "number", "value": 5, "tamil": "ஐந்து", "english": "Five"},
            {"type": "number", "value": 6, "tamil": "ஆறு", "english": "Six"},
            {"type": "number", "value": 7, "tamil": "ஏழு", "english": "Seven"},
            {"type": "number", "value": 8, "tamil": "எட்டு", "english": "Eight"},
            {"type": "number", "value": 9, "tamil": "ஒன்பது", "english": "Nine"},
            {"type": "number", "value": 10, "tamil": "பத்து", "english": "Ten"},
            # Geometric Shapes
            {"type": "shape", "tamil": "வட்டம்", "english": "Circle", "sides": 0},
            {"type": "shape", "tamil": "சதுரம்", "english": "Square", "sides": 4},
            {"type": "shape", "tamil": "முக்கோணம்", "english": "Triangle", "sides": 3},
            {"type": "shape", "tamil": "செவ்வகம்", "english": "Rectangle", "sides": 4},
            {"type": "shape", "tamil": "வைரம்", "english": "Diamond", "sides": 4},
            {"type": "shape", "tamil": "நட்சத்திரம்", "english": "Star", "sides": 5},
        ],
        "validated": True
    }
    
    db.collection('content').document('module_03_mathematics').set(module_data)
    print("✅ Mathematics module seeded")


def seed_family_module(db):
    """Seed Family module content."""
    print("📝 Seeding Family module...")
    
    module_data = {
        "id": "04_family",
        "title": "Family",
        "tabs": ["Immediate Family", "Extended Family"],
        "items": [
            # Immediate Family
            {"type": "family", "tamil": "அம்மா", "english": "Mother", "category": "immediate"},
            {"type": "family", "tamil": "அப்பா", "english": "Father", "category": "immediate"},
            {"type": "family", "tamil": "அக்கா", "english": "Elder Sister", "category": "immediate"},
            {"type": "family", "tamil": "தங்கை", "english": "Younger Sister", "category": "immediate"},
            {"type": "family", "tamil": "அண்ணன்", "english": "Elder Brother", "category": "immediate"},
            {"type": "family", "tamil": "தம்பி", "english": "Younger Brother", "category": "immediate"},
            # Extended Family
            {"type": "family", "tamil": "பாட்டி", "english": "Grandmother", "category": "extended"},
            {"type": "family", "tamil": "தாத்தா", "english": "Grandfather", "category": "extended"},
            {"type": "family", "tamil": "அத்தை", "english": "Aunt", "category": "extended"},
            {"type": "family", "tamil": "மாமா", "english": "Uncle", "category": "extended"},
        ],
        "validated": True
    }
    
    db.collection('content').document('module_04_family').set(module_data)
    print("✅ Family module seeded")


def seed_festivals_module(db):
    """Seed Festivals module content."""
    print("📝 Seeding Festivals module...")
    
    module_data = {
        "id": "09_festivals",
        "title": "Festivals",
        "tabs": ["Foods", "Attire"],
        "items": [
            # Festival Foods
            {"type": "food", "tamil": "பொங்கல்", "english": "Pongal", "festival": "Pongal"},
            {"type": "food", "tamil": "லட்டு", "english": "Laddu", "festival": "Diwali"},
            {"type": "food", "tamil": "முறுக்கு", "english": "Murukku", "festival": "Diwali"},
            {"type": "food", "tamil": "பாயசம்", "english": "Payasam", "festival": "General"},
            {"type": "food", "tamil": "தோசை", "english": "Dosa", "festival": "Daily"},
            {"type": "food", "tamil": "இட்லி", "english": "Idli", "festival": "Daily"},
            # Traditional Attire
            {"type": "attire", "tamil": "சேலை", "english": "Saree", "gender": "female"},
            {"type": "attire", "tamil": "வேட்டி", "english": "Dhoti", "gender": "male"},
            {"type": "attire", "tamil": "பட்டு சேலை", "english": "Silk Saree", "gender": "female"},
            {"type": "attire", "tamil": "குர்தா", "english": "Kurta", "gender": "male"},
        ],
        "validated": True
    }
    
    db.collection('content').document('module_09_festivals').set(module_data)
    print("✅ Festivals module seeded")


def main():
    """Main seeding function."""
    print("🌱 Starting Firestore seeding...")
    print("=" * 60)
    
    db = initialize_firebase()
    if not db:
        return
    
    try:
        # Seed modules
        seed_alphabet_module(db)
        seed_alphabet_quiz(db)
        seed_colors_module(db)
        seed_mathematics_module(db)
        seed_family_module(db)
        seed_festivals_module(db)
        
        # Create placeholder documents for remaining modules
        remaining_modules = [
            {"id": "02_sounds", "title": "Sounds"},
            {"id": "05_write", "title": "Write"},
            {"id": "06_i_know_how_to_read", "title": "I know how to read"},
            {"id": "07_complete", "title": "Complete"},
            {"id": "08_words", "title": "Words"},
        ]
        
        for module in remaining_modules:
            db.collection('content').document(f"module_{module['id']}").set({
                "id": module['id'],
                "title": module['title'],
                "tabs": [],
                "items": [],
                "validated": False
            })
            print(f"📄 Created placeholder for {module['title']} module")
        
        print("=" * 60)
        print("✅ Firestore seeding completed successfully!")
        print(f"\n📊 Summary:")
        print(f"   - 5 modules fully populated")
        print(f"   - 5 module placeholders created")
        print(f"   - 1 quiz created")
        print(f"\n🔥 View your data at: https://console.firebase.google.com")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
