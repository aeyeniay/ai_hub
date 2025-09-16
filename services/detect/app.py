from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
from PIL import Image
import io
import json
import requests
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Gemma3 model konfigürasyonu
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma3:27b")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model": MODEL_NAME,
        "ollama_url": OLLAMA_BASE_URL,
        "confidence_threshold": CONFIDENCE_THRESHOLD
    })

@app.route('/detect', methods=['POST'])
def detect_objects():
    try:
        # Form verilerini al
        image_file = request.files.get('image')
        confidence = request.form.get('confidence', CONFIDENCE_THRESHOLD)
        
        if not image_file:
            return jsonify({"error": "Image is required"}), 400
        
        # Görseli oku ve base64'e çevir
        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Görseli base64'e çevir
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='PNG')
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        # LLaVA prompt'u hazırla - İngilizce (encoding sorunu çözümü)
        prompt = """What objects are in this image? For each object provide:
        - Object name (in English)
        - Location in image
        - Brief description
        - Confidence score (0-100)
        
        Return JSON format:
        {"objects":[{"name":"object_name","location":"position","description":"description","confidence":number}]}"""
        
        # Ollama API'ye istek gönder
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "images": [img_str],
            "stream": False
        }
        
        response = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload, timeout=120)
        
        if response.status_code != 200:
            return jsonify({"error": f"Ollama API error: {response.text}"}), 500
        
        # LLaVA yanıtını parse et
        result = response.json()
        llava_response = result.get('response', '')
        
        # JSON yanıtını parse etmeye çalış
        try:
            # LLaVA yanıtından JSON kısmını çıkar
            json_start = llava_response.find('{')
            json_end = llava_response.rfind('}') + 1
            
            if json_start != -1 and json_end != 0:
                json_str = llava_response[json_start:json_end]
                # Debug için yazdır
                print(f"JSON string: {json_str}")
                parsed_result = json.loads(json_str)
                objects = parsed_result.get('objects', [])
            else:
                # JSON bulunamadıysa manuel parse et
                objects = parse_llava_response(llava_response)
                
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"Response: {llava_response}")
            # JSON parse hatası durumunda manuel parse et
            objects = parse_llava_response(llava_response)
        
        # Görseli kaydet
        filename = f"{uuid.uuid4()}_detected.png"
        output_path = os.path.join("/app/outputs", filename)
        image.save(output_path)
        
        # Nesne isimlerini Türkçe'ye çevir
        turkish_objects = []
        for obj in objects:
            turkish_obj = translate_object_to_turkish(obj)
            turkish_objects.append(turkish_obj)
        
        # Temiz çıktı formatı
        return jsonify({
            "status": "success",
            "model": MODEL_NAME,
            "total_objects": len(turkish_objects),
            "objects": turkish_objects,
            "image_saved": filename
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def translate_object_to_turkish(obj):
    """İngilizce nesne isimlerini Türkçe'ye çevir"""
    english_to_turkish = {
        # İnsanlar
        "person": "kişi", "man": "erkek", "woman": "kadın", "child": "çocuk", "baby": "bebek",
        "people": "insanlar", "boy": "erkek çocuk", "girl": "kız çocuk",
        
        # Hayvanlar
        "dog": "köpek", "cat": "kedi", "bird": "kuş", "animal": "hayvan",
        "horse": "at", "cow": "inek", "sheep": "koyun",
        
        # Araçlar
        "car": "araba", "vehicle": "araç", "truck": "kamyon", "bus": "otobüs",
        "motorcycle": "motosiklet", "bicycle": "bisiklet", "boat": "tekne",
        "airplane": "uçak", "train": "tren",
        
        # Binalar
        "building": "bina", "house": "ev", "building": "yapı", "tower": "kule",
        "bridge": "köprü", "church": "kilise", "school": "okul",
        
        # Doğa
        "tree": "ağaç", "mountain": "dağ", "river": "nehir", "lake": "göl",
        "forest": "orman", "grass": "çim", "flower": "çiçek",
        
        # Eşyalar
        "chair": "sandalye", "table": "masa", "book": "kitap", "phone": "telefon",
        "computer": "bilgisayar", "bag": "çanta", "clothes": "giysi",
        
        # Diğer
        "road": "yol", "street": "sokak", "sky": "gökyüzü", "cloud": "bulut",
        "sun": "güneş", "moon": "ay", "star": "yıldız"
    }
    
    # Nesne adını çevir
    english_name = obj.get('name', '').lower()
    turkish_name = english_to_turkish.get(english_name, english_name)
    
    # Açıklamayı da çevir (basit)
    description = obj.get('description', '')
    turkish_description = translate_description_to_turkish(description)
    
    return {
        "name": turkish_name,
        "location": obj.get('location', ''),
        "description": turkish_description,
        "confidence": obj.get('confidence', 0)
    }

def translate_description_to_turkish(description):
    """Açıklamayı basit Türkçe'ye çevir"""
    # Basit çeviriler
    translations = {
        "sitting": "oturuyor", "standing": "ayakta duruyor", "walking": "yürüyor",
        "running": "koşuyor", "holding": "tutuyor", "wearing": "giyiyor",
        "in front of": "önünde", "behind": "arkasında", "next to": "yanında",
        "on the left": "sol tarafta", "on the right": "sağ tarafta",
        "in the center": "ortada", "in the background": "arka planda",
        "small": "küçük", "large": "büyük", "red": "kırmızı", "blue": "mavi",
        "green": "yeşil", "yellow": "sarı", "white": "beyaz", "black": "siyah"
    }
    
    # Basit çeviri
    turkish_desc = description
    for eng, tr in translations.items():
        turkish_desc = turkish_desc.replace(eng, tr)
    
    return turkish_desc

def parse_llava_response(response):
    """LLaVA yanıtından nesne bilgilerini manuel olarak çıkar"""
    objects = []
    
    # Basit parsing - satır satır oku
    lines = response.split('\n')
    current_object = {}
    
    for line in lines:
        line = line.strip()
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip().lower()
            value = value.strip()
            
            if 'nesne' in key or 'object' in key:
                if current_object:
                    objects.append(current_object)
                current_object = {'name': value, 'location': '', 'details': '', 'confidence': 85}
            elif 'konum' in key or 'location' in key:
                current_object['location'] = value
            elif 'detay' in key or 'detail' in key:
                current_object['details'] = value
            elif 'güven' in key or 'confidence' in key:
                try:
                    current_object['confidence'] = int(value)
                except:
                    current_object['confidence'] = 85
    
    if current_object:
        objects.append(current_object)
    
    return objects

@app.route('/detect_image', methods=['POST'])
def detect_objects_image():
    try:
        # Form verilerini al
        image_file = request.files.get('image')
        confidence = request.form.get('confidence', CONFIDENCE_THRESHOLD)
        
        if not image_file:
            return jsonify({"error": "Image is required"}), 400
        
        # Görseli oku
        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Görseli response olarak döndür (annotated değil, orijinal)
        img_io = io.BytesIO()
        image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "service": "LLaVA Object Detection Service",
        "model": MODEL_NAME,
        "ollama_url": OLLAMA_BASE_URL,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "endpoints": {
            "health": "/health",
            "detect": "/detect (POST with form data: image, confidence)",
            "detect_image": "/detect_image (POST with form data: image, confidence) - returns original image"
        }
    })

if __name__ == '__main__':
    os.makedirs("/app/uploads", exist_ok=True)
    os.makedirs("/app/outputs", exist_ok=True)
    app.run(host='0.0.0.0', port=8003, debug=False)
