# Text Processing Services

Bu klasör, metin işleme servislerini içerir. Her servis bağımsız olarak çalışabilir ve kendi Docker container'ında çalışır.

## 📁 Servisler

### 1. PII Masking Service (Port 8004)
**Dosya Yolu**: `pii-masking/`
**Açıklama**: Kişisel bilgileri (PII) maskeleyen servis
**Özellikler**:
- E-posta, telefon, TC kimlik numarası tespiti
- Farklı maskeleme türleri (replace, hash, encrypt)
- Özelleştirilebilir entity seçimi

### 2. Template Rewrite Service (Port 8005)
**Dosya Yolu**: `template-rewrite/`
**Açıklama**: Metinleri şablona göre yeniden yazan servis
**Özellikler**:
- Jinja2 template desteği
- Farklı yazım stilleri (professional, casual, academic, creative)
- Değişken tabanlı metin üretimi

### 3. Quiz Generator Service (Port 8006)
**Dosya Yolu**: `quiz-generator/`
**Açıklama**: Metin içeriğinden quiz soruları üreten servis
**Özellikler**:
- Çoktan seçmeli, doğru/yanlış, boşluk doldurma soruları
- Zorluk seviyesi ayarlama
- Konu bazlı filtreleme

### 4. Flashcard Generator Service (Port 8007)
**Dosya Yolu**: `flashcard-generator/`
**Açıklama**: Metin içeriğinden flashcard'lar üreten servis
**Özellikler**:
- Farklı kart türleri (basic, cloze, image, audio)
- Zorluk seviyesi ayarlama
- Görsel ve ses desteği

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

### Flashcard Generation
```bash
curl -X POST http://localhost:8007/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Photosynthesis converts light to energy", "num_cards": 5, "card_type": "basic"}'
```

## 📊 Servis Durumu

Tüm servisler `/health` endpoint'i ile sağlık kontrolü yapabilir:

```bash
curl http://localhost:8004/health  # PII Masking
curl http://localhost:8005/health  # Template Rewrite
curl http://localhost:8006/health  # Quiz Generator
curl http://localhost:8007/health  # Flashcard Generator
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




