# 📊 Table Analyzer Servisi

Bu servis, tablolardan metin yorumlaması üretir. IELTS Writing Task 1 tarzında akademik ve profesyonel analiz yapar. Ollama Gemma3:27b modeli ile çalışır.

## 🚀 Özellikler

- **Çoklu Format Desteği**: JSON, CSV, Excel dosyaları
- **4 Analiz Türü**: Kapsamlı, Trend, Özet, Detaylı
- **Çoklu Dil Desteği**: Türkçe, İngilizce
- **IELTS Tarzı Yorumlama**: Akademik vocabulary kullanımı
- **Çeşitli Cümle Yapıları**: Tekrarı önleyen çeşitlilik

## 🛠️ Teknik Detaylar

### API Endpoints

#### 1. JSON ile Tablo Analizi
```http
POST /analyze-table
Content-Type: application/json

{
  "table_data": [
    {"ay": "Ocak", "satis": 100, "maliyet": 80},
    {"ay": "Şubat", "satis": 120, "maliyet": 90}
  ],
  "analysis_type": "comprehensive",
  "language": "turkish",
  "output_format": "text"
}
```

#### 2. CSV Upload ile Analiz
```http
POST /upload-csv-and-analyze
Content-Type: multipart/form-data

file: data.csv
analysis_type: comprehensive
language: turkish
output_format: text
```

#### 3. Excel Upload ile Analiz
```http
POST /upload-excel-and-analyze
Content-Type: multipart/form-data

file: data.xlsx
sheet_name: Sheet1
analysis_type: comprehensive
language: turkish
output_format: text
```

### Response Format
```json
{
  "success": true,
  "analysis": {
    "title": "Aylık Satış Analizi",
    "summary": "Tablo, 2023 yılı aylık satış verilerini göstermektedir...",
    "key_findings": [
      "En yüksek satış Temmuz ayında gerçekleşmiştir",
      "Satışlarda genel artış trendi gözlemlenmektedir"
    ],
    "trends": [
      "İlk çeyrekte yavaş artış",
      "İkinci çeyrekte hızlı yükseliş",
      "Üçüncü çeyrekte zirve noktası"
    ],
    "comparisons": [
      "Temmuz ayı satışları Ocak ayından %80 daha yüksek",
      "Son çeyrek dönemde hafif düşüş gözlemlenmiştir"
    ],
    "recommendations": [
      "Yaz aylarındaki yüksek performansı sürdürmek için strateji geliştirilmeli",
      "Kış aylarındaki düşük satışları artırmak için kampanya planlanmalı"
    ],
    "detailed_analysis": "Detaylı analiz metni..."
  },
  "metadata": {
    "analysis_type": "comprehensive",
    "language": "turkish",
    "processing_time": 15.2,
    "table_rows": 12,
    "model": "gemma3:27b"
  }
}
```

## 📊 Analiz Türleri

### 1. Comprehensive (Kapsamlı)
- **Amaç**: Tam analiz
- **İçerik**: Özet, bulgular, trendler, karşılaştırmalar, öneriler
- **Kullanım**: Detaylı raporlama

### 2. Trends (Trend Analizi)
- **Amaç**: Sadece trend analizi
- **İçerik**: Artış, azalış, istikrar, dalgalanmalar
- **Kullanım**: Zaman serisi analizi

### 3. Summary (Özet)
- **Amaç**: Kısa özet
- **İçerik**: Ana noktalar, temel bulgular
- **Kullanım**: Hızlı genel bakış

### 4. Detailed (Detaylı)
- **Amaç**: Çok detaylı analiz
- **İçerik**: Her veri noktası, derinlemesine yorumlama
- **Kullanım**: Akademik çalışmalar

## 🎯 IELTS Tarzı Vocabulary

### Trend Fiilleri
- **Artış**: artış göstermek, yükselmek, artmak, çıkmak, yükselişe geçmek
- **Azalış**: azalış göstermek, düşmek, azalmak, gerilemek, düşüşe geçmek
- **İstikrar**: sabit kalmak, değişmemek, istikrarlı olmak, durağan kalmak
- **Dalgalanma**: dalgalanmak, değişkenlik göstermek, istikrarsız olmak

### Yoğunluk Zarfları
- **Dramatik**: dramatik olarak, çarpıcı şekilde, gözle görülür biçimde
- **Önemli**: önemli ölçüde, kayda değer şekilde, dikkat çekici biçimde
- **Orta**: orta düzeyde, makul ölçüde, ılımlı şekilde
- **Hafif**: hafifçe, küçük ölçüde, az miktarda

### Karşılaştırma İfadeleri
- **En Yüksek**: en yüksek, maksimum, tepe noktası, zirve
- **En Düşük**: en düşük, minimum, dip noktası, asgari
- **Benzer**: benzer, yakın, eşdeğer, karşılaştırılabilir
- **Farklı**: farklı, ayrı, değişik, başka

## 📁 Dosya Yapısı

```
table-analyzer/
├── app.py              # Ana FastAPI uygulaması
├── requirements.txt    # Python bağımlılıkları
├── Dockerfile         # Container tanımı
└── README.md          # Bu dosya
```

## 🎯 Kullanım Örnekleri

### JSON ile Analiz
```bash
curl -X POST http://localhost:8010/analyze-table \
  -H "Content-Type: application/json" \
  -d '{
    "table_data": [
      {"ay": "Ocak", "satis": 100, "maliyet": 80},
      {"ay": "Şubat", "satis": 120, "maliyet": 90}
    ],
    "analysis_type": "comprehensive",
    "language": "turkish"
  }'
```

### CSV Upload ile
```bash
curl -X POST http://localhost:8010/upload-csv-and-analyze \
  -F "file=@data.csv" \
  -F "analysis_type=trends" \
  -F "language=turkish"
```

### Excel Upload ile
```bash
curl -X POST http://localhost:8010/upload-excel-and-analyze \
  -F "file=@data.xlsx" \
  -F "sheet_name=Sheet1" \
  -F "analysis_type=detailed" \
  -F "language=turkish"
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
sudo docker compose build table-analyzer
sudo docker compose up table-analyzer -d
```

### Yerel Geliştirme
```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Uygulamayı çalıştır
python app.py
```

## 🐛 Sorun Giderme

### Ollama Bağlantı Hatası
- `OLLAMA_BASE_URL` ortam değişkenini kontrol edin
- Ollama servisinin host'ta çalıştığından emin olun
- `sudo systemctl restart ollama` komutunu deneyin

### Analiz Hatası
- Tablo verisinin doğru formatda olduğundan emin olun
- Sütun adlarının benzersiz olduğunu kontrol edin
- Veri tiplerinin uygun olduğunu kontrol edin

## 📊 Performans

### İşlem Süreleri
- **Kapsamlı Analiz**: ~15-25 saniye
- **Trend Analizi**: ~10-15 saniye
- **Özet Analiz**: ~8-12 saniye
- **Detaylı Analiz**: ~20-30 saniye

### Memory Kullanımı
- **Temel işlem**: ~100-200MB
- **LLM kullanımı**: Ollama modelinin RAM ihtiyacına göre değişir

## 🔮 Gelecek Özellikler

- [ ] Daha fazla analiz türü
- [ ] Grafik entegrasyonu
- [ ] Çoklu dil desteği genişletme
- [ ] Analiz şablonları
- [ ] PDF çıktı desteği

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin
