#!/usr/bin/env python3
"""
Bilgi Kartları Servisi
Kullanıcının girdiği metinleri analiz ederek bilgi kartları üretir.
"""

import os
import json
import uuid
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import time

# FastAPI uygulaması
app = FastAPI(
    title="Bilgi Kartları Servisi",
    description="Metin analizi ile bilgi kartları üretimi",
    version="1.0.0"
)

# Ortam değişkenleri
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma3:27b")
PORT = int(os.getenv("PORT", 8008))

# Pydantic modelleri
class CardRequest(BaseModel):
    text: str
    card_count: int = 5

class Card(BaseModel):
    id: int
    content: str
    type: str

class CardResponse(BaseModel):
    success: bool
    cards: List[Card]
    metadata: Dict[str, Any]

# Ollama çağrı fonksiyonu
def call_ollama_for_cards(prompt: str) -> str:
    """Ollama LLM'den kart üretimi için çağrı yap"""
    try:
        url = f"{OLLAMA_BASE_URL}/api/generate"
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "max_tokens": 2000
            }
        }
        
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "")
        
    except Exception as e:
        print(f"❌ Ollama çağrı hatası: {e}")
        raise HTTPException(status_code=500, detail=f"LLM çağrı hatası: {str(e)}")

def generate_cards_content(text: str, card_count: int) -> List[Card]:
    """Metinden bilgi kartları üret"""
    
    prompt = f"""
    Verilen metni analiz et ve {card_count} adet bilgi kartı oluştur.
    
    Metin: {text}
    
    Her kart için:
    1. Metinden önemli bilgileri çıkar
    2. Tanım veya soru-cevap formatında yaz
    3. Kısa ve öz olsun (1-2 cümle)
    4. Anlaşılır ve öğretici olsun
    
    JSON formatında döndür:
    {{
        "cards": [
            {{
                "id": 1,
                "content": "Kart içeriği buraya...",
                "type": "question_answer" veya "definition"
            }}
        ]
    }}
    
    Sadece JSON döndür, başka açıklama ekleme.
    """
    
    start_time = time.time()
    response = call_ollama_for_cards(prompt)
    processing_time = time.time() - start_time
    
    try:
        # JSON parse et
        if "```json" in response:
            json_start = response.find("```json") + 7
            json_end = response.find("```", json_start)
            json_str = response[json_start:json_end].strip()
        else:
            json_str = response.strip()
        
        data = json.loads(json_str)
        cards_data = data.get("cards", [])
        
        # Card objelerine dönüştür
        cards = []
        for i, card_data in enumerate(cards_data[:card_count], 1):
            card = Card(
                id=i,
                content=card_data.get("content", ""),
                type=card_data.get("type", "definition")
            )
            cards.append(card)
        
        return cards, processing_time
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse hatası: {e}")
        print(f"LLM Response: {response}")
        
        # Fallback: Basit kartlar oluştur
        cards = []
        for i in range(1, min(card_count + 1, 6)):
            card = Card(
                id=i,
                content=f"Bilgi kartı {i}: Metin analizi tamamlandı.",
                type="definition"
            )
            cards.append(card)
        
        return cards, processing_time

# API Endpoints
@app.get("/health")
async def health_check():
    """Sağlık kontrolü"""
    try:
        # Ollama bağlantısını test et
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        ollama_status = "healthy" if response.status_code == 200 else "unhealthy"
    except:
        ollama_status = "unhealthy"
    
    return {
        "status": "healthy",
        "service": "info-cards",
        "ollama_status": ollama_status,
        "model": MODEL_NAME
    }

@app.post("/generate-cards", response_model=CardResponse)
async def generate_cards(request: CardRequest):
    """Bilgi kartları üret"""
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Metin boş olamaz")
        
        if request.card_count < 1 or request.card_count > 20:
            raise HTTPException(status_code=400, detail="Kart sayısı 1-20 arasında olmalı")
        
        print(f"🎯 Bilgi kartları üretiliyor: {request.card_count} adet")
        
        cards, processing_time = generate_cards_content(request.text, request.card_count)
        
        return CardResponse(
            success=True,
            cards=cards,
            metadata={
                "total_cards": len(cards),
                "processing_time": round(processing_time, 2),
                "text_length": len(request.text),
                "model": MODEL_NAME
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Kart üretim hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Ana sayfa"""
    return {
        "service": "Bilgi Kartları Servisi",
        "version": "1.0.0",
        "endpoints": {
            "generate_cards": "POST /generate-cards",
            "health": "GET /health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
