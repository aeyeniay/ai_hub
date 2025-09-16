FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

# Python kurulumu - Ubuntu 22.04 uyumlu paket isimleri
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Python 3'ü varsayılan yap
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 1
RUN update-alternatives --install /usr/bin/pip pip /usr/bin/pip3 1

WORKDIR /app

# Python paketlerini kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY app.py .

# Çıktı dizinini oluştur
RUN mkdir -p /app/outputs

# Port'u aç
EXPOSE 8000

# Uygulamayı başlat
CMD ["python", "app.py"]
