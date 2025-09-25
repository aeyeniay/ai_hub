from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from enum import Enum
import uvicorn
import requests
import json
import uuid
import os
from datetime import datetime

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"
    SHORT_ANSWER = "short_answer"

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

app = FastAPI(title="Quiz Generator Service", version="2.0.0")

# Ollama konfigürasyonu
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma3:27b")

# Quiz session yönetimi
QUIZ_SESSIONS_DIR = "/app/quiz_sessions"

class QuizRequest(BaseModel):
    text: str
    num_questions: int = 5
    question_types: List[QuestionType] = [QuestionType.MULTIPLE_CHOICE]
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    topics: List[str] = []

class Question(BaseModel):
    question: str
    question_type: QuestionType
    options: List[str] = []  # For multiple choice
    correct_answer: str
    explanation: Optional[str] = None
    difficulty: DifficultyLevel

class QuizResponse(BaseModel):
    quiz_id: str
    questions: List[Question]
    total_questions: int
    estimated_time: int  # in minutes
    status: str

def call_ollama_for_quiz_generation(text: str, num_questions: int, difficulty: str, question_type: str) -> List[Dict]:
    """Ollama ile quiz soruları üret"""
    try:
        prompt = f"""Aşağıdaki metinden {num_questions} adet {difficulty} seviyesinde {question_type} sorusu üret.

Metin: {text}

Her soru için şu JSON formatını kullan:
{{
  "questions": [
    {{
      "question": "Soru metni",
      "options": ["A) Seçenek 1", "B) Seçenek 2", "C) Seçenek 3", "D) Seçenek 4"],
      "correct_answer": "A) Seçenek 1",
      "explanation": "Cevap açıklaması",
      "difficulty": "{difficulty}"
    }}
  ]
}}

Kurallar:
- Sorular Türkçe olsun
- 4 şıklı çoktan seçmeli sorular üret
- Açıklamalar kısa ve net olsun
- Sadece JSON formatında yanıt ver

JSON:"""

        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9
                }
            },
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            llm_response = result.get("response", "")
            
            # JSON parse
            try:
                json_start = llm_response.find('{')
                json_end = llm_response.rfind('}') + 1
                if json_start != -1 and json_end > json_start:
                    json_str = llm_response[json_start:json_end]
                    parsed = json.loads(json_str)
                    return parsed.get("questions", [])
            except json.JSONDecodeError:
                pass
            
            # Fallback manual parsing
            return parse_quiz_response_manually(llm_response)
        else:
            print(f"Ollama API error: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return []

def parse_quiz_response_manually(response: str) -> List[Dict]:
    """Manual quiz response parsing"""
    questions = []
    # Basit parsing implementasyonu
    # Bu kısım LLM yanıtı başarısız olursa fallback olarak çalışır
    return questions

@app.get("/health")
async def health_check():
    try:
        # Ollama bağlantı testi
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        ollama_status = "connected" if response.status_code == 200 else "disconnected"
    except:
        ollama_status = "disconnected"
    
    return {
        "status": "healthy", 
        "service": "quiz-generator",
        "ollama": ollama_status,
        "model": MODEL_NAME
    }

@app.post("/generate", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    """
    Generate quiz questions from text content using Ollama
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text content is required")
        
        # Quiz ID oluştur
        quiz_id = str(uuid.uuid4())
        
        # Her soru tipi için sorular üret
        all_questions = []
        
        for question_type in request.question_types:
            questions_for_type = call_ollama_for_quiz_generation(
                text=request.text,
                num_questions=request.num_questions // len(request.question_types),
                difficulty=request.difficulty.value,
                question_type=question_type.value
            )
            
            # Question objelerine dönüştür
            for q_data in questions_for_type:
                question = Question(
                    question=q_data.get("question", ""),
                    question_type=question_type,
                    options=q_data.get("options", []),
                    correct_answer=q_data.get("correct_answer", ""),
                    explanation=q_data.get("explanation", ""),
                    difficulty=DifficultyLevel(q_data.get("difficulty", request.difficulty.value))
                )
                all_questions.append(question)
        
        # Kalan soruları tamamla
        remaining_questions = request.num_questions - len(all_questions)
        if remaining_questions > 0:
            extra_questions = call_ollama_for_quiz_generation(
                text=request.text,
                num_questions=remaining_questions,
                difficulty=request.difficulty.value,
                question_type=request.question_types[0].value
            )
            
            for q_data in extra_questions:
                question = Question(
                    question=q_data.get("question", ""),
                    question_type=request.question_types[0],
                    options=q_data.get("options", []),
                    correct_answer=q_data.get("correct_answer", ""),
                    explanation=q_data.get("explanation", ""),
                    difficulty=DifficultyLevel(q_data.get("difficulty", request.difficulty.value))
                )
                all_questions.append(question)
        
        # Quiz session kaydet
        quiz_data = {
            "quiz_id": quiz_id,
            "questions": [q.dict() for q in all_questions],
            "created_at": datetime.now().isoformat(),
            "total_questions": len(all_questions),
            "current_question": 0,
            "score": 0,
            "answers": []
        }
        
        os.makedirs(QUIZ_SESSIONS_DIR, exist_ok=True)
        with open(f"{QUIZ_SESSIONS_DIR}/{quiz_id}.json", "w", encoding="utf-8") as f:
            json.dump(quiz_data, f, ensure_ascii=False, indent=2)
        
        return QuizResponse(
            quiz_id=quiz_id,
            questions=all_questions,
            total_questions=len(all_questions),
            estimated_time=len(all_questions) * 2,  # 2 dakika per soru
            status="success"
        )
    except Exception as e:
        print(f"Error in generate_quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Interactive Quiz Endpoints

class AnswerRequest(BaseModel):
    quiz_id: str
    question_index: int
    user_answer: str

class AnswerResponse(BaseModel):
    correct: bool
    correct_answer: str
    explanation: str
    score: int
    total_questions: int
    next_question: Optional[Dict] = None
    quiz_completed: bool = False

@app.post("/answer", response_model=AnswerResponse)
async def submit_answer(request: AnswerRequest):
    """Submit answer for a quiz question"""
    try:
        # Quiz session yükle
        quiz_file = f"{QUIZ_SESSIONS_DIR}/{request.quiz_id}.json"
        if not os.path.exists(quiz_file):
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        with open(quiz_file, "r", encoding="utf-8") as f:
            quiz_data = json.load(f)
        
        # Geçerli soru kontrolü
        if request.question_index >= len(quiz_data["questions"]):
            raise HTTPException(status_code=400, detail="Invalid question index")
        
        current_question = quiz_data["questions"][request.question_index]
        correct = request.user_answer.strip() == current_question["correct_answer"].strip()
        
        # Cevabı kaydet
        quiz_data["answers"].append({
            "question_index": request.question_index,
            "user_answer": request.user_answer,
            "correct": correct,
            "timestamp": datetime.now().isoformat()
        })
        
        # Skoru güncelle
        if correct:
            quiz_data["score"] += 1
        
        # Sonraki soruyu hazırla
        next_question_index = request.question_index + 1
        next_question = None
        quiz_completed = next_question_index >= len(quiz_data["questions"])
        
        if not quiz_completed:
            next_question = quiz_data["questions"][next_question_index]
            quiz_data["current_question"] = next_question_index
        
        # Session'ı güncelle
        with open(quiz_file, "w", encoding="utf-8") as f:
            json.dump(quiz_data, f, ensure_ascii=False, indent=2)
        
        return AnswerResponse(
            correct=correct,
            correct_answer=current_question["correct_answer"],
            explanation=current_question.get("explanation", ""),
            score=quiz_data["score"],
            total_questions=len(quiz_data["questions"]),
            next_question=next_question,
            quiz_completed=quiz_completed
        )
        
    except Exception as e:
        print(f"Error in submit_answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quiz/{quiz_id}")
async def get_quiz_status(quiz_id: str):
    """Get current quiz status"""
    try:
        quiz_file = f"{QUIZ_SESSIONS_DIR}/{quiz_id}.json"
        if not os.path.exists(quiz_file):
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        with open(quiz_file, "r", encoding="utf-8") as f:
            quiz_data = json.load(f)
        
        current_question_index = quiz_data.get("current_question", 0)
        current_question = None
        
        if current_question_index < len(quiz_data["questions"]):
            current_question = quiz_data["questions"][current_question_index]
        
        return {
            "quiz_id": quiz_id,
            "current_question_index": current_question_index,
            "current_question": current_question,
            "score": quiz_data.get("score", 0),
            "total_questions": len(quiz_data["questions"]),
            "completed": current_question_index >= len(quiz_data["questions"]),
            "answers": quiz_data.get("answers", [])
        }
        
    except Exception as e:
        print(f"Error in get_quiz_status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def index():
    return {
        "service": "Interactive Quiz Generator",
        "version": "2.0.0",
        "model": MODEL_NAME,
        "endpoints": {
            "health": "/health",
            "generate": "/generate (POST) - Create new quiz from text",
            "answer": "/answer (POST) - Submit answer and get feedback",
            "status": "/quiz/{quiz_id} (GET) - Get quiz progress"
        },
        "usage": "1. Generate quiz with /generate, 2. Play with /answer, 3. Check progress with /quiz/{id}"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8006"))
    uvicorn.run(app, host="0.0.0.0", port=port)




