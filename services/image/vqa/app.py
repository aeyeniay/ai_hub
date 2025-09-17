from flask import Flask, request, jsonify, session
import requests
import os
import base64
from PIL import Image
import io
import uuid

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Session için gerekli

# Ollama konfigürasyonu
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "llava:34b")

# Session'da resim saklama
def get_session_image():
    """Session'dan resmi al"""
    return session.get('current_image')

def set_session_image(image_base64):
    """Session'a resmi kaydet"""
    session['current_image'] = image_base64

@app.route('/health', methods=['GET'])
def health():
    try:
        # Ollama servisinin çalışıp çalışmadığını kontrol et
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags")
        if response.status_code == 200:
            return jsonify({
                "status": "healthy", 
                "ollama": "connected",
                "model": MODEL_NAME
            })
        else:
            return jsonify({
                "status": "unhealthy", 
                "ollama": "disconnected",
                "model": MODEL_NAME
            }), 503
    except Exception as e:
        return jsonify({
            "status": "unhealthy", 
            "ollama": "error",
            "error": str(e)
        }), 503

@app.route('/upload', methods=['POST'])
def upload_image():
    """Resim yükle ve session'a kaydet"""
    try:
        image_file = request.files.get('image')
        
        if not image_file:
            return jsonify({"error": "Image is required"}), 400
        
        # Görseli PIL ile aç ve format kontrolü yap
        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Görseli JPEG formatında base64'e çevir (daha küçük)
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='JPEG', quality=85, optimize=True)
        image_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        
        # Session'a resmi kaydet
        set_session_image(image_base64)
        
        return jsonify({
            "status": "success",
            "message": "Image uploaded successfully. You can now ask questions about this image.",
            "image_size": f"{image.size[0]}x{image.size[1]}"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ask', methods=['POST'])
def ask_question():
    """Session'daki resim hakkında soru sor"""
    try:
        # Form verilerini al
        question = request.form.get('question', '')
        
        if not question:
            return jsonify({"error": "Question is required"}), 400
        
        # Session'dan resmi al
        image_base64 = get_session_image()
        if not image_base64:
            return jsonify({"error": "No image uploaded. Please upload an image first using /upload endpoint."}), 400
        
        # Optimize edilmiş prompt hazırla
        optimized_prompt = f"""Bu görsel hakkında sorulan soruyu yanıtla: "{question}"

Lütfen:
- Doğal ve anlaşılır Türkçe kullan
- Gereksiz formatlamalar yapma
- Direkt ve net cevap ver
- Görselde gördüğün detayları kullan"""
        
        # Ollama API'ye istek gönder
        payload = {
            "model": MODEL_NAME,
            "prompt": optimized_prompt,
            "images": [image_base64],
            "stream": False
        }
        
        response = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get('response', 'No answer received')
            
            return jsonify({
                "question": question,
                "answer": answer,
                "model": MODEL_NAME,
                "has_image": True
            })
        else:
            return jsonify({"error": f"Ollama API error: {response.status_code}"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/clear', methods=['POST'])
def clear_session():
    """Session'ı temizle (resmi sil)"""
    try:
        session.pop('current_image', None)
        return jsonify({
            "status": "success",
            "message": "Session cleared. Image removed from memory."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status', methods=['GET'])
def session_status():
    """Session durumunu kontrol et"""
    has_image = get_session_image() is not None
    return jsonify({
        "has_image": has_image,
        "model": MODEL_NAME,
        "message": "Image is loaded and ready for questions." if has_image else "No image uploaded. Use /upload to upload an image."
    })

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "service": "Session-Based Visual Q&A Service",
        "model": MODEL_NAME,
        "ollama_url": OLLAMA_BASE_URL,
        "endpoints": {
            "health": "/health",
            "upload": "/upload (POST with form data: image) - Upload image to session",
            "ask": "/ask (POST with form data: question) - Ask question about uploaded image",
            "clear": "/clear (POST) - Clear session and remove image",
            "status": "/status (GET) - Check session status"
        },
        "usage": "1. Upload image with /upload, 2. Ask questions with /ask, 3. Clear with /clear when done"
    })

if __name__ == '__main__':
    os.makedirs("/app/uploads", exist_ok=True)
    app.run(host='0.0.0.0', port=8002, debug=False)
