# 🃏 Bilgi Kartları Servisi

Bu servis, kullanıcının girdiği metinleri analiz ederek bilgi kartları üretir. Ollama LLM modeli ile akıllı içerik çıkarımı yapar.

## 🚀 Özellikler

- **Metin Analizi**: Verilen metni analiz eder
- **Bilgi Çıkarımı**: Metinden önemli bilgileri çıkarır
- **Kart Üretimi**: İstenen adet kadar bilgi kartı oluşturur
- **Dinamik İçerik**: Her kart benzersiz ve anlamlı içerik içerir
- **LLM Entegrasyonu**: Ollama Gemma3:27b modeli kullanır

## 🛠️ Teknik Detaylar

### API Endpoints

#### 1. Bilgi Kartları Üretimi
```http
POST /generate-cards
Content-Type: application/json

{
  "text": "Analiz edilecek metin buraya gelir...",
  "card_count": 5
}
```

**Response:**
```json
{
  "success": true,
  "cards": [
    {
      "id": 1,
      "content": "Sıfır atık nedir? Sıfır atık, kaynakların verimli kullanılması...",
      "type": "question_answer"
    },
    {
      "id": 2,
      "content": "Yapay Zeka: Makinelerin insan benzeri düşünme...",
      "type": "definition"
    }
  ],
  "metadata": {
    "total_cards": 5,
    "processing_time": 12.5,
    "text_length": 2500,
    "model": "gemma3:27b"
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
  "service": "info-cards",
  "ollama_status": "healthy",
  "model": "gemma3:27b"
}
```

## 📁 Dosya Yapısı

```
info-cards/
├── app.py              # Ana FastAPI uygulaması
├── requirements.txt    # Python bağımlılıkları
├── Dockerfile         # Container tanımı
└── README.md          # Bu dosya
```

## 🎯 Kullanım Örnekleri

### Temel Kart Üretimi
```bash
curl -X POST http://localhost:8008/generate-cards \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Sıfır atık projesi hakkında detaylı metin...",
    "card_count": 5
  }'
```

### Python ile Kullanım
```python
import requests

response = requests.post('http://localhost:8008/generate-cards', 
    json={
        'text': 'Yapay zeka teknolojileri hakkında metin...',
        'card_count': 3
    }
)

result = response.json()
for card in result['cards']:
    print(f"Kart {card['id']}: {card['content']}")
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
sudo docker compose build info-cards
sudo docker compose up info-cards -d
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

### Model Yükleme Hatası
```bash
# Ollama modelini kontrol et
ollama list

# Modeli indir
ollama pull gemma3:27b
```

## 📊 Performans

### İşlem Süreleri
- **Kart Üretimi**: ~10-20 saniye (LLM yanıt süresine bağlı)
- **Metin Analizi**: ~5-10 saniye

### Memory Kullanımı
- **Temel işlem**: ~100-200MB (Python ve FastAPI)
- **LLM kullanımı**: Ollama modelinin RAM ihtiyacına göre değişir (Gemma3:27b için ~20GB)

## 🔮 Gelecek Özellikler

- [ ] Farklı LLM modelleri için destek
- [ ] Kart export seçenekleri (PDF, CSV)
- [ ] Kart kategorileri ve filtreleme
- [ ] Web arayüzü ile kart görüntüleme

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin
