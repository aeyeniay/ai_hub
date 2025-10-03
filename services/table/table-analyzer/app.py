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
from pydantic import BaseModel
import requests
import time
import io

# FastAPI uygulaması
app = FastAPI(
    title="Table Analyzer Service",
    description="Tablolardan metin yorumlaması üreten servis",
    version="1.0.0"
)

# Ortam değişkenleri
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma3:27b")
PORT = int(os.getenv("PORT", 8010))

# Pydantic modelleri
class TableAnalysisRequest(BaseModel):
    table_data: List[Dict[str, Any]]
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
    analysis: TableAnalysis
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

def call_ollama_for_analysis(table_data: List[Dict], language: str) -> TableAnalysis:
    """Ollama LLM'den tablo analizi al"""
    try:
        # Tabloyu string'e çevir
        table_str = json.dumps(table_data, ensure_ascii=False, indent=2)
        
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
        
        # JSON parse et
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
        
        print(f"📊 Detaylı tablo analizi yapılıyor...")
        
        start_time = time.time()
        
        # LLM ile detaylı analiz
        analysis = call_ollama_for_analysis(
            request.table_data, 
            request.language
        )
        
        processing_time = time.time() - start_time
        
        return TableAnalysisResponse(
            success=True,
            analysis=analysis,
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
            "health": "GET /health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
