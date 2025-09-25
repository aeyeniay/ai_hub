from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from diffusers import AutoPipelineForText2Image
import torch
import os
import uuid
from PIL import Image
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Model konfigürasyonu
model_path = os.getenv("MODEL_PATH", "/app/models/sdxl-turbo")
device = os.getenv("DEVICE", "cuda" if torch.cuda.is_available() else "cpu")
local_model_available = os.path.exists(model_path) and os.path.exists(os.path.join(model_path, "model_index.json"))

print(f"Device: {device}")
print(f"Model path: {model_path}")
print(f"Local model available: {local_model_available}")

# Model yükleme stratejisi
model_id = os.getenv("MODEL_ID", "stabilityai/sdxl-turbo")

print(f"🚀 SDXL-Turbo Model Loading Strategy")
print(f"Device: {device}")
print(f"HuggingFace Model: {model_id}")
print(f"Local Model Path: {model_path}")
print(f"Local Model Available: {local_model_available}")

# Önce cache'den local_files_only=True ile dene
try:
    print(f"🏠 Trying to load from cache with local_files_only=True: {model_id}")
    pipe = AutoPipelineForText2Image.from_pretrained(
        model_id,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        variant="fp16" if device == "cuda" else None,
        local_files_only=True  # Sadece cache'den yükle
    )
    model_source = "cache"
    print(f"✅ Successfully loaded from cache: {model_id}")
except Exception as e:
    print(f"❌ Cache loading failed: {e}")
    
    # Local model path'i dene
    if local_model_available:
        try:
            print(f"🏠 Trying to load from local path: {model_path}")
            pipe = AutoPipelineForText2Image.from_pretrained(
                model_path,
                torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                local_files_only=True
            )
            model_source = "local_path"
            print(f"✅ Successfully loaded from local path: {model_path}")
        except Exception as e2:
            print(f"❌ Local path loading failed: {e2}")
            
            # Son çare: Online download
            print(f"🌐 Falling back to online download: {model_id}")
            pipe = AutoPipelineForText2Image.from_pretrained(
                model_id,
                torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                variant="fp16" if device == "cuda" else None
            )
            model_source = "online"
    else:
        # Local model yok, online dene
        print(f"🌐 No local model, trying online: {model_id}")
        pipe = AutoPipelineForText2Image.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            variant="fp16" if device == "cuda" else None
        )
        model_source = "online"

if device == "cuda":
    pipe = pipe.to("cuda")
    pipe.enable_attention_slicing()

print(f"✅ Model loaded successfully from {model_source} source!")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy", 
        "model": model_id,
        "model_source": model_source,
        "device": device,
        "local_model": local_model_available,
        "offline_capable": model_source in ["cache", "local_path"]
    })

@app.route('/generate', methods=['POST'])
def generate_image():
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        style = data.get('style', 'realistic')
        size = data.get('size', '1024x1024')
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        print(f"Generating image for prompt: {prompt}")
        
        # Görsel üretimi
        image = pipe(
            prompt,
            num_inference_steps=1,  # SDXL-Turbo için hızlı üretim
            guidance_scale=0.0,     # SDXL-Turbo için önerilen değer
        ).images[0]
        
        # Görseli kaydet
        filename = f"{uuid.uuid4()}.png"
        output_path = os.path.join("/app/outputs", filename)
        image.save(output_path)
        
        print(f"Image saved: {filename}")
        
        # Görseli response olarak döndür
        img_io = io.BytesIO()
        image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
        
    except Exception as e:
        print(f"Error in generate_image: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    model_info = model_path if local_model_available else os.getenv("MODEL_ID", "stabilityai/sdxl-turbo")
    return jsonify({
        "service": "SDXL-Turbo Image Generation Service",
        "model": model_info,
        "model_source": model_source,
        "device": device,
        "local_model": local_model_available,
        "endpoints": {
            "health": "/health",
            "generate": "/generate (POST with JSON: {'prompt': 'your text'}) - Single step generation!"
        },
        "usage": "SDXL-Turbo: Fast single-step generation, no guidance_scale needed"
    })

if __name__ == '__main__':
    os.makedirs("/app/outputs", exist_ok=True)
    app.run(host='0.0.0.0', port=8000, debug=False)
