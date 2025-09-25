# 🎮 Quiz Generator Servisi

Bu servis, verilen metinlerden otomatik olarak çoktan seçmeli quiz soruları oluşturur ve interaktif oyun deneyimi sunar.

## 🚀 Özellikler

- **Otomatik Soru Üretimi**: Gemma3:27b model ile Türkçe metinlerden sorular oluşturur
- **Çoktan Seçmeli Format**: Her soru 4 şıklı (A, B, C, D) olarak sunulur
- **İnteraktif Oyun**: Gerçek zamanlı cevap değerlendirmesi
- **Session Yönetimi**: Quiz ilerlemesi kalıcı olarak saklanır
- **Anında Feedback**: Her cevap sonrası doğru/yanlış açıklaması
- **Skor Takibi**: Quiz boyunca ilerleme izlenir

## 🛠️ Teknik Detaylar

### API Endpoints

#### 1. Quiz Oluşturma
```http
POST /generate
Content-Type: application/json

{
  "text": "Quiz oluşturulacak metin...",
  "num_questions": 5,
  "question_types": ["multiple_choice"],
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "quiz_id": "uuid-string",
  "total_questions": 5,
  "first_question": {
    "question": "Soru metni?",
    "options": ["A) Seçenek 1", "B) Seçenek 2", "C) Seçenek 3", "D) Seçenek 4"]
  }
}
```

#### 2. Cevap Verme
```http
POST /answer
Content-Type: application/json

{
  "quiz_id": "uuid-string",
  "question_index": 0,
  "user_answer": "A) Seçenek 1"
}
```

**Response:**
```json
{
  "correct": true,
  "explanation": "Açıklama metni...",
  "score": 1,
  "total_questions": 5,
  "next_question": {
    "question": "Sonraki soru?",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."]
  }
}
```

#### 3. Quiz Durumu
```http
GET /quiz/{quiz_id}
```

**Response:**
```json
{
  "quiz_id": "uuid-string",
  "current_question": 2,
  "score": 1,
  "total_questions": 5,
  "completed": false
}
```

### Çevre Değişkenleri

```bash
OLLAMA_BASE_URL=http://127.0.0.1:11434  # Ollama server adresi
MODEL_NAME=gemma3:27b                    # Kullanılacak model
PORT=8006                                # Servis portu
```

## 📁 Dosya Yapısı

```
quiz-generator/
├── app.py              # Ana uygulama
├── requirements.txt    # Python bağımlılıkları
├── Dockerfile         # Container tanımı
├── README.md          # Bu dosya
└── quiz_sessions/     # Session dosyaları (runtime)
```

## 🎯 Kullanım Örnekleri

### Basit Quiz Oluşturma
```bash
curl -X POST http://localhost:8006/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Türkiye Cumhuriyeti 29 Ekim 1923 tarihinde kurulmuştur. Cumhurbaşkanı Mustafa Kemal Atatürk'tür.",
    "num_questions": 3
  }'
```

### Quiz Oynama
```bash
# 1. Quiz oluştur ve quiz_id'yi al
QUIZ_ID="generated-quiz-id"

# 2. İlk soruya cevap ver
curl -X POST http://localhost:8006/answer \
  -H "Content-Type: application/json" \
  -d "{
    \"quiz_id\": \"$QUIZ_ID\",
    \"question_index\": 0,
    \"user_answer\": \"A) 29 Ekim 1923\"
  }"

# 3. İkinci soruya cevap ver
curl -X POST http://localhost:8006/answer \
  -H "Content-Type: application/json" \
  -d "{
    \"quiz_id\": \"$QUIZ_ID\",
    \"question_index\": 1,
    \"user_answer\": \"B) Mustafa Kemal Atatürk\"
  }"
```

## 🔧 Geliştirme

### Yerel Çalıştırma
```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Çevre değişkenlerini ayarla
export OLLAMA_BASE_URL=http://localhost:11434
export MODEL_NAME=gemma3:27b
export PORT=8006

# Uygulamayı çalıştır
python app.py
```

### Docker ile Çalıştırma
```bash
# Image oluştur
docker build -t quiz-generator .

# Container çalıştır
docker run -p 8006:8006 \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  -e MODEL_NAME=gemma3:27b \
  -v ./quiz_sessions:/app/quiz_sessions \
  quiz-generator
```

## 🐛 Sorun Giderme

### Ollama Bağlantı Hatası
```bash
# Ollama çalışıyor mu kontrol et
curl http://localhost:11434/api/tags

# Model yüklü mü kontrol et
ollama list | grep gemma3
```

### Quiz Session Sorunları
```bash
# Session klasörü var mı kontrol et
ls -la /app/quiz_sessions/

# Session dosyaları kontrol et
find /app/quiz_sessions/ -name "*.json" -exec cat {} \;
```

### Port Çakışması
```bash
# Port kullanımını kontrol et
netstat -tlnp | grep :8006

# Farklı port kullan
export PORT=8007
```

## 📊 Performans

- **Quiz Oluşturma**: ~15-30 saniye (metin uzunluğuna bağlı)
- **Cevap Değerlendirme**: ~3-8 saniye
- **Memory Kullanımı**: ~100-200MB (session dosyaları hariç)
- **Disk Kullanımı**: Her quiz ~1-5KB (session dosyası)

## 🔮 Gelecek Özellikler

- [ ] Farklı soru tipleri (doğru/yanlış, kısa cevap)
- [ ] Zorluk seviyesi ayarlaması
- [ ] Timer (süre sınırı) desteği
- [ ] Leaderboard (skor tablosu)
- [ ] Quiz kategorileri
- [ ] Çoklu dil desteği
- [ ] Export/import quiz özelliği

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
