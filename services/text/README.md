# Text Processing Services

Bu klasör, metin işleme servislerini içerir. Her servis bağımsız olarak çalışabilir ve kendi Docker container'ında çalışır.

## 📁 Servisler

### 1. PII Masking Service (Port 8000)
**Dosya Yolu**: `pii-masking/`
**Açıklama**: Kişisel bilgileri (PII) maskeleyen servis
**Özellikler**:
- E-posta, telefon, TC kimlik numarası tespiti
- Farklı maskeleme türleri (replace, hash, encrypt)
- Özelleştirilebilir entity seçimi

### 2. Template Rewrite Service (Port 8005)
**Dosya Yolu**: `template-rewrite/`
**Açıklama**: Word şablonları ile belge oluşturan servis
**Özellikler**:
- Gerekçe ve Belgenet formatları
- Dinamik içerik üretimi
- Word çıktısı (.docx)

### 3. Quiz Generator Service (Port 8006)
**Dosya Yolu**: `quiz-generator/`
**Açıklama**: Metin içeriğinden quiz soruları üreten servis
**Özellikler**:
- Çoktan seçmeli, doğru/yanlış, boşluk doldurma soruları
- Zorluk seviyesi ayarlama
- Konu bazlı filtreleme

### 4. Info Cards Service (Port 8008)
**Dosya Yolu**: `info-cards/`
**Açıklama**: Metin analizi ile bilgi kartları üreten servis
**Özellikler**:
- Tanım ve soru-cevap kartları
- Dinamik içerik çıkarımı
- Öğretici format


## 🚀 Kurulum

### 1. Tek Servis Çalıştırma
```bash
cd services/text/pii-masking
docker build -t ai_hub-pii-masking .
docker run -p 8004:8000 ai_hub-pii-masking
```

### 2. Tüm Servisleri Çalıştırma
```bash
# Ana dizinde
docker-compose up --build -d
```

## 🔧 API Kullanımı

### PII Masking
```bash
curl -X POST http://localhost:8004/mask \
  -H "Content-Type: application/json" \
  -d '{"text": "John Doe's email is john@example.com", "masking_type": "replace"}'
```

### Template Rewrite
```bash
curl -X POST http://localhost:8005/rewrite \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "template": "formal_greeting", "style": "professional"}'
```

### Quiz Generation
```bash
curl -X POST http://localhost:8006/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Machine learning is a subset of AI", "num_questions": 3, "difficulty": "medium"}'
```

### Info Cards Generation
```bash
curl -X POST http://localhost:8008/generate-cards \
  -H "Content-Type: application/json" \
  -d '{"text": "Machine learning is a subset of AI", "card_count": 5}'
```

## 📊 Servis Durumu

Tüm servisler `/health` endpoint'i ile sağlık kontrolü yapabilir:

```bash
curl http://localhost:8000/health  # PII Masking
curl http://localhost:8005/health  # Template Rewrite
curl http://localhost:8006/health  # Quiz Generator
curl http://localhost:8008/health  # Info Cards
```

## 🛠️ Geliştirme

Her servis bağımsız olarak geliştirilebilir. Ortak özellikler:
- FastAPI framework
- Pydantic model validation
- Docker containerization
- Health check endpoints
- Error handling

## 📝 Notlar

- Tüm servisler şu anda placeholder implementasyonlara sahip
- Gerçek AI/ML modelleri entegre edilecek
- Her servis kendi bağımsız portunda çalışır
- Ortak veri yapıları `data/` klasöründe saklanır




