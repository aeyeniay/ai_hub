FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Python paketlerini kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY app.py .

# Upload dizinini oluştur
RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["python", "app.py"]
