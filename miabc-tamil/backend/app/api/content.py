"""
Content API endpoints for module and quiz data.
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.core.database import get_db
from app.models.models import ModuleContent, QuizContent, AudioFile
from app.schemas import schemas

router = APIRouter(prefix="/api/content", tags=["content"])


@router.get("/modules/{module_id}")
async def get_module(module_id: str, db: Session = Depends(get_db)):
    """Get module content by ID."""
    module = db.query(ModuleContent).filter(
        ModuleContent.module_id == module_id
    ).first()
    
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return {
        "id": module.module_id,
        "title": module.title,
        "tabs": json.loads(module.tabs) if module.tabs else [],
        "items": json.loads(module.items) if module.items else [],
        "validated": module.validated,
        "createdAt": module.created_at.isoformat() if module.created_at else None,
        "updatedAt": module.updated_at.isoformat() if module.updated_at else None
    }


@router.get("/modules")
async def list_modules(db: Session = Depends(get_db)):
    """List all modules."""
    modules = db.query(ModuleContent).all()
    
    return [
        {
            "id": module.module_id,
            "title": module.title,
            "validated": module.validated
        }
        for module in modules
    ]


@router.get("/quizzes/{module_id}")
async def get_quiz(module_id: str, db: Session = Depends(get_db)):
    """Get quiz content for a module."""
    quiz = db.query(QuizContent).filter(
        QuizContent.module_id == module_id
    ).first()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    return {
        "id": quiz.id,
        "moduleId": quiz.module_id,
        "title": quiz.title,
        "passingScore": quiz.passing_score,
        "questions": json.loads(quiz.questions) if quiz.questions else [],
        "validated": quiz.validated
    }


@router.get("/audio/{category}")
async def get_audio_by_category(
    category: str,
    db: Session = Depends(get_db)
):
    """Get all audio files for a category."""
    audio_files = db.query(AudioFile).filter(
        AudioFile.category == category
    ).order_by(AudioFile.display_name).all()
    
    return [
        {
            "id": audio.id,
            "category": audio.category,
            "filename": audio.filename,
            "displayName": audio.display_name,
            "filePath": audio.file_path,
            "audioUrl": audio.audio_url,
            "createdAt": audio.created_at.isoformat() if audio.created_at else None
        }
        for audio in audio_files
    ]


@router.get("/audio/file/{display_name}")
async def get_audio_by_name(
    display_name: str,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get audio file by display name."""
    query = db.query(AudioFile).filter(
        AudioFile.display_name == display_name
    )
    
    if category:
        query = query.filter(AudioFile.category == category)
    
    audio = query.first()
    
    if not audio:
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return {
        "id": audio.id,
        "category": audio.category,
        "filename": audio.filename,
        "displayName": audio.display_name,
        "filePath": audio.file_path,
        "audioUrl": audio.audio_url
    }
