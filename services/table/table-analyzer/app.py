#!/usr/bin/env python3
"""
Table Analyzer Servisi
Tablolardan metin yorumlaması üretimi (JSON, CSV, Excel desteği)
"""

import os
import json
import pandas as pd
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import time
import io
import uuid
from datetime import datetime

# FastAPI uygulaması
app = FastAPI(
    title="Table Analyzer Service",
    description="Tablolardan metin yorumlaması üreten servis",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ortam değişkenleri
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma3:27b")
PORT = int(os.getenv("PORT", 8010))

# Session yönetimi için dosya tabanlı yaklaşım
SESSIONS_DIR = "/app/sessions"

def get_session_file(session_id):
    """Session dosyasının yolunu döndür"""
    return os.path.join(SESSIONS_DIR, f"{session_id}.json")

def create_session(table_data: List[Dict], table_info: Dict):
    """Yeni session oluştur"""
    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "table_data": table_data,
        "table_info": table_info,
        "created_at": datetime.now().isoformat(),
        "questions": []
    }
    
    os.makedirs(SESSIONS_DIR, exist_ok=True)
    with open(get_session_file(session_id), 'w') as f:
        json.dump(session_data, f, ensure_ascii=False)
    
    return session_id

def get_session(session_id):
    """Session verilerini al"""
    try:
        with open(get_session_file(session_id), 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def update_session(session_id, question, answer):
    """Session'a soru-cevap ekle"""
    session_data = get_session(session_id)
    if session_data:
        session_data["questions"].append({
            "question": question,
            "answer": answer,
            "timestamp": datetime.now().isoformat()
        })
        with open(get_session_file(session_id), 'w') as f:
            json.dump(session_data, f, ensure_ascii=False)

# Pydantic modelleri
class TableAnalysisRequest(BaseModel):
    table_data: List[Dict[str, Any]]
    question: str = ""  # Optional question about the table
    language: str = "turkish"  # turkish, english
    output_format: str = "text"  # text, json, markdown

class TableAnalysis(BaseModel):
    title: str
    executive_summary: str
    key_insights: List[str]
    statistical_analysis: str
    trend_analysis: str
    comparative_analysis: str
    correlation_analysis: str
    anomaly_detection: str
    business_implications: str
    strategic_recommendations: List[str]
    risk_assessment: str
    future_projection: str
    detailed_analysis: str

class TableAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[TableAnalysis] = None
    answer: Optional[str] = None
    metadata: Dict[str, Any]

# Session-based modeller
class SessionCreateRequest(BaseModel):
    table_data: List[Dict[str, Any]]

class SessionQuestionRequest(BaseModel):
    session_id: str
    question: str

class SessionResponse(BaseModel):
    success: bool
    session_id: str
    message: str
    metadata: Dict[str, Any]

class SessionQuestionResponse(BaseModel):
    success: bool
    session_id: str
    question: str
    answer: str
    metadata: Dict[str, Any]

# IELTS Vocabulary Türkçe Çevirisi ve Çeşitlilik
TURKISH_VOCABULARY = {
    "trend_verbs": {
        "increase": ["artış göstermek", "yükselmek", "artmak", "çıkmak", "yükselişe geçmek", "ilerlemek"],
        "decrease": ["azalış göstermek", "düşmek", "azalmak", "gerilemek", "düşüşe geçmek", "kaybetmek"],
        "stable": ["sabit kalmak", "değişmemek", "istikrarlı olmak", "durağan kalmak", "sabitlenmek"],
        "fluctuate": ["dalgalanmak", "değişkenlik göstermek", "istikrarsız olmak", "sürekli değişmek"]
    },
    "intensity_adverbs": {
        "dramatic": ["dramatik olarak", "çarpıcı şekilde", "gözle görülür biçimde", "belirgin şekilde"],
        "significant": ["önemli ölçüde", "kayda değer şekilde", "dikkat çekici biçimde", "görünür şekilde"],
        "moderate": ["orta düzeyde", "makul ölçüde", "ılımlı şekilde", "orta seviyede"],
        "slight": ["hafifçe", "küçük ölçüde", "az miktarda", "minimal şekilde"]
    },
    "comparison_phrases": {
        "highest": ["en yüksek", "maksimum", "tepe noktası", "zirve", "en üst seviye"],
        "lowest": ["en düşük", "minimum", "dip noktası", "en alt seviye", "asgari"],
        "similar": ["benzer", "yakın", "eşdeğer", "karşılaştırılabilir", "aynı düzeyde"],
        "different": ["farklı", "ayrı", "değişik", "başka", "diğer"]
    },
    "time_expressions": {
        "period": ["dönem", "süreç", "zaman dilimi", "periyot", "ara"],
        "beginning": ["başlangıçta", "ilk olarak", "önce", "başta", "ilk dönemde"],
        "end": ["sonunda", "nihayetinde", "son dönemde", "bitiminde", "tamamında"],
        "throughout": ["boyunca", "süresince", "tüm dönemde", "genelinde", "sürekli"]
    }
}

def call_ollama_for_analysis(table_data: List[Dict], language: str, question: str = "", conversation_history: List[Dict] = None):
    """Ollama LLM'den tablo analizi al - Sohbet geçmişi ile"""
    try:
        # Tabloyu string'e çevir
        table_str = json.dumps(table_data, ensure_ascii=False, indent=2)
        
        # Eğer question varsa, basit soru-cevap yap (sohbet geçmişi ile)
        if question:
            # Sohbet geçmişini prompt'a ekle
            history_context = ""
            if conversation_history:
                history_context = "\n\nÖnceki Sohbet Geçmişi:\n"
                for item in conversation_history[-5:]:  # Son 5 sohbeti ekle
                    history_context += f"Kullanıcı: {item['question']}\n"
                    history_context += f"Asistan: {item['answer']}\n\n"
            
            prompt = f"""
            Sen bir tablo analiz asistanısın. Sadece verilen tablo hakkında sorulara cevap verirsin.
            
            Tablo:
            {table_str}
            {history_context}
            Şimdiki Soru: {question}
            
            ÖNEMLİ KURALLAR:
            
            1. SORU KONTROLÜ:
            - Eğer soru tablo verisiyle ALAKASIZ ise (örn: "Hava nasıl?", "Saat kaç?", "Türkiye'nin başkenti neresi?", genel sohbet, hayatla ilgili sorular vb.)
            - Şu şekilde kibarca reddet: "Üzgünüm, ben sadece yüklenen tablo verilerini analiz edebiliyorum. Lütfen tablo ile ilgili bir soru sorun. Örneğin: toplam değerler, ortalamalar, trendler, karşılaştırmalar gibi."
            
            2. SORU TABLO İLE İLGİLİ İSE:
            - Eğer kullanıcı "bunları listeler misin", "onları göster", "eşsiz değerleri listele" gibi önceki soruya atıfta bulunuyorsa, önceki sohbet geçmişindeki bağlamı kullan
            - Kullanıcı "bunlar", "onlar", "bu değerler" gibi gönderim sözcükleri kullanıyorsa, önceki cevabınıza veya soruya bak
            - Tutarlı ve bağlamsal cevap ver
            - Kısa ve net cevap ver. Sadece cevabı yaz, başka açıklama ekleme.
            
            3. TABLO ODAKLI KAL:
            - Sadece tablodaki verilere dayanarak cevap ver
            - Tabloda olmayan bilgiler hakkında tahmin yapma veya genel bilgi verme
            """
        else:
            # Detaylı analiz prompt'u oluştur
            prompt = create_detailed_analysis_prompt(table_str, language)
        
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
        llm_response = result.get("response", "")
        
        # Eğer question varsa, direkt cevabı dön
        if question:
            return llm_response.strip()
        
        # JSON parse et (detaylı analiz için)
        if "```json" in llm_response:
            json_start = llm_response.find("```json") + 7
            json_end = llm_response.find("```", json_start)
            json_str = llm_response[json_start:json_end].strip()
        else:
            json_str = llm_response.strip()
        
        data = json.loads(json_str)
        
        return TableAnalysis(
            title=data.get("title", "Detaylı Tablo Analizi"),
            executive_summary=data.get("executive_summary", ""),
            key_insights=data.get("key_insights", []),
            statistical_analysis=data.get("statistical_analysis", ""),
            trend_analysis=data.get("trend_analysis", ""),
            comparative_analysis=data.get("comparative_analysis", ""),
            correlation_analysis=data.get("correlation_analysis", ""),
            anomaly_detection=data.get("anomaly_detection", ""),
            business_implications=data.get("business_implications", ""),
            strategic_recommendations=data.get("strategic_recommendations", []),
            risk_assessment=data.get("risk_assessment", ""),
            future_projection=data.get("future_projection", ""),
            detailed_analysis=data.get("detailed_analysis", "")
        )
        
    except Exception as e:
        print(f"❌ LLM analiz hatası: {e}")
        # Fallback analiz
        return create_fallback_analysis(table_data)

def create_detailed_analysis_prompt(table_str: str, language: str) -> str:
    """Detaylı analiz için prompt oluştur - Ufuk açıcı bilgilerle"""
    vocab = TURKISH_VOCABULARY if language == "turkish" else {}
    
    return f"""
    Bu tabloyu derinlemesine analiz et ve kullanıcıya ufuk açıcı bilgiler sun. Sadece yüzeysel analiz değil, verilerin arkasındaki hikayeyi, gizli kalıpları, beklenmeyen ilişkileri ve stratejik fırsatları ortaya çıkar.
    
    Tablo Verisi:
    {table_str}
    
    Analiz yaparken şu unsurları kullan:
    - Trend fiilleri: {', '.join(vocab.get('trend_verbs', {}).get('increase', []))} gibi
    - Yoğunluk zarfları: {', '.join(vocab.get('intensity_adverbs', {}).get('significant', []))} gibi
    - Karşılaştırma ifadeleri: {', '.join(vocab.get('comparison_phrases', {}).get('highest', []))} gibi
    - Zaman ifadeleri: {', '.join(vocab.get('time_expressions', {}).get('period', []))} gibi
    
    JSON formatında yanıt ver:
    {{
        "title": "Çarpıcı ve dikkat çekici başlık",
        "executive_summary": "Yönetici özeti - 3-4 cümle ile ana bulgular",
        "key_insights": ["Gizli kalıp 1", "Beklenmeyen bulgu 2", "Stratejik fırsat 3", "Risk sinyali 4"],
        "statistical_analysis": "İstatistiksel analiz - ortalama, standart sapma, varyans, korelasyonlar",
        "trend_analysis": "Trend analizi - mevsimsellik, döngüsel kalıplar, yapısal değişimler",
        "comparative_analysis": "Karşılaştırmalı analiz - performans farkları, rekabet analizi",
        "correlation_analysis": "Korelasyon analizi - değişkenler arası ilişkiler, nedensellik",
        "anomaly_detection": "Anomali tespiti - aykırı değerler, beklenmeyen değişimler",
        "business_implications": "İş etkileri - operasyonel, finansal, stratejik sonuçlar",
        "strategic_recommendations": ["Aksiyon önerisi 1", "Stratejik öneri 2", "Risk yönetimi 3"],
        "risk_assessment": "Risk değerlendirmesi - potansiyel tehditler, fırsatlar",
        "future_projection": "Gelecek projeksiyonu - trend devamı, senaryo analizi",
        "detailed_analysis": "Detaylı analiz - tüm bulguların derinlemesine açıklaması"
    }}
    """


def create_fallback_analysis(table_data: List[Dict]) -> TableAnalysis:
    """LLM başarısız olursa basit analiz oluştur"""
    df = pd.DataFrame(table_data)
    
    return TableAnalysis(
        title="Detaylı Tablo Analizi",
        executive_summary=f"Tablo {len(table_data)} satır ve {len(df.columns)} sütun içeriyor.",
        key_insights=[
            f"Toplam {len(table_data)} veri noktası",
            f"{len(df.columns)} farklı sütun",
            "Veri analizi tamamlandı"
        ],
        statistical_analysis="İstatistiksel analiz yapılamadı",
        trend_analysis="Trend analizi yapılamadı",
        comparative_analysis="Karşılaştırmalı analiz yapılamadı",
        correlation_analysis="Korelasyon analizi yapılamadı",
        anomaly_detection="Anomali tespiti yapılamadı",
        business_implications="İş etkileri değerlendirilemedi",
        strategic_recommendations=["Daha detaylı analiz önerilir"],
        risk_assessment="Risk değerlendirmesi yapılamadı",
        future_projection="Gelecek projeksiyonu yapılamadı",
        detailed_analysis="Basit analiz tamamlandı."
    )

def parse_csv_file(file_content: bytes) -> List[Dict]:
    """CSV dosyasını parse et"""
    try:
        df = pd.read_csv(io.StringIO(file_content.decode('utf-8')))
        return df.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV parse hatası: {str(e)}")

def parse_excel_file(file_content: bytes, sheet_name: str = None) -> List[Dict]:
    """Excel dosyasını parse et"""
    try:
        df = pd.read_excel(io.BytesIO(file_content), sheet_name=sheet_name)
        return df.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Excel parse hatası: {str(e)}")

# API Endpoints
@app.get("/health")
async def health_check():
    """Sağlık kontrolü"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        ollama_status = "healthy" if response.status_code == 200 else "unhealthy"
    except:
        ollama_status = "unhealthy"
    
    return {
        "status": "healthy",
        "service": "table-analyzer",
        "ollama_status": ollama_status,
        "model": MODEL_NAME
    }

@app.post("/analyze-table", response_model=TableAnalysisResponse)
async def analyze_table(request: TableAnalysisRequest):
    """JSON tablosundan detaylı analiz üret"""
    try:
        if not request.table_data:
            raise HTTPException(status_code=400, detail="Tablo verisi boş olamaz")
        
        print(f"📊 Tablo analizi yapılıyor...")
        
        start_time = time.time()
        
        # LLM ile analiz (question varsa soru-cevap, yoksa detaylı analiz)
        result = call_ollama_for_analysis(
            request.table_data, 
            request.language,
            request.question
        )
        
        processing_time = time.time() - start_time
        
        # Question varsa basit cevap dön
        if request.question:
            return TableAnalysisResponse(
                success=True,
                answer=result,
                metadata={
                    "analysis_type": "question_answer",
                    "language": request.language,
                    "processing_time": round(processing_time, 2),
                    "table_rows": len(request.table_data),
                    "model": MODEL_NAME,
                    "question": request.question
                }
            )
        
        # Detaylı analiz dön
        return TableAnalysisResponse(
            success=True,
            analysis=result,
            metadata={
                "analysis_type": "detailed",
                "language": request.language,
                "processing_time": round(processing_time, 2),
                "table_rows": len(request.table_data),
                "model": MODEL_NAME
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Tablo analiz hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-csv-and-analyze", response_model=TableAnalysisResponse)
async def upload_csv_and_analyze(
    file: UploadFile = File(...),
    language: str = Form("turkish"),
    output_format: str = Form("text")
):
    """CSV dosyası yükle ve detaylı analiz et"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Sadece CSV dosyaları desteklenir")
        
        file_content = await file.read()
        table_data = parse_csv_file(file_content)
        
        # JSON endpoint'ini çağır
        request = TableAnalysisRequest(
            table_data=table_data,
            language=language,
            output_format=output_format
        )
        
        return await analyze_table(request)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ CSV upload hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-excel-and-analyze", response_model=TableAnalysisResponse)
async def upload_excel_and_analyze(
    file: UploadFile = File(...),
    sheet_name: str = Form(None),
    language: str = Form("turkish"),
    output_format: str = Form("text")
):
    """Excel dosyası yükle ve detaylı analiz et"""
    try:
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Sadece Excel dosyaları desteklenir")
        
        file_content = await file.read()
        table_data = parse_excel_file(file_content, sheet_name)
        
        # JSON endpoint'ini çağır
        request = TableAnalysisRequest(
            table_data=table_data,
            language=language,
            output_format=output_format
        )
        
        return await analyze_table(request)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Excel upload hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Session-based endpoints
@app.post("/create-session", response_model=SessionResponse)
async def create_session_endpoint(request: SessionCreateRequest):
    """Tablo verisi ile yeni session oluştur"""
    try:
        if not request.table_data:
            raise HTTPException(status_code=400, detail="Tablo verisi boş olamaz")
        
        # Tablo bilgilerini hazırla
        table_info = {
            "rows": len(request.table_data),
            "columns": list(request.table_data[0].keys()) if request.table_data else [],
            "created_at": datetime.now().isoformat()
        }
        
        # Session oluştur
        session_id = create_session(request.table_data, table_info)
        
        return SessionResponse(
            success=True,
            session_id=session_id,
            message="Session başarıyla oluşturuldu",
            metadata={
                "table_rows": table_info["rows"],
                "table_columns": len(table_info["columns"]),
                "created_at": table_info["created_at"]
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask-question", response_model=SessionQuestionResponse)
async def ask_question(request: SessionQuestionRequest):
    """Session'daki tablo hakkında soru sor - Sohbet geçmişi ile context"""
    try:
        if not request.session_id or not request.question:
            raise HTTPException(status_code=400, detail="Session ID ve soru gerekli")
        
        # Session'ı al
        session_data = get_session(request.session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Session bulunamadı")
        
        table_data = session_data.get("table_data", [])
        if not table_data:
            raise HTTPException(status_code=400, detail="Session'da tablo verisi yok")
        
        # Önceki sohbet geçmişini al
        conversation_history = session_data.get("questions", [])
        
        # LLM'den cevap al (sohbet geçmişi ile)
        start_time = time.time()
        answer = call_ollama_for_analysis(table_data, "turkish", request.question, conversation_history)
        processing_time = time.time() - start_time
        
        # Session'a soru-cevap ekle
        update_session(request.session_id, request.question, answer)
        
        return SessionQuestionResponse(
            success=True,
            session_id=request.session_id,
            question=request.question,
            answer=answer,
            metadata={
                "processing_time": round(processing_time, 2),
                "table_rows": len(table_data),
                "model": MODEL_NAME
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/session-status")
async def session_status(session_id: str):
    """Session durumunu kontrol et"""
    try:
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID gerekli")
        
        session_data = get_session(session_id)
        if not session_data:
            return {
                "success": False,
                "session_id": session_id,
                "has_table": False,
                "message": "Session bulunamadı"
            }
        
        return {
            "success": True,
            "session_id": session_id,
            "has_table": True,
            "table_info": session_data.get("table_info", {}),
            "questions_count": len(session_data.get("questions", [])),
            "created_at": session_data.get("created_at"),
            "message": "Session aktif"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/session-history")
async def session_history(session_id: str):
    """Session geçmişini getir"""
    try:
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID gerekli")
        
        session_data = get_session(session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Session bulunamadı")
        
        return {
            "success": True,
            "session_id": session_id,
            "table_info": session_data.get("table_info", {}),
            "created_at": session_data.get("created_at"),
            "questions": session_data.get("questions", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clear-session")
async def clear_session(session_id: str):
    """Session'ı temizle"""
    try:
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID gerekli")
        
        session_file = get_session_file(session_id)
        if os.path.exists(session_file):
            os.remove(session_file)
            return {
                "success": True,
                "session_id": session_id,
                "message": "Session başarıyla temizlendi"
            }
        else:
            return {
                "success": False,
                "session_id": session_id,
                "message": "Session zaten mevcut değil"
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Ana sayfa"""
    return {
        "service": "Table Analyzer Service",
        "version": "1.0.0",
        "supported_formats": ["json", "csv", "excel"],
        "analysis_type": "detailed",
        "languages": ["turkish", "english"],
        "endpoints": {
            "analyze_table": "POST /analyze-table",
            "upload_csv": "POST /upload-csv-and-analyze", 
            "upload_excel": "POST /upload-excel-and-analyze",
            "create_session": "POST /create-session",
            "ask_question": "POST /ask-question",
            "session_status": "GET /session-status",
            "session_history": "GET /session-history",
            "clear_session": "POST /clear-session",
            "health": "GET /health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
