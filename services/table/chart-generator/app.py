#!/usr/bin/env python3
"""
Chart Generator Servisi
Tablolardan otomatik grafik üretimi (JSON, CSV, Excel desteği)
"""

import os
import json
import uuid
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import requests
import time
import io
import base64

# FastAPI uygulaması
app = FastAPI(
    title="Chart Generator Service",
    description="Tablolardan otomatik grafik üretimi",
    version="1.0.0"
)

# Ortam değişkenleri
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma3:27b")
PORT = int(os.getenv("PORT", 8009))

# Pydantic modelleri
class ChartRequest(BaseModel):
    table_data: List[Dict[str, Any]]
    max_charts: int = 5
    output_format: str = "png"  # png, svg, html, json

class ChartConfig(BaseModel):
    type: str
    title: str
    x_axis: str
    y_axis: str
    description: str

class Chart(BaseModel):
    id: int
    type: str
    title: str
    x_axis: str
    y_axis: str
    description: str
    file_path: str
    file_size: int

class ChartResponse(BaseModel):
    success: bool
    charts: List[Chart]
    metadata: Dict[str, Any]

# Ollama çağrı fonksiyonu
def call_ollama_for_analysis(table_data: List[Dict], max_charts: int) -> List[ChartConfig]:
    """Ollama LLM'den tablo analizi ve grafik önerileri al"""
    try:
        # Tabloyu string'e çevir
        table_str = json.dumps(table_data, ensure_ascii=False, indent=2)
        
        prompt = f"""
        Bu tabloyu analiz et ve en uygun {max_charts} adet grafik türünü belirle:
        
        Tablo Verisi:
        {table_str}
        
        Her grafik için şunları belirle:
        1. Grafik türü: bar, line, pie, scatter, heatmap, histogram
        2. X ve Y eksenleri (sütun adları)
        3. Anlamlı başlık
        4. Kısa açıklama
        
        Sadece JSON formatında döndür:
        {{
            "charts": [
                {{
                    "type": "bar",
                    "title": "Grafik Başlığı",
                    "x_axis": "sütun_adı",
                    "y_axis": "sütun_adı", 
                    "description": "Bu grafik ne gösteriyor"
                }}
            ]
        }}
        """
        
        url = f"{OLLAMA_BASE_URL}/api/generate"
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9,
                "max_tokens": 1500
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
        charts_data = data.get("charts", [])
        
        # ChartConfig objelerine dönüştür
        chart_configs = []
        for chart_data in charts_data[:max_charts]:
            config = ChartConfig(
                type=chart_data.get("type", "bar"),
                title=chart_data.get("title", "Grafik"),
                x_axis=chart_data.get("x_axis", ""),
                y_axis=chart_data.get("y_axis", ""),
                description=chart_data.get("description", "")
            )
            chart_configs.append(config)
        
        return chart_configs
        
    except Exception as e:
        print(f"❌ LLM analiz hatası: {e}")
        # Fallback: Basit grafikler oluştur
        return create_fallback_charts(table_data, max_charts)

def create_fallback_charts(table_data: List[Dict], max_charts: int) -> List[ChartConfig]:
    """LLM başarısız olursa basit grafikler oluştur"""
    if not table_data:
        return []
    
    df = pd.DataFrame(table_data)
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    charts = []
    
    # Bar chart (kategorik + sayısal)
    if categorical_cols and numeric_cols:
        charts.append(ChartConfig(
            type="bar",
            title=f"{categorical_cols[0]} vs {numeric_cols[0]}",
            x_axis=categorical_cols[0],
            y_axis=numeric_cols[0],
            description="Kategorik karşılaştırma grafiği"
        ))
    
    # Line chart (eğer tarih varsa)
    if len(numeric_cols) >= 2:
        charts.append(ChartConfig(
            type="line",
            title=f"{numeric_cols[0]} Trendi",
            x_axis="index",
            y_axis=numeric_cols[0],
            description="Zaman serisi grafiği"
        ))
    
    return charts[:max_charts]

def generate_chart(chart_config: ChartConfig, table_data: List[Dict], output_format: str) -> Chart:
    """Grafik oluştur ve kaydet"""
    try:
        df = pd.DataFrame(table_data)
        
        # Grafik oluştur
        if chart_config.type == "bar":
            # Karşılaştırma grafikleri için çoklu seri kontrolü
            if "karşılaştırma" in chart_config.title.lower() or "comparison" in chart_config.title.lower():
                # Birden fazla sayısal sütun varsa çoklu seri oluştur
                numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
                if len(numeric_cols) > 1 and chart_config.x_axis in df.columns:
                    # Melt ile veriyi uzun formata çevir
                    df_melted = df.melt(id_vars=[chart_config.x_axis], 
                                      value_vars=numeric_cols, 
                                      var_name='Kategori', 
                                      value_name='Değer')
                    fig = px.bar(df_melted, x=chart_config.x_axis, y='Değer', 
                               color='Kategori', title=chart_config.title,
                               barmode='group')
                else:
                    fig = px.bar(df, x=chart_config.x_axis, y=chart_config.y_axis, title=chart_config.title)
            else:
                fig = px.bar(df, x=chart_config.x_axis, y=chart_config.y_axis, title=chart_config.title)
                
        elif chart_config.type == "line":
            # Trend grafikleri için çoklu seri kontrolü
            if "trend" in chart_config.title.lower() or "karşılaştırma" in chart_config.title.lower():
                numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
                if len(numeric_cols) > 1 and chart_config.x_axis in df.columns:
                    df_melted = df.melt(id_vars=[chart_config.x_axis], 
                                      value_vars=numeric_cols, 
                                      var_name='Kategori', 
                                      value_name='Değer')
                    fig = px.line(df_melted, x=chart_config.x_axis, y='Değer', 
                                color='Kategori', title=chart_config.title)
                else:
                    fig = px.line(df, x=chart_config.x_axis, y=chart_config.y_axis, title=chart_config.title)
            else:
                fig = px.line(df, x=chart_config.x_axis, y=chart_config.y_axis, title=chart_config.title)
                
        elif chart_config.type == "pie":
            fig = px.pie(df, names=chart_config.x_axis, values=chart_config.y_axis, title=chart_config.title)
        elif chart_config.type == "scatter":
            fig = px.scatter(df, x=chart_config.x_axis, y=chart_config.y_axis, title=chart_config.title)
        elif chart_config.type == "heatmap":
            # Heatmap için pivot table oluştur
            pivot_df = df.pivot_table(values=chart_config.y_axis, index=chart_config.x_axis, aggfunc='mean')
            fig = px.imshow(pivot_df, title=chart_config.title)
        elif chart_config.type == "histogram":
            fig = px.histogram(df, x=chart_config.y_axis, title=chart_config.title)
        else:
            # Varsayılan bar chart
            fig = px.bar(df, x=chart_config.x_axis, y=chart_config.y_axis, title=chart_config.title)
        
        # Dosya adı oluştur
        chart_id = uuid.uuid4().hex[:8]
        filename = f"chart_{chart_id}.{output_format}"
        filepath = f"/app/outputs/{filename}"
        
        # Grafiği kaydet
        if output_format == "html":
            fig.write_html(filepath)
        elif output_format == "png":
            fig.write_image(filepath, width=800, height=600)
        elif output_format == "svg":
            fig.write_image(filepath, format="svg", width=800, height=600)
        else:
            # JSON formatında kaydet
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(fig.to_dict(), f, ensure_ascii=False, indent=2)
        
        # Dosya boyutunu al
        file_size = os.path.getsize(filepath) if os.path.exists(filepath) else 0
        
        return Chart(
            id=len(table_data),  # Basit ID
            type=chart_config.type,
            title=chart_config.title,
            x_axis=chart_config.x_axis,
            y_axis=chart_config.y_axis,
            description=chart_config.description,
            file_path=filepath,
            file_size=file_size
        )
        
    except Exception as e:
        print(f"❌ Grafik oluşturma hatası: {e}")
        raise HTTPException(status_code=500, detail=f"Grafik oluşturma hatası: {str(e)}")

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
        "service": "chart-generator",
        "ollama_status": ollama_status,
        "model": MODEL_NAME
    }

@app.post("/generate-charts", response_model=ChartResponse)
async def generate_charts(request: ChartRequest):
    """JSON tablosundan grafik üret"""
    try:
        if not request.table_data:
            raise HTTPException(status_code=400, detail="Tablo verisi boş olamaz")
        
        print(f"📊 Grafik üretiliyor: {request.max_charts} adet")
        
        start_time = time.time()
        
        # LLM ile analiz
        chart_configs = call_ollama_for_analysis(request.table_data, request.max_charts)
        
        # Grafikleri oluştur
        charts = []
        for i, config in enumerate(chart_configs, 1):
            chart = generate_chart(config, request.table_data, request.output_format)
            chart.id = i
            charts.append(chart)
        
        processing_time = time.time() - start_time
        
        return ChartResponse(
            success=True,
            charts=charts,
            metadata={
                "total_charts": len(charts),
                "processing_time": round(processing_time, 2),
                "table_rows": len(request.table_data),
                "output_format": request.output_format,
                "model": MODEL_NAME
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Grafik üretim hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-csv-and-generate", response_model=ChartResponse)
async def upload_csv_and_generate(
    file: UploadFile = File(...),
    max_charts: int = Form(5),
    output_format: str = Form("png")
):
    """CSV dosyası yükle ve grafik üret"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Sadece CSV dosyaları desteklenir")
        
        file_content = await file.read()
        table_data = parse_csv_file(file_content)
        
        # JSON endpoint'ini çağır
        request = ChartRequest(
            table_data=table_data,
            max_charts=max_charts,
            output_format=output_format
        )
        
        return await generate_charts(request)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ CSV upload hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-excel-and-generate", response_model=ChartResponse)
async def upload_excel_and_generate(
    file: UploadFile = File(...),
    sheet_name: str = Form(None),
    max_charts: int = Form(5),
    output_format: str = Form("png")
):
    """Excel dosyası yükle ve grafik üret"""
    try:
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Sadece Excel dosyaları desteklenir")
        
        file_content = await file.read()
        table_data = parse_excel_file(file_content, sheet_name)
        
        # JSON endpoint'ini çağır
        request = ChartRequest(
            table_data=table_data,
            max_charts=max_charts,
            output_format=output_format
        )
        
        return await generate_charts(request)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Excel upload hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Ana sayfa"""
    return {
        "service": "Chart Generator Service",
        "version": "1.0.0",
        "supported_formats": ["json", "csv", "excel"],
        "chart_types": ["bar", "line", "pie", "scatter", "heatmap", "histogram"],
        "endpoints": {
            "generate_charts": "POST /generate-charts",
            "upload_csv": "POST /upload-csv-and-generate", 
            "upload_excel": "POST /upload-excel-and-generate",
            "health": "GET /health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
