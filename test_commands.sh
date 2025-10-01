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
echo "curl -X POST http://localhost:8005/generate-document \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d @test_template_rewrite.json"
echo ""
echo "4. Belgenet evrakı oluştur:"
echo "curl -X POST http://localhost:8005/generate-document \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d @test_belgenet.json"
echo ""
echo "5. Bilgi kartları oluştur:"
echo "curl -X POST http://localhost:8008/generate-cards \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d @test_info_cards.json"
echo ""

echo "6. Oluşturulan dosyayı indir:"
echo "curl http://localhost:8005/download/[filename]"
echo ""

echo "7. Servis logları:"
echo "sudo docker compose logs template-rewrite"
echo "sudo docker compose logs info-cards"
echo ""

echo "8. Servis durumu:"
echo "sudo docker compose ps template-rewrite"
echo "sudo docker compose ps info-cards"
