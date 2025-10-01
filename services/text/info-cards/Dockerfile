FROM python:3.11-slim

WORKDIR /app

# Sistem paketlerini güncelle
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python bağımlılıklarını yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyalarını kopyala
COPY app.py .

# Port'u aç
EXPOSE 8008

# Uygulamayı çalıştır
CMD ["python", "app.py"]
