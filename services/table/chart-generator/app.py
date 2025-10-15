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
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
os.makedirs("/app/outputs", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="/app/outputs"), name="outputs")

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
        # DataFrame'e çevir ve analiz et
        df = pd.DataFrame(table_data)
        
        # String'leri mümkünse sayısal'a çevir
        for col in df.columns:
            try:
                # Eğer kolon sayısal'a çevrilebiliyorsa, çevir
                df[col] = pd.to_numeric(df[col])
            except (ValueError, TypeError):
                # Çevrilemezse, olduğu gibi bırak
                pass
        
        # Null değerleri olan satırları filtrele
        initial_rows = len(df)
        df_clean = df.dropna()
        dropped_rows = initial_rows - len(df_clean)
        
        if dropped_rows > 0:
            print(f"ℹ️ {dropped_rows} satır null değer içerdiği için filtrelendi")
        
        # Temizlenmiş veriyi kullan
        df = df_clean
        
        # Kolon tiplerini belirle
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        # Kategorik kolonlarda unique değer sayısı az olanları bul (gerçek kategorik)
        true_categorical = []
        for col in categorical_cols:
            unique_count = df[col].nunique()
            if unique_count <= 20:  # 20'den az unique değer varsa kategorik
                true_categorical.append(f"{col} ({unique_count} kategori)")
        
        # Sayısal kolonlar için istatistikler ve korelasyon
        numeric_stats = []
        for col in numeric_cols:
            min_val = df[col].min()
            max_val = df[col].max()
            mean_val = df[col].mean()
            numeric_stats.append(f"{col} (ort:{mean_val:.1f}, min:{min_val:.1f}, max:{max_val:.1f})")
        
        # Korelasyon analizi (en yüksek korelasyonları bul)
        correlations = []
        if len(numeric_cols) >= 2:
            corr_matrix = df[numeric_cols].corr()
            for i in range(len(numeric_cols)):
                for j in range(i+1, len(numeric_cols)):
                    corr_val = abs(corr_matrix.iloc[i, j])
                    if corr_val > 0.3:  # %30'dan fazla korelasyon
                        correlations.append(f"{numeric_cols[i]}-{numeric_cols[j]} (r={corr_val:.2f})")
        
        # Dinamik grafik sayısı belirleme
        suggested_chart_count = min(
            max_charts,
            len(true_categorical) + len(numeric_cols) + len(correlations),
            10  # Maksimum 10 grafik
        )
        suggested_chart_count = max(suggested_chart_count, 3)  # En az 3 grafik
        
        # Sadece ilk 3 satırı örnek olarak göster
        sample_str = json.dumps(table_data[:3], ensure_ascii=False, indent=2)
        
        corr_info = f"\n- Yüksek Korelasyonlar: {', '.join(correlations)}" if correlations else ""
        
        prompt = f"""
        Bu tabloyu analiz et ve {suggested_chart_count} farklı grafik türü öner.
        
        VERİ BİLGİLERİ ({len(df)} satır, null değerler temizlendi):
        - Sayısal: {', '.join(numeric_stats) if numeric_stats else 'Yok'}
        - Kategorik: {', '.join(true_categorical) if true_categorical else 'Yok'}{corr_info}
        
        Örnek: {sample_str}
        
        GRAFİK ÖNERİLERİ:
        1. Her kategorik kolon için bar/pie chart (kategori dağılımı)
        2. Sayısal kolonların dağılımı için histogram
        3. Korelasyonu yüksek sayısal kolonlar için scatter plot
        4. Kategorik-sayısal kombinasyonlar için grouped bar chart
        
        KURALLAR:
        - Bar/Pie: X=kategorik, Y=sayısal (count veya sum)
        - Scatter/Line: X=sayısal, Y=sayısal
        - Histogram: Tek sayısal kolon
        - ID/metin kolonlarını kullanma
        
        JSON döndür:
        {{
            "charts": [
                {{
                    "type": "bar",
                    "title": "Türkçe Başlık",
                    "x_axis": "kolon_adı",
                    "y_axis": "kolon_adı",
                    "description": "Grafik açıklaması"
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
        
        # Mevcut sütunları al
        available_columns = list(table_data[0].keys()) if table_data else []
        
        # Sütun adı eşleştirme fonksiyonu (case-insensitive + fuzzy)
        def find_matching_column(suggested_col: str, available_cols: List[str]) -> str:
            # Tam eşleşme
            if suggested_col in available_cols:
                return suggested_col
            
            # Case-insensitive eşleşme
            for col in available_cols:
                if col.lower() == suggested_col.lower():
                    return col
            
            # Kısmi eşleşme
            for col in available_cols:
                if suggested_col.lower() in col.lower() or col.lower() in suggested_col.lower():
                    return col
            
            return None
        
        # DataFrame ve kolon tipleri
        df = pd.DataFrame(table_data)
        
        # String'leri mümkünse sayısal'a çevir
        for col in df.columns:
            try:
                df[col] = pd.to_numeric(df[col])
            except (ValueError, TypeError):
                pass
        
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        # ChartConfig objelerine dönüştür ve validate et
        chart_configs = []
        for chart_data in charts_data[:max_charts]:
            x_axis = chart_data.get("x_axis") or ""
            y_axis = chart_data.get("y_axis") or ""
            chart_type = chart_data.get("type") or "bar"
            
            # None değerleri kontrol et
            if not x_axis or not y_axis or not chart_type:
                print(f"⚠️ Eksik veri: x={x_axis}, y={y_axis}, type={chart_type}")
                continue
            
            # Sütun adlarını eşleştir
            matched_x = find_matching_column(str(x_axis), available_columns)
            matched_y = find_matching_column(str(y_axis), available_columns)
            
            if not matched_x or not matched_y:
                print(f"⚠️ Geçersiz sütunlar - x: {x_axis}→{matched_x}, y: {y_axis}→{matched_y}")
                print(f"   Mevcut: {available_columns}")
                continue
            
            # Grafik türüne göre kolon tiplerini validate et
            is_valid = True
            if chart_type in ["bar", "pie"]:
                # Bar/Pie: X kategorik, Y sayısal
                if matched_x not in categorical_cols:
                    print(f"⚠️ {chart_type}: X ekseni ({matched_x}) kategorik değil, atlanıyor")
                    is_valid = False
                if matched_y not in numeric_cols:
                    print(f"⚠️ {chart_type}: Y ekseni ({matched_y}) sayısal değil, atlanıyor")
                    is_valid = False
            elif chart_type in ["scatter", "line"]:
                # Scatter/Line: Her ikisi de sayısal
                if matched_x not in numeric_cols:
                    print(f"⚠️ {chart_type}: X ekseni ({matched_x}) sayısal değil, atlanıyor")
                    is_valid = False
                if matched_y not in numeric_cols:
                    print(f"⚠️ {chart_type}: Y ekseni ({matched_y}) sayısal değil, atlanıyor")
                    is_valid = False
            elif chart_type == "histogram":
                # Histogram: Sadece Y ekseni kullanılır ve sayısal olmalı
                if matched_y not in numeric_cols:
                    print(f"⚠️ histogram: Y ekseni ({matched_y}) sayısal değil, atlanıyor")
                    is_valid = False
            
            if not is_valid:
                continue
            
            if matched_x != x_axis or matched_y != y_axis:
                print(f"✅ Sütun eşleştirildi: {x_axis}→{matched_x}, {y_axis}→{matched_y}")
            
            config = ChartConfig(
                type=chart_type,
                title=chart_data.get("title", "Grafik"),
                x_axis=matched_x,
                y_axis=matched_y,
                description=chart_data.get("description", "")
            )
            chart_configs.append(config)
        
        if not chart_configs:
            print("⚠️ Hiç geçerli grafik bulunamadı, fallback kullanılıyor")
            # Fallback: Basit grafikler oluştur
            return create_fallback_charts(table_data, max_charts)
        
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
    
    # String'leri mümkünse sayısal'a çevir
    for col in df.columns:
        try:
            df[col] = pd.to_numeric(df[col])
        except (ValueError, TypeError):
            pass
    
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    charts = []
    
    # Bar chart (kategorik + sayısal)
    if categorical_cols and numeric_cols:
        charts.append(ChartConfig(
            type="bar",
            title=f"{categorical_cols[0]} - {numeric_cols[0]} Grafiği",
            x_axis=categorical_cols[0],
            y_axis=numeric_cols[0],
            description="Kategorik karşılaştırma grafiği"
        ))
    
    # Scatter chart (iki sayısal kolon)
    if len(numeric_cols) >= 2:
        charts.append(ChartConfig(
            type="scatter",
            title=f"{numeric_cols[0]} vs {numeric_cols[1]}",
            x_axis=numeric_cols[0],
            y_axis=numeric_cols[1],
            description="Sayısal korelasyon grafiği"
        ))
    
    # Histogram (tek sayısal kolon)
    if numeric_cols:
        charts.append(ChartConfig(
            type="histogram",
            title=f"{numeric_cols[0]} Dağılımı",
            x_axis=numeric_cols[0],
            y_axis=numeric_cols[0],
            description="Sayısal değer dağılımı"
        ))
    
    return charts[:max_charts]

def generate_chart(chart_config: ChartConfig, table_data: List[Dict], output_format: str) -> Chart:
    """Grafik oluştur ve kaydet"""
    try:
        df = pd.DataFrame(table_data)
        
        # String'leri mümkünse sayısal'a çevir
        for col in df.columns:
            try:
                df[col] = pd.to_numeric(df[col])
            except (ValueError, TypeError):
                pass
        
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
        
        # Frontend için path: /outputs/filename.png
        web_path = f"/outputs/{filename}"
        
        return Chart(
            id=len(table_data),  # Basit ID
            type=chart_config.type,
            title=chart_config.title,
            x_axis=chart_config.x_axis,
            y_axis=chart_config.y_axis,
            description=chart_config.description,
            file_path=web_path,
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
