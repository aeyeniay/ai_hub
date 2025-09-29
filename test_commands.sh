#!/bin/bash

echo "🚀 Template-Rewrite Servisi Test Komutları"
echo "=========================================="

echo "1. Servis sağlık kontrolü:"
echo "curl http://localhost:8005/health"
echo ""

echo "2. Mevcut şablonları listele:"
echo "curl http://localhost:8005/templates"
echo ""

echo "3. Gerekçe belgesi oluştur:"
echo "curl -X POST http://localhost:8005/generate-gerekce \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d @test_template_rewrite.json"
echo ""

echo "4. Oluşturulan dosyayı indir:"
echo "curl http://localhost:8005/download/[filename]"
echo ""

echo "5. Servis logları:"
echo "sudo docker compose logs template-rewrite"
echo ""

echo "6. Servis durumu:"
echo "sudo docker compose ps template-rewrite"
