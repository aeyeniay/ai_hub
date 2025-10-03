# 📊 Tablo İşlemleri Servisleri

Bu klasör, tablo verilerini işlemek ve analiz etmek için tasarlanmış servisleri içerir.

## 🚀 Servisler

### 📈 Chart Generator (Port 8009)
- **Amaç**: JSON, CSV ve Excel tablolardan otomatik grafik üretimi
- **Model**: Gemma3:27b (Ollama üzerinden)
- **Özellikler**:
  - Çoklu veri formatı desteği (JSON, CSV, Excel)
  - Akıllı grafik önerisi (Ollama ile)
  - Çoklu seri karşılaştırmaları
  - PNG/SVG çıktı formatları
  - Bar, Line, Pie, Scatter, Heatmap, Histogram grafik türleri

### 📋 Table Analyzer (Port 8010)
- **Amaç**: Tablolardan detaylı metin analizi ve stratejik öngörüler
- **Model**: Gemma3:27b (Ollama üzerinden)
- **Özellikler**:
  - Kapsamlı istatistiksel analiz
  - Trend analizi ve karşılaştırmalar
  - Anomali tespiti
  - İş etkileri ve stratejik öneriler
  - Risk değerlendirmesi
  - IELTS Writing Task 1 stilinde akademik yorumlama

## 🔧 Teknik Detaylar

### Bağımlılıklar
- **FastAPI**: Web framework
- **Pandas**: Veri işleme
- **Plotly**: Grafik üretimi
- **OpenPyXL**: Excel dosya desteği
- **Ollama**: LLM entegrasyonu

### Veri Formatları
- **JSON**: `[{"column1": "value1", "column2": "value2"}, ...]`
- **CSV**: Standart CSV formatı
- **Excel**: .xlsx dosyaları

## 📁 Dosya Yapısı

```
services/table/
├── chart-generator/
│   ├── app.py              # FastAPI uygulaması
│   ├── requirements.txt    # Python bağımlılıkları
│   ├── Dockerfile         # Docker konfigürasyonu
│   └── README.md          # Servis dokümantasyonu
├── table-analyzer/
│   ├── app.py              # FastAPI uygulaması
│   ├── requirements.txt    # Python bağımlılıkları
│   ├── Dockerfile         # Docker konfigürasyonu
│   └── README.md          # Servis dokümantasyonu
└── README.md              # Bu dosya
```

## 🚀 Hızlı Başlangıç

### 1. Servisleri Başlat
```bash
# Tüm tablo servislerini başlat
docker compose up -d chart-generator table-analyzer

# Sadece grafik üreticiyi başlat
docker compose up -d chart-generator

# Sadece tablo analizcisini başlat
docker compose up -d table-analyzer
```

### 2. Test Et
```bash
# Grafik üretici test
curl -X POST http://localhost:8009/generate-charts \
  -H "Content-Type: application/json" \
  -d @test_chart_generator.json

# Tablo analiz test
curl -X POST http://localhost:8010/analyze-table \
  -H "Content-Type: application/json" \
  -d @test_table_analyzer.json
```

## 📊 Örnek Kullanım

### Chart Generator
```bash
# CSV dosyasından grafik üret
curl -X POST http://localhost:8009/upload-csv-and-generate \
  -F "file=@sales_data.csv" \
  -F "max_charts=3" \
  -F "output_format=png"
```

### Table Analyzer
```bash
# Excel dosyasından analiz üret
curl -X POST http://localhost:8010/upload-excel-and-analyze \
  -F "file=@financial_data.xlsx" \
  -F "language=turkish"
```

## 🔍 API Endpoints

### Chart Generator
- `POST /generate-charts` - JSON veri ile grafik üret
- `POST /upload-csv-and-generate` - CSV dosya yükle ve grafik üret
- `POST /upload-excel-and-generate` - Excel dosya yükle ve grafik üret

### Table Analyzer
- `POST /analyze-table` - JSON veri ile analiz yap
- `POST /upload-csv-and-analyze` - CSV dosya yükle ve analiz yap
- `POST /upload-excel-and-analyze` - Excel dosya yükle ve analiz yap

## 🎯 Özellikler

### Chart Generator
- **Akıllı Grafik Seçimi**: Ollama modeli en uygun grafik türünü önerir
- **Çoklu Seri Desteği**: Karşılaştırma grafikleri için otomatik çoklu seri oluşturma
- **Format Esnekliği**: PNG, SVG, HTML çıktı formatları
- **Veri Dönüşümü**: Otomatik veri tipi tespiti ve dönüşümü

### Table Analyzer
- **Kapsamlı Analiz**: 12 farklı analiz kategorisi
- **Akademik Dil**: IELTS Writing Task 1 stilinde profesyonel yorumlama
- **Stratejik Öngörüler**: İş etkileri ve risk değerlendirmesi
- **Çok Dilli Destek**: Türkçe ve İngilizce analiz

## 🛠️ Geliştirme

### Yeni Grafik Türü Ekleme
1. `chart-generator/app.py` dosyasında `generate_chart` fonksiyonunu güncelle
2. Plotly ile yeni grafik türünü implement et
3. Test dosyalarını güncelle

### Yeni Analiz Kategorisi Ekleme
1. `table-analyzer/app.py` dosyasında `TableAnalysis` modelini güncelle
2. `create_detailed_analysis_prompt` fonksiyonunu genişlet
3. Test senaryolarını ekle

## 📝 Notlar

- Her iki servis de Ollama'ya bağımlıdır
- GPU kullanımı opsiyoneldir (Ollama konfigürasyonuna bağlı)
- Büyük veri setleri için işlem süresi artabilir
- Grafik dosyaları `/data/outputs/table/` klasöründe saklanır
