from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.firebase import get_firebase
from app.api.v1.auth import get_current_user
from app.models.models import User, ModuleContent as ModuleContentModel, QuizContent as QuizContentModel
from app.schemas.schemas import (
    ModuleContent, QuizContent, ProgressUpdate, UserProgress, MessageResponse
)

router = APIRouter()


@router.get("/modules/{module_id}", response_model=ModuleContent)
async def get_module_content(
    module_id: str,
    db: Session = Depends(get_db),
    firebase = Depends(get_firebase),
    current_user: User = Depends(get_current_user)
):
    """
    Get module content by ID.
    Tries Firebase first, falls back to SQLite cache.
    """
    # Try Firebase first
    content = firebase.get_module_content(module_id)
    
    if content:
        return content
    
    # Fall back to SQLite cache
    cached_content = db.query(ModuleContentModel).filter(
        ModuleContentModel.module_id == module_id
    ).first()
    
    if cached_content:
        return ModuleContent(
            id=cached_content.module_id,
            title=cached_content.title,
            tabs=cached_content.tabs or [],
            items=cached_content.items or [],
            validated=cached_content.validated
        )
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Module {module_id} not found"
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
    firebase_progress = firebase.get_user_progress(current_user.uid)
    
    if firebase_progress:
        # Update local cache
        current_user.progress = firebase_progress
        db.commit()
        return UserProgress(
            uid=current_user.uid,
            progress=firebase_progress
        )
    
    # Return local cache
    return UserProgress(
        uid=current_user.uid,
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
            uid=current_user.uid,
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
