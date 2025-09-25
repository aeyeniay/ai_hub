# 📝 Template-Rewrite Servisi - Metin Şablonlama ve Yeniden Yazma

Bu servis, metinleri önceden tanımlanmış şablonlara göre yeniden yazmak ve formatlamak için tasarlanmıştır.

## 🚀 Özellikler

- **Şablon Tabanlı Yazma**: Önceden tanımlanmış formatlar
- **Çoklu Stil Desteği**: Professional, casual, academic, creative
- **Değişken Yerleştirme**: Template içine dinamik veri ekleme
- **Otomatik Formatla**: Metni belirli kurallara göre düzenle
- **API Tabanlı**: RESTful API ile kolay entegrasyon
- **Genişletilebilir**: Yeni şablonlar kolayca eklenebilir

## 🛠️ Teknik Detaylar

### API Endpoints

#### 1. Metin Yeniden Yazma
```http
POST /rewrite
Content-Type: application/json

{
  "text": "Bu bir test metnidir. Yeniden yazılması gerekiyor.",
  "template": "formal_letter",
  "variables": {
    "recipient": "Sayın Müdür",
    "sender": "Ahmet Yılmaz",
    "date": "2024-01-20"
  },
  "style": "professional"
}
```

**Response:**
```json
{
  "original_text": "Bu bir test metnidir. Yeniden yazılması gerekiyor.",
  "rewritten_text": "Sayın Müdür,\n\nBu konuda görüşlerinizi almak üzere size yazıyorum. İlgili metni incelemenizi ve değerlendirmenizi rica ederim.\n\nSaygılarımla,\nAhmet Yılmaz\n2024-01-20",
  "template_used": "formal_letter",
  "status": "success"
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
  "service": "template-rewrite"
}
```

### Desteklenen Şablonlar

#### 1. Formal Letter (Resmi Mektup)
```json
{
  "template": "formal_letter",
  "variables": {
    "recipient": "Alıcı Adı",
    "sender": "Gönderici Adı", 
    "date": "Tarih",
    "subject": "Konu"
  }
}
```

#### 2. Email Template (E-posta Şablonu)
```json
{
  "template": "email",
  "variables": {
    "to": "alici@example.com",
    "from": "gonderici@example.com",
    "subject": "E-posta Konusu"
  }
}
```

#### 3. Report Template (Rapor Şablonu)
```json
{
  "template": "report",
  "variables": {
    "title": "Rapor Başlığı",
    "author": "Yazar Adı",
    "date": "Rapor Tarihi",
    "department": "Departman"
  }
}
```

#### 4. Blog Post (Blog Yazısı)
```json
{
  "template": "blog_post",
  "variables": {
    "title": "Yazı Başlığı",
    "author": "Yazar",
    "category": "Kategori",
    "tags": ["etiket1", "etiket2"]
  }
}
```

### Stil Seçenekleri

#### 1. Professional (Profesyonel)
- Resmi dil kullanımı
- Kibar ve saygılı ton
- İş dünyası terminolojisi

#### 2. Casual (Günlük)
- Samimi dil kullanımı
- Konuşma diline yakın
- Daha rahat ifadeler

#### 3. Academic (Akademik)
- Bilimsel terminoloji
- Nesnel ve analitik dil
- Referans kullanımı

#### 4. Creative (Yaratıcı)
- Sanatsal ifadeler
- Metaforlar ve benzetmeler
- Duygusal dil

## 📁 Dosya Yapısı

```
template-rewrite/
├── app.py              # Ana FastAPI uygulaması
├── requirements.txt    # Python bağımlılıkları
├── Dockerfile         # Container tanımı
├── README.md          # Bu dosya
├── templates/         # Şablon dosyaları
│   ├── formal_letter.txt
│   ├── email.txt
│   ├── report.txt
│   └── blog_post.txt
└── styles/            # Stil tanımları
    ├── professional.py
    ├── casual.py
    ├── academic.py
    └── creative.py
```

## 🎯 Kullanım Örnekleri

### Resmi Mektup Oluşturma
```bash
curl -X POST http://localhost:8005/rewrite \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Projenin durumu hakkında bilgi vermek istiyorum.",
    "template": "formal_letter",
    "variables": {
      "recipient": "Sayın Proje Müdürü",
      "sender": "Mehmet Öz",
      "date": "2024-01-20",
      "subject": "Proje Durum Raporu"
    },
    "style": "professional"
  }'
```

### E-posta Formatı
```bash
curl -X POST http://localhost:8005/rewrite \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Toplantı zamanını değiştirmemiz gerekiyor.",
    "template": "email",
    "variables": {
      "to": "team@company.com",
      "from": "manager@company.com", 
      "subject": "Toplantı Saati Değişikliği"
    },
    "style": "professional"
  }'
```

### Python ile Kullanım
```python
import requests

# Metin yeniden yazma
response = requests.post('http://localhost:8005/rewrite', 
    json={
        'text': 'Bu raporu hazırladım. İncelemenizi rica ederim.',
        'template': 'report',
        'variables': {
            'title': 'Aylık Satış Raporu',
            'author': 'Ayşe Yılmaz',
            'date': '2024-01-20',
            'department': 'Satış Departmanı'
        },
        'style': 'professional'
    }
)

result = response.json()
print(f"Orijinal: {result['original_text']}")
print(f"Yeniden yazılmış: {result['rewritten_text']}")
```

### Toplu Şablon İşleme
```python
templates = [
    {
        'text': 'Özgeçmişimi güncelledim.',
        'template': 'formal_letter',
        'style': 'professional'
    },
    {
        'text': 'Blog yazısı hazırladım.',
        'template': 'blog_post', 
        'style': 'creative'
    },
    {
        'text': 'Araştırma sonuçları hazır.',
        'template': 'report',
        'style': 'academic'
    }
]

for template_data in templates:
    response = requests.post('http://localhost:8005/rewrite',
                           json=template_data)
    result = response.json()
    print(f"Şablon: {result['template_used']}")
    print(f"Sonuç: {result['rewritten_text']}\n")
```

## 🔧 Kurulum ve Çalıştırma

### Docker ile (Önerilen)
```bash
docker run -p 8005:8000 \
  -v ./templates:/app/templates \
  -v ./styles:/app/styles \
  template-rewrite:latest
```

### Yerel Geliştirme
```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Şablon klasörlerini oluştur
mkdir -p templates styles

# Uygulamayı çalıştır
python -m uvicorn app:app --host 0.0.0.0 --port 8005
```

## 🎨 Özel Şablon Oluşturma

### Yeni Şablon Ekleme
```python
# templates/custom_template.txt
"""
{header}

Sayın {recipient},

{content}

{footer}

Saygılarımla,
{sender}
{date}
"""

# Şablonu kaydetme
def create_custom_template():
    template = {
        'name': 'custom_template',
        'variables': ['header', 'recipient', 'content', 'footer', 'sender', 'date'],
        'description': 'Özel kullanım için şablon'
    }
    return template
```

### Yeni Stil Tanımlama
```python
# styles/custom_style.py
def apply_custom_style(text):
    """Özel stil uygula"""
    
    # Büyük harfle başlat
    text = text.capitalize()
    
    # Kibar ifadeler ekle
    polite_phrases = [
        "Lütfen", "Rica ederim", "Teşekkür ederim",
        "Saygılarımla", "İyi günler"
    ]
    
    # Stil kuralları uygula
    styled_text = apply_style_rules(text, polite_phrases)
    
    return styled_text
```

## 🐛 Sorun Giderme

### Şablon Bulunamadı Hatası
```bash
# Şablon dosyasının var olduğunu kontrol et
ls -la templates/

# Şablon ismini kontrol et
curl http://localhost:8005/templates  # Mevcut şablonları listele
```

### Değişken Hatası
```bash
# Gerekli değişkenleri kontrol et
{
  "error": "Missing required variable: recipient",
  "required_variables": ["recipient", "sender", "date"]
}
```

### Port Çakışması
```bash
# Farklı port kullan
uvicorn app:app --host 0.0.0.0 --port 8015
```

## 📊 Performans

### İşlem Süreleri
- **Basit şablon**: ~0.1-0.5 saniye
- **Karmaşık şablon**: ~0.5-2 saniye
- **Çoklu değişken**: ~1-3 saniye

### Memory Kullanımı
- **Temel işlem**: ~50-100MB
- **Çoklu şablon**: ~100-200MB

## 🔮 Gelecek Özellikler

- [ ] AI destekli şablon üretimi
- [ ] Görsel şablon editörü
- [ ] Şablon versiyonlama
- [ ] Conditional template logic
- [ ] Multi-language template support
- [ ] Template validation
- [ ] Batch template processing
- [ ] Template marketplace

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## 📚 Örnek Şablonlar

### İş Mektubu
```
Tarih: {date}

Sayın {recipient},

Konu: {subject}

{content}

Bu konudaki görüşlerinizi almak üzere size yazıyorum.

Saygılarımla,
{sender}
{title}
{company}
```

### Proje Raporu
```
PROJE RAPORU

Proje Adı: {project_name}
Hazırlayan: {author}
Tarih: {date}
Departman: {department}

1. ÖZET
{summary}

2. DETAYLAR
{content}

3. SONUÇ VE ÖNERİLER
{conclusion}

Raporu Hazırlayan: {author}
```
