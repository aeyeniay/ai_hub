#!/bin/bash

echo "🚀 AI Hub Kurulum Scripti"
echo "=========================="
echo ""

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Bu script AI Hub servislerini konfigüre edecek.${NC}"
echo ""

# .env dosyası var mı kontrol et
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env dosyası zaten mevcut. Yedekleyelim mi? (y/N)${NC}"
    read -r backup
    if [[ $backup =~ ^[Yy]$ ]]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo -e "${GREEN}✅ .env dosyası yedeklendi${NC}"
    fi
fi

# .env dosyasını oluştur
echo -e "${BLUE}🔧 Konfigürasyon ayarları:${NC}"
echo ""

# Ollama URL'i sor
echo -e "${YELLOW}Ollama servisinizin URL'ini girin:${NC}"
echo "Örnek: http://127.0.0.1:11434, http://192.168.1.100:11434"
read -p "Ollama URL (default: http://127.0.0.1:11434): " OLLAMA_URL
OLLAMA_URL=${OLLAMA_URL:-http://127.0.0.1:11434}

# GPU var mı sor
echo ""
echo -e "${YELLOW}GPU kullanacak mısınız? (cuda/cpu)${NC}"
read -p "Device (default: cuda): " DEVICE
DEVICE=${DEVICE:-cuda}

# Model isimlerini sor
echo ""
echo -e "${YELLOW}Varsayılan model isimlerini değiştirmek ister misiniz? (y/N)${NC}"
read -r change_models

if [[ $change_models =~ ^[Yy]$ ]]; then
    read -p "Gemma Model (default: gemma3:27b): " GEMMA_MODEL
    GEMMA_MODEL=${GEMMA_MODEL:-gemma3:27b}
    
    read -p "Qwen VL Model (default: qwen2.5vl:32b): " QWEN_VL_MODEL
    QWEN_VL_MODEL=${QWEN_VL_MODEL:-qwen2.5vl:32b}
    
    read -p "Image Generation Model (default: stabilityai/sdxl-turbo): " IMGGEN_MODEL
    IMGGEN_MODEL=${IMGGEN_MODEL:-stabilityai/sdxl-turbo}
else
    GEMMA_MODEL="gemma3:27b"
    QWEN_VL_MODEL="qwen2.5vl:32b"
    IMGGEN_MODEL="stabilityai/sdxl-turbo"
fi

# .env dosyasını oluştur
cat > .env << ENVEOF
# AI Hub Configuration - $(date)
# Ollama ayarları
OLLAMA_BASE_URL=$OLLAMA_URL
OLLAMA_PORT=11434

# Model isimleri
GEMMA_MODEL=$GEMMA_MODEL
QWEN_VL_MODEL=$QWEN_VL_MODEL
IMGGEN_MODEL=$IMGGEN_MODEL

# Servis portları
VQA_PORT=8002
DETECT_PORT=8003
PII_MASKING_PORT=8000
IMGGEN_PORT=8001
TEMPLATE_REWRITE_PORT=8005
QUIZ_GENERATOR_PORT=8006
FLASHCARD_GENERATOR_PORT=8007

# GPU/Device ayarları
DEVICE=$DEVICE

# Güvenlik ayarları
CONFIDENCE_THRESHOLD=0.5
ENVEOF

echo ""
echo -e "${GREEN}✅ .env dosyası oluşturuldu!${NC}"
echo ""

# Ollama kontrol et
echo -e "${BLUE}🔍 Ollama bağlantısı kontrol ediliyor...${NC}"
if curl -s "$OLLAMA_URL/api/tags" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ollama bağlantısı başarılı!${NC}"
    
    # Modelleri kontrol et
    echo -e "${BLUE}📋 Yüklü modeller kontrol ediliyor...${NC}"
    MODELS=$(curl -s "$OLLAMA_URL/api/tags" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    
    for model in "$GEMMA_MODEL" "$QWEN_VL_MODEL"; do
        if echo "$MODELS" | grep -q "^$model$"; then
            echo -e "${GREEN}✅ $model yüklü${NC}"
        else
            echo -e "${RED}❌ $model yüklü değil${NC}"
            echo -e "${YELLOW}   Yüklemek için: ollama pull $model${NC}"
        fi
    done
else
    echo -e "${RED}❌ Ollama'ya bağlanılamıyor ($OLLAMA_URL)${NC}"
    echo -e "${YELLOW}   Ollama çalıştırın: ollama serve${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Kurulum tamamlandı!${NC}"
echo ""
echo -e "${BLUE}📝 Sonraki adımlar:${NC}"
echo "1. Gerekli modelleri yükleyin (yukarıda belirtilen)"
echo "2. Servisleri başlatın: docker compose up -d"
echo "3. Servisleri test edin"
echo ""
echo -e "${BLUE}📊 Servis portları:${NC}"
echo "- PII Masking: http://localhost:8000"
echo "- Image Generation: http://localhost:8001"
echo "- VQA: http://localhost:8002"
echo "- Detect: http://localhost:8003"
echo "- Template Rewrite: http://localhost:8005"
echo "- Quiz Generator: http://localhost:8006"
echo "- Info Cards: http://localhost:8008"
echo "- Chart Generator: http://localhost:8009"
echo "- Table Analyzer: http://localhost:8010"
echo ""
