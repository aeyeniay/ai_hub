# 👁️ VQA Servisi - Visual Question Answering

Bu servis, Qwen2.5VL:32b modelini kullanarak görseller hakkında Türkçe sorular cevaplar ve interaktif görsel analiz sağlar.

## 🚀 Özellikler

- **Görsel Soru-Cevap**: Görseller hakkında doğal dil soruları
- **Session Yönetimi**: Sürekli konuşma ve context saklama
- **Türkçe Destek**: Hem sorular hem cevaplar Türkçe
- **Detaylı Analiz**: Çevre, objeler, duygular, aktiviteler
- **Multimodal AI**: Görsel + metin understanding
- **Persistent Sessions**: Kalıcı session dosyaları

## 🛠️ Teknik Detaylar

### Model Bilgileri
- **Model**: Qwen2.5VL:32b via Ollama
- **Vision Capabilities**: Multi-modal AI
- **Language**: Türkçe çıktı desteği
- **Context Window**: Extended conversation support

### API Endpoints

#### 1. Session Başlatma
```http
POST /upload
Content-Type: multipart/form-data

file: [image_file]
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "status": "success", 
  "message": "Görsel yüklendi, soru sorabilirsiniz",
  "image_info": {
    "size": [1024, 768],
    "format": "JPEG"
  }
}
```

#### 2. Soru Sorma
```http
POST /ask
Content-Type: application/json

{
  "session_id": "uuid-string",
  "question": "Bu görselde neler görüyorsun?"
}
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "question": "Bu görselde neler görüyorsun?",
  "answer": "Bu görselde güzel bir doğa manzarası görüyorum. Ön planda yeşil çimenler, arka planda dağlar ve masmavi gökyüzü var...",
  "conversation_history": [
    {
      "question": "Bu görselde neler görüyorsun?",
      "answer": "...",
      "timestamp": "2024-01-20T10:30:00"
    }
  ]
}
```

#### 3. Session Durumu
```http
GET /session/{session_id}
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "created_at": "2024-01-20T10:00:00",
  "last_question": "Bu görselde neler görüyorsun?",
  "question_count": 3,
  "image_info": {
    "size": [1024, 768],
    "format": "JPEG"
  },
  "conversation_history": [...]
}
```

#### 4. Sağlık Kontrolü
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "model": "qwen2.5vl:32b",
  "ollama_url": "http://127.0.0.1:11434",
  "sessions_dir": "/app/sessions"
}
```

### Çevre Değişkenleri

```bash
OLLAMA_BASE_URL=http://127.0.0.1:11434    # Ollama server adresi
MODEL_NAME=qwen2.5vl:32b                   # Kullanılacak vision model
```

## 📁 Dosya Yapısı

```
vqa/
├── app.py              # Ana uygulama
├── requirements.txt    # Python bağımlılıkları
├── Dockerfile         # Container tanımı
├── README.md          # Bu dosya
├── uploads/           # Yüklenen görseller
└── sessions/          # Session dosyaları (JSON)
```

## 🎯 Kullanım Örnekleri

### Temel VQA Akışı
```bash
# 1. Görsel yükle ve session başlat
RESPONSE=$(curl -X POST http://localhost:8002/upload \
  -F "file=@/path/to/image.jpg")

SESSION_ID=$(echo $RESPONSE | jq -r '.session_id')

# 2. Soru sor
curl -X POST http://localhost:8002/ask \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"question\": \"Bu görselde neler görüyorsun?\"
  }"

# 3. Devam eden sorular
curl -X POST http://localhost:8002/ask \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"question\": \"Bu manzara hangi mevsimde çekilmiş olabilir?\"
  }"
```

### Python ile Interaktif VQA
```python
import requests
import json

# Görsel yükle
with open('nature.jpg', 'rb') as f:
    upload_response = requests.post('http://localhost:8002/upload', 
                                  files={'file': f})

session_id = upload_response.json()['session_id']

# Soru-cevap döngüsü
questions = [
    "Bu görselde neler görüyorsun?",
    "Hava durumu nasıl görünüyor?", 
    "Bu fotoğraf hangi mevsimde çekilmiş olabilir?",
    "Bu manzarada en dikkat çeken şey nedir?"
]

for question in questions:
    response = requests.post('http://localhost:8002/ask',
        json={
            'session_id': session_id,
            'question': question
        }
    )
    
    result = response.json()
    print(f"S: {question}")
    print(f"C: {result['answer']}\n")
```

### Çevre Analizi Örneği
```python
# Çevre sorunları analizi
environmental_questions = [
    "Bu görselde herhangi bir çevre sorunu görüyor musun?",
    "Su kalitesi nasıl görünüyor?",
    "Bu durum doğal hayatı nasıl etkileyebilir?",
    "Bu sorunu çözmek için ne önerirsin?"
]

for question in environmental_questions:
    response = requests.post('http://localhost:8002/ask',
        json={'session_id': session_id, 'question': question})
    print(f"🌍 {question}")
    print(f"🤖 {response.json()['answer']}\n")
```

## 🔧 Kurulum ve Çalıştırma

### Docker ile (Önerilen)
```bash
# Host network ile çalıştır (Ollama erişimi için)
docker run --network host \
  -e OLLAMA_BASE_URL=http://127.0.0.1:11434 \
  -e MODEL_NAME=qwen2.5vl:32b \
  -v ./uploads:/app/uploads \
  -v ./sessions:/app/sessions \
  vqa:latest
```

### Yerel Geliştirme
```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Ollama'nın çalıştığından emin ol
ollama serve

# Qwen2.5VL modelini indir
ollama pull qwen2.5vl:32b

# Çevre değişkenlerini ayarla
export OLLAMA_BASE_URL=http://localhost:11434
export MODEL_NAME=qwen2.5vl:32b

# Session klasörünü oluştur
mkdir -p sessions uploads

# Uygulamayı çalıştır
python app.py
```

## 🐛 Sorun Giderme

### Ollama Bağlantı Hatası
```bash
# Ollama çalışıyor mu kontrol et
curl http://localhost:11434/api/tags

# Ollama başlat
ollama serve

# Qwen2.5VL model var mı kontrol et
ollama list | grep qwen2.5vl
```

### Model İndirme Hatası
```bash
# Model manuel indir (büyük dosya - sabır gerekli)
ollama pull qwen2.5vl:32b

# Model boyutunu kontrol et
ollama list
```

### Session Hatası
```bash
# Session klasörü var mı kontrol et
ls -la /app/sessions/

# Session dosyaları kontrol et
find /app/sessions/ -name "*.json" -exec cat {} \;

# Session klasörünü temizle
rm -rf /app/sessions/*.json
```

### Memory Yetersizliği
```bash
# Daha küçük model kullan
export MODEL_NAME=qwen2.5vl:7b

# Ollama memory limitini ayarla
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_LOADED_MODELS=1
```

## 📊 Performans

### Donanım Gereksinimleri
- **RAM**: En az 32GB (Qwen2.5VL:32b için)
- **GPU**: En az 24GB VRAM (önerilen)
- **CPU**: 8+ core (CPU mode için)

### Model Alternatifleri
```bash
# Hafif versiyon (16GB RAM)
MODEL_NAME=qwen2.5vl:7b

# Orta versiyon (24GB RAM)  
MODEL_NAME=qwen2.5vl:14b

# Full versiyon (32GB+ RAM)
MODEL_NAME=qwen2.5vl:32b
```

### İşlem Süreleri
- **İlk yükleme**: ~30-60 saniye (model loading)
- **Görsel analizi**: ~5-15 saniye
- **Basit sorular**: ~3-8 saniye
- **Karmaşık sorular**: ~10-25 saniye

## 🎨 Soru Türleri

### Genel Analiz
```
"Bu görselde neler görüyorsun?"
"Bu fotoğrafı nasıl tanımlarsın?"
"Bu görsel hakkında detaylı bilgi ver"
```

### Çevre Analizi
```
"Bu görselde çevre sorunları var mı?"
"Su kalitesi nasıl?"
"Bu durum doğaya nasıl etki eder?"
```

### Duygusal Analiz
```
"Bu görselin genel ruh hali nasıl?"
"Bu fotoğraf hangi duyguları çağrıştırıyor?"
"Bu manzara sana nasıl hissettiriyor?"
```

### Teknik Analiz
```
"Bu fotoğraf hangi açıdan çekilmiş?"
"Işık koşulları nasıl?"
"Kompozisyon açısından ne dersin?"
```

## 🔮 Gelecek Özellikler

- [ ] Video frame analizi
- [ ] Multi-image comparison
- [ ] Drawing/annotation support
- [ ] Voice input/output
- [ ] Real-time streaming
- [ ] Custom model fine-tuning
- [ ] API rate limiting
- [ ] Export conversation history

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun  
3. Değişikliklerinizi commit edin
4. Pull request gönderin
