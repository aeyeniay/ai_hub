# 📝 Template-Rewrite Servisi - Gerekçe Belgesi Oluşturma

Bu servis, Word şablonlarını kullanarak dinamik gerekçe belgeleri oluşturmak için tasarlanmıştır. Ollama LLM modeli ile içerik üretimi yapar ve Word formatında çıktı verir.

## 🚀 Özellikler

- **Word Şablon Desteği**: Mevcut Word dosyalarını şablon olarak kullanma
- **Dinamik İçerik Üretimi**: Ollama LLM ile akıllı içerik oluşturma
- **Otomatik Başlık**: İçeriğe göre dinamik başlık üretimi
- **Dinamik İmza Yönetimi**: Değişken sayıda imzacı desteği
- **Merkezi Hizalama**: İmzaları otomatik ortalama
- **Word Çıktısı**: .docx formatında profesyonel belgeler
- **Şablon Öğrenme**: Mevcut belgelerden öğrenerek benzer yapıda içerik üretme

## 🛠️ Teknik Detaylar

### API Endpoints

#### 1. Gerekçe Belgesi Oluşturma
```http
POST /generate-gerekce
Content-Type: application/json

{
  "konu": "Sıfır Atık Projesi Uygulama Gerekçesi",
  "icerik_konusu": "Detaylı açıklama metni buraya gelir...",
        "imza_atacaklar": [
          {
            "isim": "Dr. Mehmet Öz",
            "unvan": "Genel Müdür"
          },
          {
            "isim": "Ayşe Yılmaz", 
            "unvan": "İnsan Kaynakları Müdürü"
          }
        ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Gerekçe belgesi başarıyla oluşturuldu",
  "file_path": "/app/outputs/Yapay_Zeka_Eğitimi_c6cfd66d.docx",
  "filename": "Yapay_Zeka_Eğitimi_c6cfd66d.docx"
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
  "model": "gemma3:27b",
  "ollama_connected": true,
  "templates_loaded": 3
}
```

### Şablon Yönetimi

#### Word Şablonları
Servis, `templates/gerekceler/` klasöründeki Word dosyalarını otomatik olarak yükler:

```
templates/gerekceler/
├── Yapay Zeka Danışmanlık Gerekce.docx
├── YAPAY ZEKA SUNUCUSUNUN SATIN ALIM GEREKCESI.docx
└── MUAYENE VE TESPİT TUTANAGI.docx
```

#### Şablon İşleme
1. **Word Dosyası Okuma**: `python-docx` ile metin çıkarımı
2. **Yapı Analizi**: Başlık, içerik ve imza bölümlerini tespit
3. **JSON Dönüşümü**: LLM için yapılandırılmış format
4. **Örnek Kullanımı**: LLM'e referans olarak gönderme

### İmza Yönetimi

#### Dinamik İmza Formatı
- **1 İmzacı**: Merkezi hizalama
- **2 İmzacı**: Yan yana, eşit aralık
- **3 İmzacı**: Üçlü düzen, merkezi
- **4+ İmzacı**: Çoklu satır düzeni

#### Hizalama Özellikleri
- İsim ve ünvan merkezi hizalama
- Sayfa genelinde merkezi konumlandırma
- Dinamik boşluk hesaplama
- Profesyonel görünüm

## 📁 Dosya Yapısı

```
template-rewrite/
├── app.py                    # Ana FastAPI uygulaması
├── requirements.txt          # Python bağımlılıkları
├── Dockerfile               # Container tanımı
├── README.md                # Bu dosya
├── templates/               # Şablon klasörü
│   └── gerekceler/         # Gerekçe şablonları
│       ├── *.docx          # Word şablon dosyaları
│       └── *.json          # JSON şablon dosyaları (opsiyonel)
└── test_template_rewrite.json  # Test verisi
```

## 🎯 Kullanım Örnekleri

### Temel Gerekçe Oluşturma
```bash
curl -X POST http://localhost:8005/generate-gerekce \
  -H "Content-Type: application/json" \
  -d '{
    "konu": "Yapay Zeka Eğitim Programı Gerekçesi",
    "icerik_konusu": "Personelin yapay zeka konularında eğitilmesi için gerekli gerekçe...",
    "imza_atacaklar": [
      {
        "isim": "Dr. Mehmet Öz",
        "unvan": "Genel Müdür"
      },
      {
        "isim": "Ayşe Yılmaz",
        "unvan": "İnsan Kaynakları Müdürü"
      }
    ]
  }'
```

### Python ile Kullanım
```python
import requests

# Gerekçe belgesi oluşturma
response = requests.post('http://localhost:8005/generate-gerekce', 
    json={
        'konu': 'Sıfır Atık Projesi Uygulama Gerekçesi',
        'icerik_konusu': 'Çevre koruma ve sürdürülebilirlik için...',
        'imza_atacaklar': [
            {
                'isim': 'Ali Veli',
                'unvan': 'Çevre Mühendisi'
            }
        ]
    }
)

result = response.json()
if result['success']:
    print(f"Belge oluşturuldu: {result['filename']}")
    print(f"Dosya yolu: {result['file_path']}")
```

### Toplu Belge Oluşturma
```python
gerekceler = [
    {
        'konu': 'Eğitim Programı Gerekçesi',
        'icerik_konusu': 'Personel eğitimi için...',
        'imza_atacaklar': [{'isim': 'Eğitim Müdürü', 'unvan': 'Müdür'}]
    },
    {
        'konu': 'Teknoloji Alımı Gerekçesi', 
        'icerik_konusu': 'Yeni sistem alımı için...',
        'imza_atacaklar': [{'isim': 'IT Müdürü', 'unvan': 'Müdür'}]
    }
]

for gerekce in gerekceler:
    response = requests.post('http://localhost:8005/generate-gerekce',
                           json=gerekce)
    result = response.json()
    print(f"Oluşturulan: {result['filename']}")
```

## 🔧 Kurulum ve Çalıştırma

### Docker ile (Önerilen)
```bash
# Servisi başlat
docker compose up template-rewrite -d

# Sağlık kontrolü
curl http://localhost:8005/health
```

### Yerel Geliştirme
```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Ollama servisinin çalıştığından emin ol
curl http://localhost:11434/api/tags

# Uygulamayı çalıştır
python app.py
```

### Şablon Ekleme
```bash
# Word dosyasını şablon klasörüne kopyala
cp yeni_gerekce.docx templates/gerekceler/

# Servisi yeniden başlat (otomatik yükleme)
docker compose restart template-rewrite
```

## 🎨 Özelleştirme

### Yeni Şablon Ekleme
1. Word dosyasını `templates/gerekceler/` klasörüne ekle
2. Servis otomatik olarak yükler
3. LLM bu şablonu referans alarak benzer içerik üretir

### İmza Formatını Değiştirme
`app.py` dosyasındaki `format_signatures` fonksiyonunu düzenle:

```python
def format_signatures(imza_atacaklar: List[ImzaKisi]) -> List[str]:
    """İmzaları formatla - özelleştirilebilir"""
    
    if len(imza_atacaklar) == 1:
        # Tek imzacı - merkezi
        return [
            f"{'':^50}",
            f"{imza_atacaklar[0].isim:^50}",
            f"{imza_atacaklar[0].unvan:^50}",
            f"{'':^50}"
        ]
    # Diğer formatlar...
```

### LLM Prompt Özelleştirme
`generate_gerekce_content` fonksiyonundaki prompt'u düzenle:

```python
prompt = f"""
Gerekçe belgesi oluştur:

Mevcut Konu: {konu}
İçerik Konusu: {icerik_konusu}

# Özel talimatlar buraya eklenebilir
- Resmi dil kullan
- Teknik detayları ekle
- Hukuki gerekçeleri belirt
"""
```

## 🐛 Sorun Giderme

### Ollama Bağlantı Hatası
```bash
# Ollama servisini kontrol et
curl http://localhost:11434/api/tags

# Docker network ayarlarını kontrol et
docker compose logs template-rewrite
```

### Word Dosyası Okuma Hatası
```bash
# Şablon dosyalarını kontrol et
ls -la templates/gerekceler/

# Dosya izinlerini kontrol et
chmod 644 templates/gerekceler/*.docx
```

### İmza Hizalama Sorunu
- İsim ve ünvan uzunluklarını kontrol et
- `format_signatures` fonksiyonunu düzenle
- Test ederek görsel kontrol yap

### Model Yükleme Hatası
```bash
# Ollama modelini kontrol et
ollama list

# Modeli indir
ollama pull gemma3:27b
```

## 📊 Performans

### İşlem Süreleri
- **Şablon yükleme**: ~0.1-0.5 saniye
- **LLM içerik üretimi**: ~5-15 saniye
- **Word belgesi oluşturma**: ~0.5-1 saniye
- **Toplam süre**: ~6-17 saniye

### Memory Kullanımı
- **Temel işlem**: ~200-300MB
- **Çoklu şablon**: ~300-500MB
- **LLM model**: ~8-16GB (Ollama)

## 🔮 Gelecek Özellikler

- [x] Word şablon desteği
- [x] Dinamik imza yönetimi
- [x] Otomatik başlık üretimi
- [ ] PDF çıktı desteği
- [ ] Çoklu dil desteği
- [ ] Şablon versiyonlama
- [ ] Batch işleme
- [ ] Template validation
- [ ] Görsel şablon editörü

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📚 Örnek Şablonlar

### Gerekçe Belgesi Yapısı
```
[BAŞLIK - Dinamik olarak üretilir]

[TARİH - Otomatik eklenir]

[İÇERİK - LLM tarafından üretilir]
- Giriş paragrafı
- Mevcut durum analizi  
- İhtiyaç ve gerekçe
- Beklenen faydalar
- Sonuç ve öneri

[İMZA ALANI - Dinamik format]
[İsim 1]          [İsim 2]          [İsim 3]
[Ünvan 1]         [Ünvan 2]         [Ünvan 3]
```

### Test Verisi
```json
{
  "konu": "Test Gerekçesi",
  "icerik_konusu": "Bu bir test gerekçesidir. Sistemin çalışıp çalışmadığını kontrol etmek için kullanılır.",
  "imza_atacaklar": [
    {
      "isim": "Test Kullanıcı",
      "unvan": "Test Müdürü"
    }
  ]
}
```