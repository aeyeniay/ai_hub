from flask import Flask, request, jsonify
import requests
import os
import base64
from PIL import Image
import io
import uuid
import json
from datetime import datetime

app = Flask(__name__)

# Ollama konfigürasyonu
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen2.5vl:32b")

# Session yönetimi için dosya tabanlı yaklaşım
SESSIONS_DIR = "/app/sessions"

def get_session_file(session_id):
    """Session dosyasının yolunu döndür"""
    return os.path.join(SESSIONS_DIR, f"{session_id}.json")

def create_session(image_base64, image_size):
    """Yeni session oluştur"""
    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "image_base64": image_base64,
        "image_size": image_size,
        "created_at": datetime.now().isoformat(),
        "questions": []
    }
    
    os.makedirs(SESSIONS_DIR, exist_ok=True)
    with open(get_session_file(session_id), 'w') as f:
        json.dump(session_data, f)
    
    return session_id

def get_session(session_id):
    """Session verilerini al"""
    try:
        with open(get_session_file(session_id), 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def update_session(session_id, question, answer):
    """Session'a soru-cevap ekle"""
    session_data = get_session(session_id)
    if session_data:
        session_data["questions"].append({
            "question": question,
            "answer": answer,
            "timestamp": datetime.now().isoformat()
        })
        with open(get_session_file(session_id), 'w') as f:
            json.dump(session_data, f)

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
    """Resim yükle ve session oluştur"""
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
        
        # Session oluştur
        session_id = create_session(image_base64, f"{image.size[0]}x{image.size[1]}")
        
        return jsonify({
            "status": "success",
            "message": "Image uploaded successfully. You can now ask questions about this image.",
            "session_id": session_id,
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
        session_id = request.form.get('session_id', '')
        
        if not question:
            return jsonify({"error": "Question is required"}), 400
        
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
        
        # Session'dan resmi al
        session_data = get_session(session_id)
        if not session_data:
            return jsonify({"error": "Session not found. Please upload an image first using /upload endpoint."}), 400
        
        image_base64 = session_data.get('image_base64')
        if not image_base64:
            return jsonify({"error": "No image in session. Please upload an image first."}), 400
        
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
            
            # Session'a soru-cevap ekle
            update_session(session_id, question, answer)
            
            return jsonify({
                "session_id": session_id,
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
    """Session'ı temizle (dosyayı sil)"""
    try:
        session_id = request.form.get('session_id', '')
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
        
        session_file = get_session_file(session_id)
        if os.path.exists(session_file):
            os.remove(session_file)
            return jsonify({
                "status": "success",
                "message": "Session cleared. Image and conversation history removed."
            })
        else:
            return jsonify({"error": "Session not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status', methods=['GET'])
def session_status():
    """Session durumunu kontrol et"""
    session_id = request.args.get('session_id', '')
    if not session_id:
        return jsonify({
            "error": "Session ID is required",
            "model": MODEL_NAME
        }), 400
    
    session_data = get_session(session_id)
    if session_data:
        return jsonify({
            "session_id": session_id,
            "has_image": True,
            "image_size": session_data.get('image_size'),
            "questions_count": len(session_data.get('questions', [])),
            "created_at": session_data.get('created_at'),
            "model": MODEL_NAME,
            "message": "Image is loaded and ready for questions."
        })
    else:
        return jsonify({
            "session_id": session_id,
            "has_image": False,
            "model": MODEL_NAME,
            "message": "Session not found. Use /upload to upload an image."
        })

@app.route('/history', methods=['GET'])
def get_session_history():
    """Session geçmişini getir"""
    session_id = request.args.get('session_id', '')
    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400
    
    session_data = get_session(session_id)
    if session_data:
        return jsonify({
            "session_id": session_id,
            "image_size": session_data.get('image_size'),
            "created_at": session_data.get('created_at'),
            "questions": session_data.get('questions', [])
        })
    else:
        return jsonify({"error": "Session not found"}), 404

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "service": "Hybrid Visual Q&A Service (Qwen2.5VL-32B)",
        "model": MODEL_NAME,
        "ollama_url": OLLAMA_BASE_URL,
        "endpoints": {
            "health": "/health",
            "upload": "/upload (POST with form data: image) - Upload image and create session",
            "ask": "/ask (POST with form data: question, session_id) - Ask question about session image",
            "status": "/status (GET with session_id) - Check session status",
            "history": "/history (GET with session_id) - Get conversation history",
            "clear": "/clear (POST with session_id) - Clear session and remove image"
        },
        "usage": "1. Upload image with /upload (get session_id), 2. Ask questions with /ask (use session_id), 3. Check history with /history, 4. Clear with /clear when done"
    })

if __name__ == '__main__':
    os.makedirs("/app/uploads", exist_ok=True)
    app.run(host='0.0.0.0', port=8002, debug=False)
