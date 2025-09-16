from flask import Flask, request, jsonify, send_file
from diffusers import DiffusionPipeline
import torch
import os
import uuid
from PIL import Image
import io

app = Flask(__name__)

# Model yükleme
model_id = os.getenv("MODEL_ID", "stabilityai/sdxl-turbo")
device = os.getenv("DEVICE", "cuda" if torch.cuda.is_available() else "cpu")

print(f"Loading model {model_id} on {device}...")
pipe = DiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    variant="fp16" if device == "cuda" else None
)

if device == "cuda":
    pipe = pipe.to("cuda")
    pipe.enable_attention_slicing()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model": model_id, "device": device})

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
    return jsonify({
        "service": "Stable Diffusion Image Generation Service",
        "model": model_id,
        "device": device,
        "endpoints": {
            "health": "/health",
            "generate": "/generate (POST with JSON: {'prompt': 'your text', 'style': 'realistic', 'size': '1024x1024'})"
        }
    })

if __name__ == '__main__':
    os.makedirs("/app/outputs", exist_ok=True)
    app.run(host='0.0.0.0', port=8000, debug=False)
