# 🔧 AI Hub Konfigürasyon Rehberi

Bu rehber AI Hub servislerini farklı ortamlarda kurmak ve konfigüre etmek için hazırlanmıştır.

## 🪟 Windows Docker Desktop Kurulumu

### Ön Gereksinimler
- Docker Desktop for Windows (çalışır durumda)
- Python 3.9+ (proxy için)
- Git Bash (önerilir)
- External Ollama sunucusu (`http://172.17.28.121/api`)

### Kurulum Adımları

#### 1. Projeyi Klonla
```bash
git clone https://github.com/aeyeniay/ai_hub.git
cd ai_hub
```

#### 2. .env Dosyasını Yapılandır
```bash
# .env dosyası oluştur
cat > .env << 'EOF'
# Ollama Configuration (Windows Proxy)
OLLAMA_BASE_URL=http://host.docker.internal:11434

# Model Configuration
GEMMA_MODEL=gemma3:27b
QWEN_VL_MODEL=qwen2.5vl:32b
IMGGEN_MODEL=stabilityai/sdxl-turbo

# Port Configuration
PII_MASKING_PORT=8000
IMGGEN_PORT=8001
VQA_PORT=8002
DETECT_PORT=8003
QUIZ_GENERATOR_PORT=8006
TEMPLATE_REWRITE_PORT=8007
INFO_CARDS_PORT=8008
CHART_GENERATOR_PORT=8009
TABLE_ANALYZER_PORT=8010
EOF
```

#### 3. Ollama Proxy'yi Başlat
```bash
# Gerekli paketleri kur
pip install flask requests

# Proxy'yi başlat (ayrı terminal)
python ollama_proxy.py
```

#### 4. Docker Servisleri Başlat
```bash
docker compose up -d
```

#### 5. Test JSON Dosyalarını Oluştur
```bash
# Belgenet testi için
echo '{"konu":"Test Belgenet","icerik_konusu":"Test icerigi","format_type":"belgenet"}' > test_belgenet.json

# Gerekçe testi için
echo '{"konu":"Test Gerekce","icerik_konusu":"Test icerigi","imza_atacaklar":[{"isim":"Test","unvan":"Mudur"}]}' > test_gerekce.json
```

## 🚀 Hızlı Kurulum (Linux/Mac)

### Otomatik Kurulum (Önerilen)
```bash
./setup.sh
```

### Manuel Kurulum
```bash
# 1. Konfigürasyon dosyasını oluştur
cp .env.example .env

# 2. .env dosyasını düzenle
nano .env

# 3. Servisleri başlat
docker compose up -d
```

## ⚙️ Konfigürasyon Seçenekleri

### Ollama Ayarları
```bash
# Yerel Ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434

# Uzak Ollama
OLLAMA_BASE_URL=http://192.168.1.100:11434

# Docker içinde Ollama (örnek)
OLLAMA_BASE_URL=http://ollama-container:11434
```

### Model Seçenekleri
```bash
# Varsayılan modeller
GEMMA_MODEL=gemma3:27b
QWEN_VL_MODEL=qwen2.5vl:32b

# Alternatif modeller
GEMMA_MODEL=gemma3:4b          # Daha az RAM kullanır
QWEN_VL_MODEL=qwen2.5vl:7b     # Daha hızlı çalışır
```

### Port Ayarları
```bash
# Görsel Servisleri
IMGGEN_PORT=8001
VQA_PORT=8002
DETECT_PORT=8003

# Metin Servisleri
PII_MASKING_PORT=8000
TEMPLATE_REWRITE_PORT=8007
QUIZ_GENERATOR_PORT=8006
INFO_CARDS_PORT=8008

# Tablo İşlemleri
CHART_GENERATOR_PORT=8009
TABLE_ANALYZER_PORT=8010
```

### Servis Ayarları
```bash
# Görsel Servisleri
IMGGEN_PORT=8001
VQA_PORT=8002
DETECT_PORT=8003

# Metin Servisleri
PII_MASKING_PORT=8000
TEMPLATE_REWRITE_PORT=8007
QUIZ_GENERATOR_PORT=8006
INFO_CARDS_PORT=8008

# Tablo İşlemleri
CHART_GENERATOR_PORT=8009
TABLE_ANALYZER_PORT=8010

# Port çakışması durumunda değiştirin
VQA_PORT=9002
DETECT_PORT=9003
QUIZ_GENERATOR_PORT=9006
```

## 🏗️ Farklı Ortamlar

### Geliştirme Ortamı
```bash
# .env.development
OLLAMA_BASE_URL=http://localhost:11434
DEVICE=cpu
CONFIDENCE_THRESHOLD=0.3
```

### Prodüksiyon Ortamı
```bash
# .env.production
OLLAMA_BASE_URL=http://internal-ollama-server:11434
DEVICE=cuda
CONFIDENCE_THRESHOLD=0.7
```

### Docker Swarm/Kubernetes
```bash
# External Ollama service
OLLAMA_BASE_URL=http://ollama-service:11434
```

## 🔍 Sorun Giderme

### Ollama Bağlantı Sorunu
```bash
# Ollama çalışıyor mu kontrol et
curl http://localhost:11434/api/tags

# Ollama başlat
ollama serve

# Model yükle
ollama pull gemma3:27b
ollama pull qwen2.5vl:32b
```

### Port Çakışması
```bash
# Kullanılmayan portları kontrol et
netstat -tulpn | grep LISTEN

# .env dosyasında portları değiştir
VQA_PORT=9002
```

### GPU Sorunu
```bash
# GPU kullanımını kontrol et
nvidia-smi

# CPU'ya geç
DEVICE=cpu
```

## 📊 Servis Durumu Kontrol

### Health Check'ler
```bash
# Tüm servisler
curl http://localhost:8000/health  # PII Masking
curl http://localhost:8001/health  # Image Gen
curl http://localhost:8002/health  # VQA
curl http://localhost:8003/health  # Detect  
curl http://localhost:8006/health  # Quiz Generator

# Tek komutla tümü
for port in 8000 8001 8002 8003 8006; do
  echo "Port $port:"
  curl -s http://localhost:$port/health | jq .status 2>/dev/null || echo "Not responding"
done
```

## 🎨 ImageGen Özel Ayarları

### Offline Capability Konfigürasyonu
```bash
# ImageGen servisi portu
IMGGEN_PORT=8001

# Model konfigürasyonu
IMGGEN_MODEL=stabilityai/sdxl-turbo
DEVICE=cuda

# Model dosyaları için volume (offline capability için)
./models/sdxl-turbo:/app/models/sdxl-turbo

# Çıktı dosyaları için volume
./data/outputs/images:/app/outputs
```

### Offline Test
```bash
# 1. İlk yükleme (internet gerekli)
docker compose up -d imggen

# 2. Health check - offline capability durumu
curl http://localhost:8001/health | jq
# Beklenen: "offline_capable": true

# 3. Model loading strategy kontrolü
# Cache → Local → Online sıralaması
```

### Model Loading Strategy
- **Cache-First**: HuggingFace cache'den `local_files_only=True`
- **Local Path**: Mount edilmiş `/app/models/sdxl-turbo` path'i
- **Online Fallback**: Son çare olarak HuggingFace'den indirme

## 📝 Template-Rewrite Özel Ayarları

### Template-Rewrite Konfigürasyonu
```bash
# Template-rewrite servisi portu
TEMPLATE_REWRITE_PORT=8007

# Şablon dosyaları için volume
./services/text/template-rewrite/templates:/app/templates

# Çıktı dosyaları için volume
./data/outputs/text:/app/outputs

# Ollama bağlantısı
OLLAMA_BASE_URL=http://127.0.0.1:11434
MODEL_NAME=gemma3:27b
```

### Template-Rewrite Test Etme
```bash
# Sağlık kontrolü
curl http://localhost:8005/health

# Gerekçe belgesi oluşturma testi
curl -X POST http://localhost:8005/generate-document \
  -H "Content-Type: application/json" \
  -d '{
    "konu": "Test Gerekçesi",
    "icerik_konusu": "Bu bir test gerekçesidir.",
    "imza_atacaklar": [
      {
        "isim": "Test Kullanıcı",
        "unvan": "Test Müdürü"
      }
    ],
    "format_type": "gerekce"
  }'

# Belgenet evrakı oluşturma testi
curl -X POST http://localhost:8005/generate-document \
  -H "Content-Type: application/json" \
  -d '{
    "konu": "Test Belgenet",
    "icerik_konusu": "Bu bir test belgenet evrakıdır.",
    "imza_atacaklar": [],
    "format_type": "belgenet"
  }'
```

### Şablon Yönetimi
```bash
# Şablon dosyalarını kontrol et
ls -la services/text/template-rewrite/templates/gerekceler/
ls -la services/text/template-rewrite/templates/belgenet/

# Yeni Word şablonu ekle
cp yeni_gerekce.docx services/text/template-rewrite/templates/gerekceler/
cp yeni_belgenet.docx services/text/template-rewrite/templates/belgenet/

# Servisi yeniden başlat (otomatik yükleme)
docker compose restart template-rewrite
```

### Çıktı Dosyaları
```bash
# Oluşturulan belgeleri kontrol et
ls -la data/outputs/text/

# Belge boyutlarını kontrol et
du -sh data/outputs/text/*.docx
```

## 🎮 Quiz Generator Özel Ayarları

### Quiz Konfigürasyonu
```bash
# Quiz servisi portu
QUIZ_GENERATOR_PORT=8006

# Session dosyaları için volume
./data/quiz_sessions:/app/quiz_sessions

# Quiz parametreleri (app.py içinde değiştirilebilir)
DEFAULT_NUM_QUESTIONS=5
DEFAULT_DIFFICULTY="medium"
```

### Quiz Test Etme
```bash
# Quiz oluşturma testi
curl -X POST http://localhost:8006/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test metni buraya...",
    "num_questions": 3,
    "question_types": ["multiple_choice"],
    "difficulty": "medium"
  }'

# Quiz durumu kontrol
curl "http://localhost:8006/quiz/{quiz_id}"

# Cevap verme testi
curl -X POST http://localhost:8006/answer \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_id": "test-quiz-id",
    "question_index": 0,
    "user_answer": "A) Test cevabı"
  }'
```

### Quiz Session Yönetimi

## 🃏 Bilgi Kartları Özel Ayarları

### Bilgi Kartları Konfigürasyonu
```bash
# Bilgi kartları servisi portu
INFO_CARDS_PORT=8008

# Ollama bağlantısı
OLLAMA_BASE_URL=http://127.0.0.1:11434
MODEL_NAME=gemma3:27b

# Çıktı dosyaları için volume
./data/outputs/text:/app/outputs
```

### Bilgi Kartları Test Etme
```bash
# Sağlık kontrolü
curl http://localhost:8008/health

# Bilgi kartları oluşturma testi
curl -X POST http://localhost:8008/generate-cards \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test metni buraya...",
    "card_count": 5
  }'
```

### Bilgi Kartları Özellikleri
```bash
# Desteklenen kart türleri
- Tanım kartları (definition)
- Soru-cevap kartları (question_answer)

# Kart sayısı sınırları
- Minimum: 1 kart
- Maksimum: 20 kart
- Varsayılan: 5 kart

# Performans
- İşlem süresi: ~10-20 saniye
- Metin uzunluğu: Sınırsız
- Model: Gemma3:27b
```

### Çıktı Formatı
```json
{
  "success": true,
  "cards": [
    {
      "id": 1,
      "content": "Kart içeriği...",
      "type": "definition"
    }
  ],
  "metadata": {
    "total_cards": 5,
    "processing_time": 15.5,
    "text_length": 2500,
    "model": "gemma3:27b"
  }
}
```
```bash
# Session dosyalarını görme
ls -la data/quiz_sessions/

# Eski session'ları temizleme
find data/quiz_sessions/ -name "*.json" -mtime +7 -delete

# Session boyutunu kontrol etme
du -sh data/quiz_sessions/
```

## 🔄 Güncelleme ve Bakım

### Konfigürasyon Değişikliği
```bash
# .env dosyasını güncelle
nano .env

# Servisleri yeniden başlat
docker compose restart
```

### Model Güncelleme
```bash
# Yeni model çek
ollama pull gemma3:27b-latest

# .env'de model ismini güncelle
GEMMA_MODEL=gemma3:27b-latest

# Servisleri yeniden başlat
docker compose restart
```

## 📁 Dosya Yapısı

```
ai_hub/
├── .env                    # Konfigürasyon (git'e push edilmez)
├── .env.example           # Konfigürasyon şablonu
├── setup.sh              # Otomatik kurulum scripti
├── docker-compose.yml    # Servis tanımları
├── README.md             # Ana dokümantasyon
├── CONFIGURATION.md      # Bu dosya
├── services/
│   ├── image/
│   │   ├── imggen/       # Görsel üretim servisi (offline capable)
│   │   ├── detect/       # Nesne tespit servisi
│   │   └── vqa/          # Görsel soru-cevap servisi
│   └── text/
│       ├── pii-masking/  # Kişisel bilgi maskeleme
│       ├── quiz-generator/ # İnteraktif quiz oluşturma
│       ├── template-rewrite/
│       └── flashcard-generator/
└── data/
    ├── uploads/          # Yüklenen dosyalar
    ├── outputs/          # Çıktı dosyaları
    └── quiz_sessions/    # Quiz session dosyaları
```
