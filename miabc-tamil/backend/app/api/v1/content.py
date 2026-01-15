from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.core.database import get_db
from app.core.firebase import get_firebase
from app.api.v1.auth import get_current_user
from app.models.models import User, ModuleContent as ModuleContentModel, QuizContent as QuizContentModel, AudioFile
from app.schemas.schemas import (
    ModuleContent, QuizContent, ProgressUpdate, UserProgress, MessageResponse
)

router = APIRouter()


@router.get("/modules/{module_id}", response_model=ModuleContent)
async def get_module_content(
    module_id: str,
    db: Session = Depends(get_db)
):
    """
    Get module content by ID.
    Tries SQLite first for faster local access, then Firebase.
    Public endpoint - no authentication required for educational content.
    """
    try:
        # Try SQLite cache first (faster for local development)
        cached_content = db.query(ModuleContentModel).filter(
            ModuleContentModel.module_id == module_id
        ).first()
        
        if cached_content:
            items = json.loads(cached_content.items) if isinstance(cached_content.items, str) else cached_content.items
            tabs = json.loads(cached_content.tabs) if isinstance(cached_content.tabs, str) else cached_content.tabs
            
            return ModuleContent(
                id=cached_content.module_id,
                title=cached_content.title,
                tabs=tabs or [],
                items=items or [],
                validated=cached_content.validated
            )
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module {module_id} not found. Please seed the database first."
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading module: {str(e)}"
        )


@router.get("/quizzes/{module_id}", response_model=QuizContent)
async def get_quiz_content(
    module_id: str,
    db: Session = Depends(get_db),
    firebase = Depends(get_firebase),
    current_user: User = Depends(get_current_user)
):
    """
    Get quiz content for a module.
    Tries Firebase first, falls back to SQLite cache.
    """
    # Try Firebase first
    content = firebase.get_quiz_content(module_id)
    
    if content:
        return content
    
    # Fall back to SQLite cache
    cached_quiz = db.query(QuizContentModel).filter(
        QuizContentModel.module_id == module_id
    ).first()
    
    if cached_quiz:
        return QuizContent(
            moduleId=cached_quiz.module_id,
            title=cached_quiz.title,
            passingScore=cached_quiz.passing_score,
            questions=cached_quiz.questions or [],
            validated=cached_quiz.validated
        )
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Quiz for module {module_id} not found"
    )


@router.get("/progress", response_model=UserProgress)
async def get_user_progress(
    db: Session = Depends(get_db),
    firebase = Depends(get_firebase),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's learning progress.
    Syncs from Firebase if available.
    """
    # Try to get from Firebase
    try:
        firebase_progress = firebase.get_user_progress(str(current_user.userId))
        if firebase_progress:
            # Update local cache
            current_user.progress = firebase_progress
            db.commit()
            return UserProgress(
                uid=str(current_user.userId),
                progress=firebase_progress
            )
    except Exception as e:
        print(f"Warning: Failed to fetch from Firebase: {e}")
    
    # Return local cache
    return UserProgress(
        uid=str(current_user.userId),
        progress=current_user.progress or {}
    )


@router.post("/progress", response_model=MessageResponse)
async def update_user_progress(
    progress_data: ProgressUpdate,
    db: Session = Depends(get_db),
    firebase = Depends(get_firebase),
    current_user: User = Depends(get_current_user)
):
    """
    Update user's progress for a module.
    Updates both SQLite and Firebase.
    """
    # Update local SQLite
    if current_user.progress is None:
        current_user.progress = {}
    
    current_user.progress[progress_data.module_id] = {
        "unlocked": True,
        "score": progress_data.score,
        "passed": progress_data.passed
    }
    
    db.commit()
    
    # Update Firebase
    try:
        firebase.update_user_progress(
            uid=str(current_user.userId),
            module_id=progress_data.module_id,
            score=progress_data.score,
            passed=progress_data.passed
        )
    except Exception as e:
        print(f"Warning: Failed to update Firebase: {e}")
        # Continue anyway - local update succeeded
    
    return MessageResponse(
        message=f"Progress updated for module {progress_data.module_id}",
        success=True
    )


@router.post("/unlock/{module_id}", response_model=MessageResponse)
async def unlock_module(
    module_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Unlock a module for the user.
    """
    if current_user.progress is None:
        current_user.progress = {}
    
    if module_id not in current_user.progress:
        current_user.progress[module_id] = {
            "unlocked": True,
            "score": 0,
            "passed": False
        }
    else:
        current_user.progress[module_id]["unlocked"] = True
    
    db.commit()
    
    return MessageResponse(
        message=f"Module {module_id} unlocked",
        success=True
    )


@router.get("/audio/{category}")
async def get_audio_by_category(
    category: str,
    db: Session = Depends(get_db)
):
    """Get all audio files for a category (vowels/consonants/words)."""
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
