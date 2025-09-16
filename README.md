# AI Hub Services

Bu proje, görsel üretim, görselden soru-cevap ve nesne tespiti servislerini içeren bir AI hub'ıdır.

## 🚀 Servisler

- **imggen** (Port 8001): SDXL-Turbo ile görsel üretim
- **vqa** (Port 8002): Ollama VLM ile görselden soru-cevap  
- **detect** (Port 8000): **LLaVA-34B ile nesne tespiti** 🆕
- **nginx** (Port 80): Reverse proxy

## ⚠️ Önemli Notlar

### Ollama Erişimi
- VQA ve Detect servisleri Ollama'ya erişmek için `network_mode: "host"` kullanır
- Ollama host'ta çalışmalı (127.0.0.1:11434)
- Container'da `host.docker.internal` çalışmaz (sadece Mac/Win Docker Desktop)

### GPU Gereksinimleri
- **imggen**: GPU hızlandırma ister (CUDA 12.1)
- **detect**: **GPU gerekmez** - LLaVA Ollama üzerinden çalışır 🆕
- **vqa**: GPU gerekmez - Ollama üzerinden çalışır

## 🛠️ Kurulum

### 1. Ollama Kurulumu (Host)
```bash
# Ollama'ı host'ta kur ve çalıştır
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve

# LLaVA-34B modelini indir (nesne tespiti için)
ollama pull llava:34b

# LLaVA modelini indir (VQA için)
ollama pull llava
```

### 2. NVIDIA Docker Kurulumu (sadece imggen için)
```bash
# NVIDIA Container Toolkit kur
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

### 3. Servisleri Başlat
```bash
# Tüm servisleri build et ve başlat
docker-compose up --build

# Arka planda çalıştır
docker-compose up -d --build
```

## 📁 Dizin Yapısı

```
ai-hub-services/
├── services/
│   ├── imggen/          # Görsel üretim servisi (GPU gerekli)
│   ├── vqa/            # VQA servisi (Ollama üzerinden)
│   └── detect/         # **LLaVA nesne tespiti (Ollama üzerinden)** 🆕
├── uploads/            # Yüklenen dosyalar
├── outputs/            # Üretilen çıktılar
├── docker-compose.yml  # Servis konfigürasyonu
└── nginx.conf         # Nginx konfigürasyonu
```

## 🔧 API Kullanımı

### Görsel Üretim (imggen)
```bash
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a beautiful sunset over mountains"}'
```

### Görselden Soru-Cevap (vqa)
```bash
curl -X POST http://localhost:8002/vqa \
  -F "image=@image.jpg" \
  -F "question=What do you see in this image?"
```

### **LLaVA Nesne Tespiti (detect)** 🆕
```bash
# Port 8000'de çalışır (host network)
curl -X POST http://localhost:8000/detect \
  -F "image=@image.jpg"
```

**Çıktı örneği:**
```json
{
  "detections": [
    {
      "name": "araba",
      "location": "görselin sol tarafında",
      "details": "kırmızı renk, orta boyut",
      "confidence": 95
    },
    {
      "name": "bina",
      "location": "arka planda",
      "details": "yüksek, modern mimari",
      "confidence": 88
    }
  ],
  "total_objects": 2,
  "model": "llava:34b"
}
```

## 🐛 Sorun Giderme

### GPU Hatası (imggen için)
```bash
# NVIDIA Docker çalışıyor mu kontrol et
docker run --rm --gpus all nvidia/cuda:12.1.1-base-ubuntu22.04 nvidia-smi
```

### Ollama Bağlantı Hatası
```bash
# Ollama host'ta çalışıyor mu kontrol et
curl http://127.0.0.1:11434/api/tags

# LLaVA-34B modeli var mı kontrol et
ollama list
```

### Port Çakışması
```bash
# Hangi portlar kullanılıyor kontrol et
netstat -tlnp | grep :800
```

## 📝 Notlar

- **detect servisi**: Artık LLaVA-34B kullanır, GPU'ya gerek yok
- **Çevre/Şehircilik**: Binalar, yollar, yeşil alanlar tespit edilebilir
- **Türkçe destek**: LLaVA Türkçe nesne tespiti yapabilir
- **Detaylı analiz**: Sadece tespit değil, konum ve detay bilgisi
- **Host network**: Detect ve VQA servisleri host network kullanır
