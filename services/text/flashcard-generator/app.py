from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from enum import Enum
import uvicorn

class CardType(str, Enum):
    BASIC = "basic"  # front/back
    CLOZE = "cloze"  # fill in the blank
    IMAGE = "image"  # image + text
    AUDIO = "audio"  # audio + text

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

app = FastAPI(title="Flashcard Generator Service", version="1.0.0")

class FlashcardRequest(BaseModel):
    text: str
    num_cards: int = 10
    card_type: CardType = CardType.BASIC
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    topics: List[str] = []
    include_images: bool = False

class Flashcard(BaseModel):
    front: str
    back: str
    card_type: CardType
    difficulty: DifficultyLevel
    tags: List[str] = []
    image_url: Optional[str] = None

class FlashcardResponse(BaseModel):
    deck_id: str
    flashcards: List[Flashcard]
    total_cards: int
    estimated_study_time: int  # in minutes
    status: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "flashcard-generator"}

@app.post("/generate", response_model=FlashcardResponse)
async def generate_flashcards(request: FlashcardRequest):
    """
    Generate flashcards from text content
    """
    try:
        # TODO: Implement flashcard generation logic
        # This is a placeholder implementation
        flashcards = []
        
        return FlashcardResponse(
            deck_id="placeholder_id",
            flashcards=flashcards,
            total_cards=0,
            estimated_study_time=0,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)




