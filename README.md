# AI Hub Services

Bu proje, görsel üretim, nesne tespiti, metin işleme ve tablo analizi servislerini içeren kapsamlı bir AI hub'ıdır.

## 🚀 Servisler

### 🎨 Görsel Servisleri
- **imggen** (Port 8001): SDXL-Turbo ile görsel üretim (GPU hızlandırmalı, offline capable)
- **detect** (Port 8003): Gemma3:27b ile nesne tespiti (Ollama üzerinden)
- **vqa** (Port 8002): Qwen2.5VL:32b ile interaktif görselden soru-cevap (Ollama üzerinden)

### 📝 Metin Servisleri
- **pii-masking** (Port 8000): Gemma3:27b ile kişisel bilgi maskeleme (Ollama üzerinden)
- **quiz-generator** (Port 8006): Gemma3:27b ile interaktif quiz oluşturma ve oynama (Ollama üzerinden)
- **template-rewrite** (Port 8005): Word şablonları ile belge oluşturma - Gerekçe ve Belgenet formatları (Ollama üzerinden)
- **info-cards** (Port 8008): Gemma3:27b ile metin analizi ve bilgi kartları üretimi (Ollama üzerinden)

### 📊 Tablo İşlemleri
- **chart-generator** (Port 8009): JSON/CSV/Excel tablolardan otomatik grafik üretimi (Ollama üzerinden)
- **table-analyzer** (Port 8010): Tablolardan detaylı metin analizi ve stratejik öngörüler (Ollama üzerinden)

## 🖥️ Sistem Gereksinimleri

### Donanım
- **GPU**: NVIDIA GPU (CUDA 12.1+ destekli) - ImageGen servisi için
- **RAM**: En az 16GB (Ollama modelleri için)
- **Disk**: En az 50GB boş alan (modeller için)

### Yazılım
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **NVIDIA Container Toolkit**: GPU desteği için
- **Ollama**: 0.1.0+ (host sistemde)
- **CUDA**: 12.1+ (GPU için)

## ⚠️ Önemli Notlar

### Ollama Yönetimi
- **Kritik**: Ollama servisi bazen yeniden başlatılması gerekebilir
- Detect servisi timeout verirse: `sudo systemctl restart ollama`
- Ollama host'ta çalışmalı (127.0.0.1:11434)
- Container'lar `network_mode: "host"` kullanır

### GPU Kullanımı
- **imggen**: CUDA GPU hızlandırması kullanır (zorunlu)
- **detect**: Ollama üzerinden çalışır (GPU ile performans artışı)
- **vqa**: Ollama üzerinden çalışır (GPU ile performans artışı)
- **pii-masking**: Ollama üzerinden çalışır (GPU ile performans artışı)
- **quiz-generator**: Ollama üzerinden çalışır (GPU ile performans artışı)
- **template-rewrite**: Ollama üzerinden çalışır (GPU ile performans artışı)
- **info-cards**: Ollama üzerinden çalışır (GPU ile performans artışı)
- **chart-generator**: Ollama üzerinden çalışır (GPU ile performans artışı)
- **table-analyzer**: Ollama üzerinden çalışır (GPU ile performans artışı)

## 🛠️ Kurulum

### 1. Ollama Kurulumu (Host)
```bash
# Ollama'yı host'ta kur ve çalıştır
curl -fsSL https://ollama.ai/install.sh | sh
sudo systemctl enable ollama
sudo systemctl start ollama

# Gerekli modelleri indir
ollama pull gemma3:27b    # Detect servisi için
ollama pull qwen2.5vl:32b # VQA servisi için
```

### 2. NVIDIA Docker Kurulumu
```bash
# NVIDIA Container Toolkit kur
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

### 3. Proje Kurulumu
```bash
# Projeyi klonla
git clone https://github.com/aeyeniay/ai_hub.git
cd ai_hub

# Otomatik kurulum (önerilen)
chmod +x setup.sh
./setup.sh

# Manuel kurulum (alternatif)
cp .env.example .env
docker compose up -d
```

## 📁 Dizin Yapısı

```
ai_hub/
├── services/
│   ├── image/           # Görsel işleme servisleri
│   │   ├── imggen/      # Görsel üretim servisi (GPU gerekli)
│   │   ├── detect/      # Nesne tespiti servisi (Ollama üzerinden)
│   │   └── vqa/         # VQA servisi (Ollama üzerinden)
│   ├── text/            # Metin işleme servisleri
│   │   ├── pii-masking/ # Kişisel bilgi maskeleme
│   │   ├── quiz-generator/ # Quiz oluşturma ve oynama
│   │   ├── template-rewrite/ # Word şablonları ile belge oluşturma
│   │   └── info-cards/  # Bilgi kartları üretimi
│   └── table/           # Tablo işlemleri
│       ├── chart-generator/ # Grafik üretimi
│       └── table-analyzer/  # Tablo analizi
├── data/                # Merkezi veri yönetimi
│   ├── uploads/         # Yüklenen dosyalar
│   │   ├── images/      # Görsel dosyalar
│   │   ├── text/        # Metin dosyaları
│   │   └── table/       # Tablo dosyaları
│   └── outputs/         # Üretilen çıktılar
│       ├── images/      # Üretilen görseller
│       ├── text/        # Metin çıktıları
│       └── table/       # Grafik ve analiz çıktıları
├── models/              # Yerel model dosyaları
├── docker-compose.yml   # Servis konfigürasyonu
├── setup.sh            # Otomatik kurulum scripti
└── README.md            
```

## 🔧 API Kullanımı

### Görsel Üretim (imggen)
```bash
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a beautiful sunset over mountains"}'
```

### Nesne Tespiti (detect)
```bash
curl -X POST http://localhost:8003/detect \
  -F "image=@data/uploads/images/deneme2.jpg" \
  -F "confidence=0.3" \
  -F "max_objects=15"
```

**Çıktı örneği:**
```json
{
  "status": "success",
  "model": "gemma3:27b",
  "total_objects": 10,
  "objects": [
    {
      "name": "araba",
      "confidence": 95,
      "location": "Merkez",
      "description": "Açık bagajıyla çimenlik bir tepede park edilmiş gümüş renkli bir SUV."
    },
    {
      "name": "erkek",
      "confidence": 90,
      "location": "Sol-Merkez",
      "description": "Açık araba bagajının kenarında oturan, ceket ve bot giyen bir adam."
    }
  ]
}
```

### PII Maskeleme (pii-masking)
```bash
curl -X POST http://localhost:8000/mask \
  -H "Content-Type: application/json" \
  -d '{"text": "Ahmet Yılmaz 12345678901 numaralı TCKN ile İstanbulda yaşıyor. E-posta: ahmet@example.com"}'
```

### Quiz Oluşturma (quiz-generator)
```bash
curl -X POST http://localhost:8006/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Sıfır atık projesi çevre koruma için önemlidir.", "num_questions": 3}'
```

### Bilgi Kartları (info-cards)
```bash
curl -X POST http://localhost:8008/generate-cards \
  -H "Content-Type: application/json" \
  -d '{"text": "Yapay zeka teknolojisi hakkında bilgi", "num_cards": 5}'
```

### Grafik Üretimi (chart-generator)
```bash
curl -X POST http://localhost:8009/generate-charts \
  -H "Content-Type: application/json" \
  -d @test_chart_generator.json
```

### Tablo Analizi (table-analyzer)
```bash
curl -X POST http://localhost:8010/analyze-table \
  -H "Content-Type: application/json" \
  -d @test_table_analyzer.json
```

### Interaktif Görselden Soru-Cevap (vqa)
```bash
# 1. Görsel yükle ve session oluştur
curl -X POST http://localhost:8002/upload \
  -F "image=@data/uploads/images/deneme2.jpg"

# 2. Session ID ile soru sor
curl -X POST http://localhost:8002/ask \
  -F "question=Bu görselde ne görüyorsun?" \
  -F "session_id=YOUR_SESSION_ID"

# 3. Session durumunu kontrol et
curl "http://localhost:8002/status?session_id=YOUR_SESSION_ID"

# 4. Konuşma geçmişini gör
curl "http://localhost:8002/history?session_id=YOUR_SESSION_ID"

# 5. Session'ı temizle
curl -X POST http://localhost:8002/clear \
  -F "session_id=YOUR_SESSION_ID"
```

**Özellikler:**
- ✅ **Hybrid Yaklaşım**: Görsel bir kez yüklenir, peş peşe sorular sorulabilir
- ✅ **Session Yönetimi**: Dosya tabanlı session sistemi
- ✅ **Konuşma Geçmişi**: Tüm soru-cevaplar saklanır
- ✅ **Qwen2.5VL:32b**: Gelişmiş görsel anlama modeli

## 🔄 Sistem Akış Diyagramları

### 📝 Görsel Servisleri Sistem Akışı

```mermaid
graph TB
    A[Kullanıcı] --> B[API İstekleri]
    
    B --> C[ImageGen Servisi<br/>Port 8001]
    B --> D[Detect Servisi<br/>Port 8003]
    B --> E[VQA Servisi<br/>Port 8002]
    
    C --> F[SDXL-Turbo Model<br/>CUDA GPU]
    F --> G[Görsel Üretimi<br/>data/outputs/images/]
    
    D --> H[Ollama API<br/>127.0.0.1:11434]
    E --> H
    
    H --> I[Gemma3:27b Model<br/>Nesne Tespiti]
    H --> J[Qwen2.5VL:32b Model<br/>Interaktif Görsel Soru-Cevap]
    
    I --> K[Türkçe Nesne Analizi<br/>JSON Response Only]
    J --> L[Session Tabanlı Soru-Cevap<br/>Hybrid Yaklaşım]
    
    G --> M[Kullanıcıya Dönen Sonuç]
    K --> M
    L --> M
    
    style C fill:#e1f5fe
    style D fill:#f3e5f5
    style E fill:#e8f5e8
    style F fill:#fff3e0
    style H fill:#fce4ec
    style K fill:#f8f9fa
    style L fill:#f8f9fa
```

### 📝 Metin Servisleri Sistem Akışı

```mermaid
graph TB
    A[Kullanıcı] --> B[API İstekleri]
    
    B --> C[PII-Masking Servisi<br/>Port 8000]
    B --> D[Quiz-Generator Servisi<br/>Port 8006]
    B --> E[Template-Rewrite Servisi<br/>Port 8005]
    B --> F[Info-Cards Servisi<br/>Port 8008]
    
    C --> G[Ollama API<br/>127.0.0.1:11434]
    D --> G
    F --> G
    
    G --> H[Gemma3:27b Model<br/>Kişisel Bilgi Maskeleme]
    G --> I[Gemma3:27b Model<br/>Quiz Oluşturma ve Oynama]
    G --> J[Gemma3:27b Model<br/>Bilgi Kartları Üretimi]
    
    H --> K[Türkçe PII Tespit ve Maskeleme<br/>JSON Response]
    I --> L[Interaktif Quiz Sistemi<br/>Session Tabanlı Oyun]
    J --> M[Tanım ve Soru-Cevap Kartları<br/>JSON Response]
    
    E --> N[Word Şablonlama<br/>Gerekçe ve Belgenet Formatları]
    
    K --> O[Kullanıcıya Dönen Sonuç]
    L --> O
    M --> O
    N --> O
    
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#f3e5f5
    style F fill:#e1f5fe
    style G fill:#fce4ec
    style H fill:#f8f9fa
    style I fill:#f8f9fa
    style J fill:#f8f9fa
    style K fill:#f8f9fa
    style L fill:#f8f9fa
    style M fill:#f8f9fa
    style N fill:#f8f9fa
    style O fill:#f8f9fa
```

### 📊 Tablo İşlemleri Sistem Akışı

```mermaid
graph TB
    A[Kullanıcı] --> B[API İstekleri]
    
    B --> C[Chart-Generator Servisi<br/>Port 8009]
    B --> D[Table-Analyzer Servisi<br/>Port 8010]
    
    C --> E[Ollama API<br/>127.0.0.1:11434]
    D --> E
    
    E --> F[Gemma3:27b Model<br/>Grafik Önerileri]
    E --> G[Gemma3:27b Model<br/>Detaylı Tablo Analizi]
    
    F --> H[Plotly Grafik Üretimi<br/>Bar, Line, Pie, Scatter, Heatmap]
    G --> I[Akademik Stilinde<br/>Kapsamlı Metin Analizi]
    
    H --> J[PNG/SVG Grafik Dosyaları<br/>Çoklu Seri Karşılaştırmalar]
    I --> K[Stratejik Öngörüler<br/>İstatistiksel Analiz ve Risk Değerlendirmesi]
    
    J --> L[Kullanıcıya Dönen Sonuç]
    K --> L
    
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f8f9fa
    style G fill:#f8f9fa
    style H fill:#f3e5f5
    style I fill:#e1f5fe
    style J fill:#f8f9fa
    style K fill:#f8f9fa
    style L fill:#f8f9fa
```

## 🐛 Sorun Giderme

### Ollama Timeout Hatası
```bash
# Ollama servisini yeniden başlat
sudo systemctl restart ollama

# Servis durumunu kontrol et
sudo systemctl status ollama

# Modellerin yüklü olduğunu kontrol et
ollama list
```

### GPU Hatası (imggen için)
```bash
# NVIDIA Docker çalışıyor mu kontrol et
docker run --rm --gpus all nvidia/cuda:12.1.1-base-ubuntu22.04 nvidia-smi

# GPU kullanımını kontrol et
nvidia-smi
```

### Port Çakışması
```bash
# Hangi portlar kullanılıyor kontrol et
netstat -tlnp | grep :800

# Container'ları kontrol et
docker ps
```

### Servis Sağlık Kontrolü
```bash
# Tüm servislerin sağlığını kontrol et
curl http://localhost:8001/health  # ImageGen
curl http://localhost:8002/health  # VQA
curl http://localhost:8003/health  # Detect
curl http://localhost:8000/health  # PII Masking
curl http://localhost:8006/health  # Quiz Generator
```

## 📝 Özellikler

- **Türkçe Destek**: Detect, PII-Masking ve Quiz servisleri Türkçe doğal dil işleme yapar
- **GPU Hızlandırma**: ImageGen servisi CUDA GPU kullanır
- **Offline Capability**: ImageGen servisi internet olmadan çalışabilir
- **Modüler Yapı**: Her servis bağımsız olarak çalışabilir
- **Docker Tabanlı**: Kolay kurulum ve dağıtım
- **RESTful API**: Standart HTTP API'ler
- **Merkezi Dosya Yönetimi**: Tüm dosyalar `data/` klasöründe organize edilir
- **Session Yönetimi**: VQA ve Quiz servisleri session tabanlı çalışır
- **Interaktif Oyunlar**: Quiz servisi gerçek zamanlı soru-cevap oyunu sağlar
- **PII Koruma**: Otomatik kişisel bilgi tespit ve maskeleme
- **Word Şablon Desteği**: Mevcut Word dosyalarını şablon olarak kullanma
- **Dinamik Belge Üretimi**: LLM ile akıllı belge oluşturma (Gerekçe ve Belgenet formatları)
- **Çoklu Format Desteği**: Gerekçe belgeleri (imzalı) ve Belgenet evrakları (imzasız)
- **Bilgi Kartları Üretimi**: Metin analizi ile öğretici bilgi kartları oluşturma

## 🔧 Geliştirme

### Yeni Servis Ekleme
1. `services/image/` veya `services/text/` altında yeni klasör oluştur
2. `Dockerfile` ve `app.py` ekle
3. `docker-compose.yml`'e servis ekle
4. Gerekli portları ayarla
5. `data/uploads/` ve `data/outputs/` altında gerekli klasörleri oluştur

### Log Kontrolü
```bash
# Tüm servislerin loglarını gör
docker-compose logs -f

# Belirli servisin loglarını gör
docker-compose logs -f imggen
docker-compose logs -f detect
docker-compose logs -f vqa
```

## 📊 Performans

- **ImageGen**: ~2-5 saniye (GPU'ya bağlı) - Görsel üretir ve kaydeder
- **Detect**: ~3-8 saniye (Ollama'ya bağlı) - Sadece analiz yapar, dosya kaydetmez
- **VQA**: ~5-15 saniye (Ollama'ya bağlı) - Session tabanlı interaktif soru-cevap

## 🧪 Test Sonuçları

### VQA Servisi (Qwen2.5VL:32b) Test Edildi

**✅ Başarılı Testler:**
- **Aile Fotoğrafı**: 3 kişi, köpek, otomobil detaylarını doğru tespit etti
- **Orman Yangını**: Yangın etkilerini, çevre zararlarını ve çözüm önerilerini analiz etti
- **Müsilaj**: Su kirliliğini tespit etti (spesifik müsilaj tanımı yapamadı)

**🔍 Model Güçlü Yanları:**
- Türkçe cevap verme
- Detaylı görsel analiz
- Çevre sorunlarını tanıma
- Ekosistem etkilerini anlama
- Çözüm önerileri sunma

**⚠️ Model Sınırları:**
- Spesifik çevre sorunlarını (müsilaj gibi) doğrudan tanımlayamama
- Bazı karakterlerde encoding sorunu
- Bazen çok uzun cevaplar

**📈 Genel Değerlendirme:**
Qwen2.5VL:32b modeli genel görsel anlama ve çevre analizi konularında çok başarılı. Interaktif VQA sistemi mükemmel çalışıyor.

### Quiz Generator Servisi (Gemma3:27b) Test Edildi

**✅ Başarılı Testler:**
- **Türkiye Cumhuriyeti Metni**: 3 soruluk quiz başarıyla oluşturuldu
- **Sıfır Atık Metni**: 5 soruluk quiz başarıyla oluşturuldu
- **İnteraktif Oyun**: Soru-cevap döngüsü mükemmel çalışıyor
- **Session Yönetimi**: Quiz ilerlemesi kalıcı olarak saklanıyor

**🎯 Quiz Özellikleri:**
- 4 şıklı çoktan seçmeli sorular
- Türkçe soru ve açıklamalar
- Otomatik doğru/yanlış kontrolü
- Skor takibi ve ilerleme
- Sonraki soru otomatik gösterimi

**📊 API Endpoints:**
- `POST /generate`: Quiz oluşturma
- `POST /answer`: Cevap verme + feedback
- `GET /quiz/{id}`: Quiz durumu kontrolü

**⚙️ Teknik Özellikler:**
- **Model**: Gemma3:27b via Ollama
- **Session**: JSON dosya tabanlı
- **Port**: 8006 (host network)
- **Response Time**: ~15-30 saniye quiz üretimi

**🎮 Örnek Kullanım:**
```bash
# Quiz oluştur
curl -X POST http://localhost:8006/generate \
  -H "Content-Type: application/json" \
  -d '{"text":"Metniniz...", "num_questions":5}'

# Cevap ver
curl -X POST http://localhost:8006/answer \
  -H "Content-Type: application/json" \
  -d '{"quiz_id":"quiz-id", "question_index":0, "user_answer":"A) Seçenek"}'
```

### PII Masking Servisi (Gemma3:27b) Test Edildi

**✅ Başarılı Testler:**
- **Kişisel Bilgi Tespiti**: TCKN, e-posta, adres, isim tespiti başarılı
- **Maskeleme İşlemi**: Tespit edilen bilgiler doğru şekilde maskelendi
- **Türkçe Destek**: Türkçe metinlerde mükemmel performans

**📊 Performans Metrikleri:**
- **Response Time**: ~3-5 saniye
- **Accuracy**: %95+ (yaygın PII türleri için)
- **Supported Entities**: PERSON, EMAIL, ID_NUMBER, ADDRESS, PHONE

**🎯 Tespit Edilen PII Türleri:**
- İsim ve soyisim
- TC Kimlik Numarası
- E-posta adresleri
- Telefon numaraları
- Adres bilgileri
- IBAN numaraları

### Info Cards Servisi (Gemma3:27b) Test Edildi

**✅ Başarılı Testler:**
- **Bilgi Kartı Üretimi**: 3-5 kart başarıyla oluşturuldu
- **Kart Türleri**: Tanım ve soru-cevap kartları
- **Türkçe İçerik**: Tamamen Türkçe çıktı

**📊 Performans Metrikleri:**
- **Response Time**: ~10-15 saniye
- **Card Quality**: Yüksek kaliteli, öğretici içerik
- **Processing Time**: 11.41 saniye (5 kart için)

### Chart Generator Servisi (Gemma3:27b) Test Edildi

**✅ Başarılı Testler:**
- **JSON Input**: 4 grafik başarıyla üretildi
- **CSV Upload**: Dosya yükleme ve grafik üretimi çalışıyor
- **Grafik Türleri**: Bar, Line, Pie, Scatter, Heatmap, Histogram

**📊 Performans Metrikleri:**
- **Response Time**: ~12-15 saniye
- **Chart Quality**: Yüksek kaliteli, profesyonel grafikler
- **Multi-Series Support**: Karşılaştırma grafikleri için çoklu seri desteği

**🎯 Grafik Özellikleri:**
- Otomatik grafik türü önerisi
- Çoklu veri serisi desteği
- PNG/SVG çıktı formatları
- Renkli ve açıklayıcı grafikler

### Table Analyzer Servisi (Gemma3:27b) Test Edildi

**✅ Başarılı Testler:**
- **JSON Analysis**: Kapsamlı analiz raporu üretildi
- **CSV Analysis**: Dosya yükleme ve analiz çalışıyor
- **Titanik Dataset**: 418 satırlık veri seti başarıyla analiz edildi

**📊 Performans Metrikleri:**
- **Response Time**: ~45-50 saniye (büyük veri setleri için)
- **Analysis Depth**: 12 farklı analiz kategorisi
- **Language Support**: Türkçe ve İngilizce

**🎯 Analiz Kategorileri:**
- İstatistiksel analiz
- Trend analizi
- Karşılaştırmalı analiz
- Korelasyon analizi
- Anomali tespiti
- İş etkileri
- Stratejik öneriler
- Risk değerlendirmesi
- Gelecek projeksiyonu

### Template Rewrite Servisi (Gemma3:27b) Test Edildi

**✅ Başarılı Testler:**
- **Gerekçe Belgesi**: Word formatında başarıyla oluşturuldu
- **Belgenet Belgesi**: Resmi yazı formatında üretildi
- **Dinamik İçerik**: Başlık ve içerik otomatik oluşturuldu
- **İmza Blokları**: Değişken sayıda imzacı desteği

**📊 Performans Metrikleri:**
- **Response Time**: ~20-30 saniye
- **Document Quality**: Profesyonel Word belgeleri
- **Template Support**: Gerekçe ve Belgenet formatları

**🎯 Belge Özellikleri:**
- Dinamik başlık oluşturma
- Merkezi imza hizalama
- Kısa dosya adları
- Word (.docx) çıktı formatı
- Türkçe içerik desteği

## 🤝 Katkıda Bulunma

1. Fork yap
2. Feature branch oluştur
3. Değişikliklerini commit et
4. Pull request gönder

## 🚀 Gelecek Planları

### Text Servisleri (Yakında)
- **Summarizer**: Metin özetleme servisi
- **Translator**: Çok dilli çeviri servisi  
- **Sentiment**: Duygu analizi servisi
- **NER**: Adlandırılmış varlık tanıma servisi

### Sistem Akış Diyagramı (Text Servisleri)
Text servisleri eklendikten sonra ayrı bir diyagram oluşturulacak.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.