# 📊 Chart Generator Servisi

Bu servis, tablolardan otomatik grafik üretimi yapar. LLM ile tablo analizi yaparak en uygun grafik türlerini seçer ve Plotly ile görselleştirir.

## 🚀 Özellikler

- **Çoklu Format Desteği**: JSON, CSV, Excel dosyaları
- **Otomatik Grafik Seçimi**: LLM ile akıllı analiz
- **Çoklu Grafik Türleri**: Bar, Line, Pie, Scatter, Heatmap, Histogram
- **Çoklu Çıktı Formatları**: PNG, SVG, HTML, JSON
- **LLM Entegrasyonu**: Ollama Gemma3:27b modeli

## 🛠️ Teknik Detaylar

### API Endpoints

#### 1. JSON ile Grafik Üretimi
```http
POST /generate-charts
Content-Type: application/json

{
  "table_data": [
    {"ay": "Ocak", "satis": 100, "maliyet": 80},
    {"ay": "Şubat", "satis": 120, "maliyet": 90}
  ],
  "max_charts": 5,
  "output_format": "png"
}
```

#### 2. CSV Upload ile Grafik Üretimi
```http
POST /upload-csv-and-generate
Content-Type: multipart/form-data

file: data.csv
max_charts: 5
output_format: png
```

#### 3. Excel Upload ile Grafik Üretimi
```http
POST /upload-excel-and-generate
Content-Type: multipart/form-data

file: data.xlsx
sheet_name: Sheet1
max_charts: 5
output_format: png
```

### Response Format
```json
{
  "success": true,
  "charts": [
    {
      "id": 1,
      "type": "bar",
      "title": "Aylık Satış Karşılaştırması",
      "x_axis": "ay",
      "y_axis": "satis",
      "description": "Aylara göre satış miktarları",
      "file_path": "/app/outputs/chart_abc123.png",
      "file_size": 45678
    }
  ],
  "metadata": {
    "total_charts": 5,
    "processing_time": 12.5,
    "table_rows": 12,
    "output_format": "png",
    "model": "gemma3:27b"
  }
}
```

## 📁 Dosya Yapısı

```
chart-generator/
├── app.py              # Ana FastAPI uygulaması
├── requirements.txt    # Python bağımlılıkları
├── Dockerfile         # Container tanımı
└── README.md          # Bu dosya
```

## 🎯 Kullanım Örnekleri

### JSON ile Grafik Üretimi
```bash
curl -X POST http://localhost:8009/generate-charts \
  -H "Content-Type: application/json" \
  -d '{
    "table_data": [
      {"ay": "Ocak", "satis": 100, "maliyet": 80},
      {"ay": "Şubat", "satis": 120, "maliyet": 90}
    ],
    "max_charts": 3,
    "output_format": "png"
  }'
```

### CSV Upload ile
```bash
curl -X POST http://localhost:8009/upload-csv-and-generate \
  -F "file=@data.csv" \
  -F "max_charts=3" \
  -F "output_format=png"
```

### Excel Upload ile
```bash
curl -X POST http://localhost:8009/upload-excel-and-generate \
  -F "file=@data.xlsx" \
  -F "sheet_name=Sheet1" \
  -F "max_charts=3" \
  -F "output_format=png"
```

### Python ile Kullanım
```python
import requests
import pandas as pd

# Tablo verisi hazırla
df = pd.read_csv("data.csv")
table_data = df.to_dict('records')

# Grafik üret
response = requests.post('http://localhost:8009/generate-charts', 
    json={
        'table_data': table_data,
        'max_charts': 5,
        'output_format': 'png'
    }
)

result = response.json()
for chart in result['charts']:
    print(f"Grafik: {chart['title']} - {chart['type']}")
```

## 🔧 Kurulum ve Çalıştırma

### Docker Compose ile (Önerilen)
```bash
# Projeyi klonlayın
git clone https://github.com/aeyeniay/ai_hub.git
cd ai_hub

# .env dosyasını oluşturun
./setup.sh

# Ollama modellerini indirin
ollama pull gemma3:27b

# Servisi build edin ve başlatın
sudo docker compose build chart-generator
sudo docker compose up chart-generator -d
```

### Yerel Geliştirme
```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Uygulamayı çalıştır
python app.py
```

## 📊 Desteklenen Grafik Türleri

### Otomatik Seçim Kriterleri
- **Bar Chart**: Kategorik + Sayısal veriler
- **Line Chart**: Zaman serisi, trend analizi
- **Pie Chart**: Oranlar, yüzdeler
- **Scatter Plot**: İki sayısal değişken korelasyonu
- **Heatmap**: Matris veriler, korelasyon
- **Histogram**: Veri dağılımı

### Çıktı Formatları
- **PNG**: Yüksek kaliteli görsel
- **SVG**: Vektör grafik (ölçeklenebilir)
- **HTML**: İnteraktif grafik
- **JSON**: Plotly veri formatı

## 🐛 Sorun Giderme

### Ollama Bağlantı Hatası
- `OLLAMA_BASE_URL` ortam değişkenini kontrol edin
- Ollama servisinin host'ta çalıştığından emin olun
- `sudo systemctl restart ollama` komutunu deneyin

### Grafik Üretim Hatası
- Tablo verisinin doğru formatda olduğundan emin olun
- Sütun adlarının benzersiz olduğunu kontrol edin
- Sayısal verilerin doğru tipte olduğunu kontrol edin

### Dosya Upload Hatası
- Dosya boyutunun 10MB'ı aşmadığından emin olun
- Dosya formatının desteklendiğini kontrol edin
- Excel dosyalarında sheet adının doğru olduğunu kontrol edin

## 📊 Performans

### İşlem Süreleri
- **Tablo Analizi**: ~5-10 saniye (LLM yanıt süresine bağlı)
- **Grafik Üretimi**: ~1-3 saniye per grafik
- **Toplam Süre**: ~10-20 saniye (5 grafik için)

### Memory Kullanımı
- **Temel işlem**: ~200-400MB (Python + Plotly)
- **LLM kullanımı**: Ollama modelinin RAM ihtiyacına göre değişir

## 🔮 Gelecek Özellikler

- [ ] Daha fazla grafik türü (Box Plot, Area Chart, etc.)
- [ ] Grafik özelleştirme seçenekleri
- [ ] Batch processing (çoklu dosya)
- [ ] Real-time grafik güncellemeleri
- [ ] Grafik şablonları ve temalar

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin
