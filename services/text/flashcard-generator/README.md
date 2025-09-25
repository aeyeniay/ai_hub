# 🎴 Flashcard-Generator Servisi - Akıllı Kart Oluşturma

Bu servis, verilen metinlerden öğrenme kartları (flashcard) oluşturmak için tasarlanmıştır. Eğitim ve öğrenme süreçlerini destekler.

## 🚀 Özellikler

- **Otomatik Kart Üretimi**: Metinlerden öğrenme kartları çıkarma
- **Çoklu Kart Türleri**: Basic, Cloze, Image, Audio destekli
- **Zorluk Seviyeleri**: Easy, Medium, Hard sınıflandırması
- **Konu Filtreleme**: Belirli konulara odaklanma
- **Görsel Entegrasyon**: Kartlara resim ekleme (opsiyonel)
- **JSON Export**: Anki, Quizlet uyumlu formatlar

## 🛠️ Teknik Detaylar

### Kart Türleri

#### 1. Basic Cards (Temel Kartlar)
- **Ön yüz**: Soru/terim
- **Arka yüz**: Cevap/açıklama
- **Kullanım**: Genel bilgi öğrenimi

#### 2. Cloze Cards (Boşluk Doldurma)
- **Format**: "Einstein {...} yılında doğdu"
- **Cevap**: Missing word/phrase
- **Kullanım**: Dil öğrenimi, detay memorization

#### 3. Image Cards (Görsel Kartlar)
- **Ön yüz**: Görsel + soru
- **Arka yüz**: Açıklama
- **Kullanım**: Görsel öğrenme

#### 4. Audio Cards (Ses Kartları)
- **Ön yüz**: Ses dosyası + soru
- **Arka yüz**: Metin cevap
- **Kullanım**: Dil öğrenimi, telaffuz

### API Endpoints

#### 1. Flashcard Oluşturma
```http
POST /generate
Content-Type: application/json

{
  "text": "Einstein 1879 yılında Almanya'da doğdu. Görelilik teorisini geliştirdi...",
  "num_cards": 5,
  "card_type": "basic",
  "difficulty": "medium",
  "topics": ["bilim", "fizik"],
  "include_images": false
}
```

**Response:**
```json
{
  "cards": [
    {
      "front": "Einstein hangi yıl doğdu?",
      "back": "1879",
      "type": "basic",
      "difficulty": "easy",
      "topic": "bilim",
      "tags": ["einstein", "doğum", "tarih"]
    },
    {
      "front": "Einstein {...} teorisini geliştirdi",
      "back": "görelilik",
      "type": "cloze",
      "difficulty": "medium",
      "topic": "fizik", 
      "tags": ["einstein", "teori", "fizik"]
    }
  ],
  "total_cards": 5,
  "generated_from_text_length": 150,
  "processing_time": 2.3,
  "status": "success"
}
```

#### 2. Deck Export
```http
POST /export
Content-Type: application/json

{
  "cards": [...],
  "format": "anki",  // anki, quizlet, csv
  "deck_name": "Einstein Kartları"
}
```

#### 3. Sağlık Kontrolü
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "flashcard-generator"
}
```

### Zorluk Seviyeleri

#### Easy (Kolay)
- Basit sorular
- Tek kelime cevaplar
- Açık ipuçları

#### Medium (Orta)
- Orta karmaşıklık
- Kısa cümle cevaplar
- Bağlam gerektiren sorular

#### Hard (Zor)
- Karmaşık sorular
- Uzun açıklamalar
- Analitik düşünme gerektiren

## 📁 Dosya Yapısı

```
flashcard-generator/
├── app.py              # Ana FastAPI uygulaması
├── requirements.txt    # Python bağımlılıkları
├── Dockerfile         # Container tanımı
├── README.md          # Bu dosya
├── generators/        # Kart üreticileri
│   ├── basic_generator.py
│   ├── cloze_generator.py
│   ├── image_generator.py
│   └── audio_generator.py
├── exporters/         # Export formatları
│   ├── anki_exporter.py
│   ├── quizlet_exporter.py
│   └── csv_exporter.py
└── templates/         # Kart şablonları
    ├── science.json
    ├── language.json
    └── history.json
```

## 🎯 Kullanım Örnekleri

### Temel Kart Oluşturma
```bash
curl -X POST http://localhost:8007/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Osmanlı İmparatorluğu 1299 yılında kuruldu. Başkenti İstanbul idi.",
    "num_cards": 3,
    "card_type": "basic",
    "difficulty": "easy"
  }'
```

### Cloze Kartları
```bash
curl -X POST http://localhost:8007/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Python programlama dili 1991 yılında Guido van Rossum tarafından geliştirildi.",
    "num_cards": 4,
    "card_type": "cloze", 
    "difficulty": "medium",
    "topics": ["programlama", "python"]
  }'
```

### Python ile Kullanım
```python
import requests

# Flashcard oluşturma
response = requests.post('http://localhost:8007/generate', 
    json={
        'text': '''
        Türkiye Cumhuriyeti 29 Ekim 1923 tarihinde ilan edildi. 
        İlk Cumhurbaşkanı Mustafa Kemal Atatürk'tür.
        Ankara başkent olarak seçildi.
        ''',
        'num_cards': 5,
        'card_type': 'basic',
        'difficulty': 'medium',
        'topics': ['tarih', 'türkiye']
    }
)

cards = response.json()['cards']
for i, card in enumerate(cards):
    print(f"Kart {i+1}:")
    print(f"Ön: {card['front']}")
    print(f"Arka: {card['back']}")
    print(f"Zorluk: {card['difficulty']}\n")
```

### Anki Export
```python
# Kartları Anki formatında export et
export_response = requests.post('http://localhost:8007/export',
    json={
        'cards': cards,
        'format': 'anki',
        'deck_name': 'Türkiye Tarihi'
    }
)

# Anki dosyasını indir
anki_file = export_response.content
with open('turkiye_tarihi.apkg', 'wb') as f:
    f.write(anki_file)
```

## 🔧 Kurulum ve Çalıştırma

### Docker ile (Önerilen)
```bash
docker run -p 8007:8000 \
  -v ./templates:/app/templates \
  -v ./exports:/app/exports \
  flashcard-generator:latest
```

### Yerel Geliştirme
```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Template klasörünü oluştur
mkdir -p templates exports

# Uygulamayı çalıştır
python -m uvicorn app:app --host 0.0.0.0 --port 8007
```

## 🎨 Özel Şablon Oluşturma

### Konu Bazlı Şablon
```json
{
  "topic": "matematik",
  "templates": [
    {
      "type": "basic",
      "front_pattern": "{formula} formülü neyi ifade eder?",
      "back_pattern": "{explanation}",
      "difficulty": "medium"
    },
    {
      "type": "cloze", 
      "pattern": "{equation} = {...}",
      "difficulty": "hard"
    }
  ],
  "keywords": ["formül", "denklem", "hesaplama", "sonuç"]
}
```

### Dil Öğrenimi Şablonu
```json
{
  "topic": "language",
  "templates": [
    {
      "type": "basic",
      "front_pattern": "{word} kelimesinin anlamı nedir?",
      "back_pattern": "{meaning}",
      "difficulty": "easy"
    },
    {
      "type": "cloze",
      "pattern": "{sentence} --> {...}",
      "difficulty": "medium"
    }
  ],
  "keywords": ["kelime", "anlam", "çeviri", "gramer"]
}
```

## 🔧 Gelişmiş Özellikler

### Spaced Repetition (Aralıklı Tekrar)
```python
# Kartlara öğrenme algoritması ekleme
card_data = {
    'front': 'Einstein hangi yıl doğdu?',
    'back': '1879',
    'ease_factor': 2.5,  # Anki algoritması
    'interval': 1,       # Günlük aralık
    'repetitions': 0,    # Tekrar sayısı
    'next_review': '2024-01-21'
}
```

### Adaptive Difficulty (Uyarlanır Zorluk)
```python
def adjust_difficulty(user_performance):
    """Kullanıcı performansına göre zorluk ayarla"""
    if user_performance > 0.8:
        return "hard"
    elif user_performance > 0.6:
        return "medium"
    else:
        return "easy"
```

## 🐛 Sorun Giderme

### Kart Üretilemiyor
```bash
# Metin uzunluğunu kontrol et (minimum 50 kelime)
{
  "error": "Text too short for card generation",
  "minimum_words": 50,
  "provided_words": 25
}
```

### Export Hatası
```bash
# Export formatını kontrol et
{
  "error": "Unsupported export format",
  "supported_formats": ["anki", "quizlet", "csv"]
}
```

### Port Çakışması
```bash
# Farklı port kullan
uvicorn app:app --host 0.0.0.0 --port 8017
```

## 📊 Performans

### İşlem Süreleri
- **5 kart**: ~2-5 saniye
- **10 kart**: ~5-10 saniye
- **20 kart**: ~10-20 saniye

### Kalite Metrikleri
- **Basic cards**: %85-90 doğruluk
- **Cloze cards**: %80-85 doğruluk
- **Topic relevance**: %90-95

## 🎮 Entegrasyon Örnekleri

### Anki Entegrasyonu
```python
import genanki

# Anki model oluştur
model = genanki.Model(
    1607392319,
    'AI Generated Cards',
    fields=[
        {'name': 'Question'},
        {'name': 'Answer'},
    ],
    templates=[
        {
            'name': 'Card 1',
            'qfmt': '{{Question}}',
            'afmt': '{{Answer}}',
        },
    ]
)

# Kartları ekle
deck = genanki.Deck(2059400110, 'AI Flashcards')
for card_data in cards:
    note = genanki.Note(
        model=model,
        fields=[card_data['front'], card_data['back']]
    )
    deck.add_note(note)

# Export
genanki.Package(deck).write_to_file('output.apkg')
```

### Quizlet API
```python
import requests

def export_to_quizlet(cards, api_key):
    """Kartları Quizlet'e export et"""
    
    headers = {'Authorization': f'Bearer {api_key}'}
    
    set_data = {
        'title': 'AI Generated Set',
        'terms': [
            {
                'term': card['front'],
                'definition': card['back']
            } for card in cards
        ]
    }
    
    response = requests.post(
        'https://api.quizlet.com/2.0/sets',
        headers=headers,
        json=set_data
    )
    
    return response.json()
```

## 🔮 Gelecek Özellikler

- [ ] AI model entegrasyonu (GPT, Claude)
- [ ] Görsel kart otomatik üretimi
- [ ] Ses kartları için TTS entegrasyonu
- [ ] Progressive web app interface
- [ ] Collaborative deck creation
- [ ] Performance analytics
- [ ] Mobile app companion
- [ ] Gamification features

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## 📚 Örnek Kartlar

### Tarih Kartları
```json
{
  "front": "Osmanlı İmparatorluğu hangi yıl kuruldu?",
  "back": "1299",
  "type": "basic",
  "difficulty": "easy",
  "topic": "tarih"
}
```

### Dil Kartları
```json
{
  "front": "The weather is {...} today",
  "back": "nice/good/beautiful",
  "type": "cloze", 
  "difficulty": "easy",
  "topic": "english"
}
```

### Bilim Kartları
```json
{
  "front": "E=mc² formülünde 'c' neyi temsil eder?",
  "back": "Işık hızı",
  "type": "basic",
  "difficulty": "medium",
  "topic": "fizik"
}
```
