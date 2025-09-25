from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
import requests
import json
import hashlib
import uuid
import re
import os

app = FastAPI(title="PII Masking Service (LLM-based)", version="2.0.0")

# Ollama configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

class TextRequest(BaseModel):
    text: str
    masking_type: str = "replace"  # replace, hash, encrypt
    entities: List[str] = []  # Specific entities to mask
    model: str = "gemma3:27b"  # LLM model to use

class MaskingResponse(BaseModel):
    original_text: str
    masked_text: str
    detected_entities: List[Dict[str, Any]]
    masked_entities: List[Dict[str, Any]]  # Maskelenmiş bilgiler
    status: str
    model_used: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "pii-masking-llm"}

def call_llm_for_pii_detection(text: str, model: str = "gemma3:27b") -> List[Dict[str, Any]]:
    """Use LLM to detect PII entities in text"""
    try:
        prompt = f"""Aşağıdaki metinde kişisel bilgileri (PII) tespit et ve JSON formatında döndür. Her tespit ettiğin bilgiyi şu formatta belirt:

{{
  "entities": [
    {{"type": "PERSON", "value": "İsim Soyisim", "start": 0, "end": 10, "confidence": 0.95}},
    {{"type": "EMAIL", "value": "email@example.com", "start": 15, "end": 30, "confidence": 0.95}}
  ]
}}

Tespit edilecek PII türleri:
- PERSON: İsim ve soyisim
- BIRTH_DATE: Doğum tarihi/yılı
- BIRTH_PLACE: Doğum yeri
- ADDRESS: Adres bilgileri
- ID_NUMBER: T.C. Kimlik numarası
- PASSPORT: Pasaport numarası
- DRIVER_LICENSE: Sürücü belgesi numarası
- TAX_NUMBER: Vergi numarası
- IBAN: IBAN numarası
- CREDIT_CARD: Kredi kartı numarası
- PHONE: Telefon numarası
- EMAIL: E-posta adresi
- IP_ADDRESS: IP adresi
- MAC_ADDRESS: MAC adresi
- IMEI: IMEI numarası
- LICENSE_PLATE: Araç plakası
- GPS_COORDINATES: GPS koordinatları

Metin: {text}

Sadece JSON formatında yanıt ver, başka açıklama ekleme:"""

        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "top_p": 0.9
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            llm_response = result.get("response", "")
            
            # Extract JSON from LLM response
            try:
                # Find JSON in the response
                json_start = llm_response.find('{')
                json_end = llm_response.rfind('}') + 1
                if json_start != -1 and json_end > json_start:
                    json_str = llm_response[json_start:json_end]
                    parsed = json.loads(json_str)
                    return parsed.get("entities", [])
            except (json.JSONDecodeError, KeyError):
                pass
            
            # Fallback: parse the response manually
            return parse_llm_response_manually(llm_response, text)
        else:
            print(f"LLM API error: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return []

def parse_llm_response_manually(response: str, original_text: str) -> List[Dict[str, Any]]:
    """Manually parse LLM response when JSON parsing fails"""
    entities = []
    lines = response.split('\n')
    
    for line in lines:
        line = line.strip()
        if line.startswith('-') and ':' in line:
            # Parse format: - TYPE: VALUE
            try:
                parts = line[1:].strip().split(':', 1)
                if len(parts) == 2:
                    pii_type = parts[0].strip().upper()
                    pii_value = parts[1].strip()
                    
                    # Find position in original text
                    start = original_text.find(pii_value)
                    if start != -1:
                        entities.append({
                            "type": pii_type,
                            "value": pii_value,
                            "start": start,
                            "end": start + len(pii_value),
                            "confidence": 0.9
                        })
            except:
                continue
    
    return entities

def mask_text(text: str, entities: List[Dict[str, Any]], masking_type: str) -> tuple[str, List[Dict[str, Any]]]:
    """Mask detected entities in text and return masked text with masked entities info"""
    masked_text = text
    masked_entities = []

    # Sort entities by start position in reverse order to avoid index shifting
    entities_sorted = sorted(entities, key=lambda x: x['start'], reverse=True)

    for entity in entities_sorted:
        if masking_type == "replace":
            if entity['type'] == "EMAIL":
                replacement = "[EMAIL_MASKED]"
            elif entity['type'] == "PHONE":
                replacement = "[PHONE_MASKED]"
            elif entity['type'] == "ID_NUMBER":
                replacement = "[ID_MASKED]"
            elif entity['type'] == "PERSON":
                replacement = "[NAME_MASKED]"
            elif entity['type'] == "BIRTH_DATE":
                replacement = "[BIRTH_DATE_MASKED]"
            elif entity['type'] == "BIRTH_PLACE":
                replacement = "[BIRTH_PLACE_MASKED]"
            elif entity['type'] == "ADDRESS":
                replacement = "[ADDRESS_MASKED]"
            elif entity['type'] == "IBAN":
                replacement = "[IBAN_MASKED]"
            elif entity['type'] == "CREDIT_CARD":
                replacement = "[CARD_MASKED]"
            elif entity['type'] == "IP_ADDRESS":
                replacement = "[IP_MASKED]"
            elif entity['type'] == "MAC_ADDRESS":
                replacement = "[MAC_MASKED]"
            elif entity['type'] == "IMEI":
                replacement = "[IMEI_MASKED]"
            elif entity['type'] == "LICENSE_PLATE":
                replacement = "[PLATE_MASKED]"
            elif entity['type'] == "PASSPORT":
                replacement = "[PASSPORT_MASKED]"
            elif entity['type'] == "DRIVER_LICENSE":
                replacement = "[LICENSE_MASKED]"
            elif entity['type'] == "TAX_NUMBER":
                replacement = "[TAX_MASKED]"
            elif entity['type'] == "GPS_COORDINATES":
                replacement = "[GPS_MASKED]"
            else:
                replacement = "[MASKED]"
        elif masking_type == "hash":
            replacement = hashlib.md5(entity['value'].encode()).hexdigest()[:8]
        elif masking_type == "encrypt":
            replacement = f"ENC_{uuid.uuid4().hex[:8]}"
        else:
            replacement = "[MASKED]"

        # Store masked entity info
        masked_entities.append({
            "type": entity['type'],
            "original_value": entity['value'],
            "masked_value": replacement,
            "start": entity['start'],
            "end": entity['end'],
            "confidence": entity['confidence']
        })

        masked_text = masked_text[:entity['start']] + replacement + masked_text[entity['end']:]

    return masked_text, masked_entities

@app.post("/mask", response_model=MaskingResponse)
async def mask_pii(request: TextRequest):
    """
    Mask PII (Personally Identifiable Information) in text using LLM
    """
    try:
        # Detect PII entities using LLM
        detected_entities = call_llm_for_pii_detection(request.text, request.model)

        # Filter entities if specific types requested
        if request.entities:
            detected_entities = [e for e in detected_entities if e['type'] in request.entities]

        # Mask the text
        masked_text, masked_entities = mask_text(request.text, detected_entities, request.masking_type)

        return MaskingResponse(
            original_text=request.text,
            masked_text=masked_text,
            detected_entities=detected_entities,
            masked_entities=masked_entities,
            status="success",
            model_used=request.model
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
