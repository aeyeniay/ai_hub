FROM python:3.11-slim

WORKDIR /app

# Sistem paketlerini güncelle ve gerekli paketleri yükle
RUN apt-get update && apt-get install -y \
    curl \
    libglib2.0-0 \
    libx11-6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Python bağımlılıklarını yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyalarını kopyala
COPY app.py .

# Çıktı klasörünü oluştur
RUN mkdir -p /app/outputs

# Port'u aç
EXPOSE 8009

# Uygulamayı çalıştır
CMD ["python", "app.py"]
