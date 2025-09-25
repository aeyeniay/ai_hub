# Image Processing Services

Bu klasör, görsel işleme servislerini içerir. Her servis bağımsız olarak çalışabilir ve kendi Docker container'ında çalışır.

## 📁 Servisler

### 1. ImageGen Service (Port 8001)
**Dosya Yolu**: `imggen/`
**Açıklama**: SDXL-Turbo ile hızlı görsel üretimi
**Model**: stabilityai/sdxl-turbo
**Özellikler**:
- Text-to-image generation
- GPU accelerated (CUDA)
- **Offline Capability** (internet olmadan çalışabilir)
- Cache-first model loading
- Local model support
- 512x512 high quality output
- PNG/JPEG export

**API Endpoints**:
- `POST /generate` - Görsel üret
- `GET /health` - Sağlık kontrolü
- `GET /image/{filename}` - Görsel indir

### 2. Detect Service (Port 8003)
**Dosya Yolu**: `detect/`
**Açıklama**: Gemma3:27b ile nesne tespiti
**Model**: gemma3:27b via Ollama
**Özellikler**:
- AI-powered object detection
- Turkish language support
- Confidence scores
- Detailed analysis
- Base64 and file upload support

**API Endpoints**:
- `POST /detect` - Nesne tespit et
- `GET /health` - Sağlık kontrolü

### 3. VQA Service (Port 8002)
**Dosya Yolu**: `vqa/`
**Açıklama**: Qwen2.5VL:32b ile görsel soru-cevap
**Model**: qwen2.5vl:32b via Ollama
**Özellikler**:
- Visual Question Answering
- Session management
- Turkish conversation support
- Persistent chat history
- Multi-modal AI capabilities

**API Endpoints**:
- `POST /upload` - Session başlat
- `POST /ask` - Soru sor
- `GET /session/{id}` - Session durumu
- `GET /health` - Sağlık kontrolü

## 🚀 Hızlı Başlangıç

### Tüm Servisleri Çalıştırma
```bash
cd /home/ahmeterdem.yeniay/ai_hub
docker compose up image-services
```

### Tekil Servis Çalıştırma
```bash
# Sadece ImageGen
docker compose up imggen

# Sadece Detect
docker compose up detect

# Sadece VQA
docker compose up vqa
```

## 🔧 Gereksinimler

### Donanım
- **ImageGen**: NVIDIA GPU (6GB+ VRAM önerilen)
- **Detect**: 16GB+ RAM (Gemma3:27b için)
- **VQA**: 32GB+ RAM (Qwen2.5VL:32b için)

### Yazılım
- Docker & Docker Compose
- NVIDIA Container Toolkit (GPU için)
- Ollama (Detect ve VQA için)

### Modeller
```bash
# Gerekli modelleri indir
ollama pull gemma3:27b    # Detect için
ollama pull qwen2.5vl:32b # VQA için

# ImageGen modeli (opsiyonel - otomatik indirilir)
# stabilityai/sdxl-turbo
```

## 📊 Performans Karşılaştırması

| Servis | İşlem Süresi | VRAM/RAM | Model Boyutu | Offline |
|--------|-------------|----------|--------------|---------|
| ImageGen | 1-2 saniye | 4-6GB VRAM | ~7GB | ✅ |
| Detect | 3-8 saniye | 16GB RAM | ~16GB | ❌ |
| VQA | 5-15 saniye | 32GB RAM | ~20GB | ❌ |

## 🔍 Test Senaryoları

### ImageGen Test
```bash
# Health check (offline capability kontrolü)
curl http://localhost:8001/health | jq
# Beklenen: "offline_capable": true

# Görsel üretimi
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful sunset over mountains"}'
```

### Detect Test
```bash
curl -X POST http://localhost:8003/detect \
  -F "file=@/path/to/image.jpg"
```

### VQA Test
```bash
# 1. Upload image
RESPONSE=$(curl -X POST http://localhost:8002/upload -F "file=@image.jpg")
SESSION_ID=$(echo $RESPONSE | jq -r '.session_id')

# 2. Ask question
curl -X POST http://localhost:8002/ask \
  -H "Content-Type: application/json" \
  -d "{\"session_id\": \"$SESSION_ID\", \"question\": \"Bu görselde neler var?\"}"
```

## 🐛 Sorun Giderme

### Genel Kontroller
```bash
# Tüm servislerin durumu
docker compose ps

# Logları kontrol et
docker compose logs imggen
docker compose logs detect  
docker compose logs vqa

# Health check
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
```

### Ollama Sorunları
```bash
# Ollama çalışıyor mu?
curl http://localhost:11434/api/tags

# Modeller yüklü mü?
ollama list

# Ollama restart
sudo systemctl restart ollama
```

### GPU Sorunları
```bash
# GPU kullanımı
nvidia-smi

# Container GPU erişimi
docker run --rm --gpus all nvidia/cuda:12.1.1-base-ubuntu22.04 nvidia-smi
```

## 📚 Detaylı Dokümantasyon

Her servisin kendi README'si vardır:
- [ImageGen Dokümantasyonu](imggen/README.md)
- [Detect Dokümantasyonu](detect/README.md)
- [VQA Dokümantasyonu](vqa/README.md)

## 🔮 Gelecek Planları

### Kısa Vadeli
- [x] **Offline Capability** (ImageGen) ✅
- [ ] Video processing servisi
- [ ] Image editing servisi  
- [ ] Batch processing support

### Uzun Vadeli
- [ ] Real-time streaming
- [ ] Custom model fine-tuning
- [ ] Multi-model ensemble
- [ ] Edge deployment support

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
