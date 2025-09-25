# 🎨 ImageGen Servisi - SDXL-Turbo

Bu servis, Stable Diffusion XL-Turbo modelini kullanarak metinlerden hızlı görsel üretimi yapar.

## 🚀 Özellikler

- **Hızlı Görsel Üretimi**: SDXL-Turbo ile tek adımda görsel oluşturma
- **GPU Hızlandırması**: CUDA desteği ile hızlı işlem
- **Offline Capability**: İnternet bağlantısı olmadan çalışabilir
- **Cache-First Loading**: Model önce cache'den, sonra local'den yüklenir
- **Otomatik Fallback**: Cache/local yoksa HuggingFace'den indirme
- **Yüksek Kalite**: 512x512 piksel çözünürlük
- **Çoklu Format**: PNG, JPEG çıktı desteği

## 🛠️ Teknik Detaylar

### Model Bilgileri
- **Model**: stabilityai/sdxl-turbo
- **Pipeline**: AutoPipelineForText2Image
- **Inference Steps**: 1 (ultra-fast)
- **Guidance Scale**: 0.0 (turbo mode)
- **Resolution**: 512x512 piksel
- **Loading Strategy**: Cache → Local → Online
- **Offline Support**: ✅ Tam offline çalışabilir

### Donanım Gereksinimleri
- **GPU**: NVIDIA GPU (CUDA 12.1+) - Önerilen
- **VRAM**: En az 6GB VRAM
- **RAM**: En az 8GB sistem RAM'i
- **Disk**: ~7GB model dosyaları için

### API Endpoints

#### 1. Görsel Üretimi
```http
POST /generate
Content-Type: application/json

{
  "prompt": "A beautiful sunset over mountains",
  "negative_prompt": "blurry, low quality",
  "num_inference_steps": 1,
  "guidance_scale": 0.0,
  "width": 512,
  "height": 512
}
```

**Response:**
```json
{
  "success": true,
  "image_url": "/image/uuid-filename.png",
  "filename": "uuid-filename.png",
  "model_info": {
    "model": "stabilityai/sdxl-turbo",
    "source": "local|huggingface",
    "device": "cuda|cpu"
  }
}
```

#### 2. Sağlık Kontrolü
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "model": "stabilityai/sdxl-turbo",
  "model_source": "cache",
  "device": "cuda",
  "local_model": true,
  "offline_capable": true
}
```

#### 3. Görsel İndirme
```http
GET /image/{filename}
```

### Çevre Değişkenleri

```bash
MODEL_PATH=/app/models/sdxl-turbo     # Local model yolu
DEVICE=cuda                           # cuda|cpu
MODEL_ID=stabilityai/sdxl-turbo      # HuggingFace model ID
```

## 📁 Dosya Yapısı

```
imggen/
├── app.py              # Ana uygulama
├── requirements.txt    # Python bağımlılıkları
├── Dockerfile         # Container tanımı
├── README.md          # Bu dosya
├── models/            # Local model dosyaları (opsiyonel)
│   └── sdxl-turbo/
└── outputs/           # Üretilen görseller
```

## 🎯 Kullanım Örnekleri

### Basit Görsel Üretimi
```bash
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cute cat sitting on a rainbow"
  }'
```

### Detaylı Görsel Üretimi
```bash
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic city at sunset, cyberpunk style",
    "negative_prompt": "blurry, low quality, distorted",
    "width": 512,
    "height": 512
  }'
```

### Python ile Kullanım
```python
import requests
import json

response = requests.post('http://localhost:8001/generate', 
    json={
        'prompt': 'A beautiful landscape with mountains and lake',
        'negative_prompt': 'blurry, low quality'
    }
)

result = response.json()
if result['success']:
    image_url = f"http://localhost:8001{result['image_url']}"
    print(f"Generated image: {image_url}")
```

## 🔌 Offline Capability

### Model Loading Strategy
Servis, modeli yüklerken şu sırayı takip eder:

1. **🏠 Cache-First**: HuggingFace cache'den `local_files_only=True` ile yükleme
2. **📁 Local Path**: Mount edilmiş local model path'den yükleme  
3. **🌐 Online Fallback**: Son çare olarak HuggingFace'den online indirme

### Offline Test
```bash
# 1. İlk yükleme (internet gerekli)
docker compose up -d imggen

# 2. Model cache'e kaydedildikten sonra
curl http://localhost:8001/health
# Response: "offline_capable": true

# 3. İnterneti kes ve test et
curl http://localhost:8001/health
# Hala çalışmalı: "model_source": "cache"
```

### Offline Durumda Çalışma
- ✅ **Health Check**: Çalışır
- ✅ **Image Generation**: Çalışır  
- ✅ **Model Loading**: Cache'den yüklenir
- ❌ **Model Download**: İnternet gerekli

## 🔧 Kurulum ve Çalıştırma

### Docker ile (Önerilen)
```bash
# GPU desteği ile çalıştır
docker run -p 8001:8000 \
  --gpus all \
  -e DEVICE=cuda \
  -v ./models/sdxl-turbo:/app/models/sdxl-turbo \
  -v ./outputs:/app/outputs \
  imggen:latest
```

### Yerel Geliştirme
```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Model indirme (opsiyonel - local için)
python -c "
from diffusers import AutoPipelineForText2Image
pipe = AutoPipelineForText2Image.from_pretrained('stabilityai/sdxl-turbo')
pipe.save_pretrained('./models/sdxl-turbo')
"

# Çevre değişkenlerini ayarla
export DEVICE=cuda
export MODEL_PATH=./models/sdxl-turbo

# Uygulamayı çalıştır
python app.py
```

## 🐛 Sorun Giderme

### GPU Tanınmıyor
```bash
# CUDA kontrolü
nvidia-smi

# PyTorch CUDA kontrolü
python -c "import torch; print(torch.cuda.is_available())"

# CPU'ya geçiş
export DEVICE=cpu
```

### Model İndirme Hatası
```bash
# HuggingFace token gerekebilir
export HUGGINGFACE_HUB_TOKEN=your_token

# Manuel model indirme
huggingface-cli download stabilityai/sdxl-turbo
```

### VRAM Yetersizliği
```bash
# CPU kullan
export DEVICE=cpu

# Veya daha düşük çözünürlük
{
  "width": 256,
  "height": 256
}
```

### Port Çakışması
```bash
# Farklı port kullan
docker run -p 8009:8000 imggen:latest
```

## 📊 Performans

### GPU (CUDA)
- **Üretim Süresi**: ~1-2 saniye (SDXL-Turbo)
- **Model Yükleme**: ~10-30 saniye (ilk sefer), ~5-10 saniye (cache'den)
- **VRAM Kullanımı**: ~4-6GB
- **Çözünürlük**: 512x512 optimal

### CPU
- **Üretim Süresi**: ~30-60 saniye
- **Model Yükleme**: ~2-5 dakika (ilk sefer), ~30-60 saniye (cache'den)
- **RAM Kullanımı**: ~8-12GB
- **Çözünürlük**: 256x256 önerilen

### Offline Performance
- **Cache Loading**: ~5-10 saniye
- **Local Loading**: ~10-20 saniye
- **Online Loading**: ~30-60 saniye (internet gerekli)

## 🎨 Prompt Önerileri

### İyi Prompt Örnekleri
```
"A photorealistic portrait of a woman, professional lighting"
"Cyberpunk city at night, neon lights, rain, detailed"
"Mountain landscape, golden hour, cinematic"
"Abstract art, colorful, geometric patterns"
```

### Negative Prompt Önerileri
```
"blurry, low quality, distorted, ugly, deformed, extra limbs"
```

## 🔮 Gelecek Özellikler

- [x] **Offline Capability**: Cache-first model loading ✅
- [x] **SDXL-Turbo Support**: Ultra-fast generation ✅
- [ ] Daha yüksek çözünürlük desteği (1024x1024)
- [ ] Batch generation (toplu üretim)
- [ ] Image-to-image transformation
- [ ] ControlNet entegrasyonu
- [ ] Farklı model seçenekleri (SD1.5, SD2.1)
- [ ] API rate limiting
- [ ] Görsel galeri sistemi
- [ ] Model versioning ve switching

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin
