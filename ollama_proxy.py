#!/usr/bin/env python3
"""
Ollama Reverse Proxy
Container'lardan host.docker.internal:11434 ile erişim sağlar
"""
from flask import Flask, request, Response
import requests

app = Flask(__name__)

# Uzak Ollama sunucusu
# NOT: IP adresini kendi Ollama sunucunuzun adresi ile değiştirin
OLLAMA_SERVER = "http://172.17.28.121"

@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE'])
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy(path):
    """Tüm istekleri Ollama sunucusuna forward et"""
    url = f"{OLLAMA_SERVER}/{path}"
    
    # Query parametrelerini ekle
    if request.query_string:
        url += f"?{request.query_string.decode()}"
    
    try:
        # İsteği forward et
        resp = requests.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers if k.lower() != 'host'},
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False,
            timeout=120
        )
        
        # Response'u döndür
        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        headers = [(k, v) for k, v in resp.raw.headers.items() if k.lower() not in excluded_headers]
        
        return Response(resp.content, resp.status_code, headers)
    except Exception as e:
        return {"error": str(e)}, 502

if __name__ == '__main__':
    print("=" * 60)
    print("Ollama Reverse Proxy Starting...")
    print("=" * 60)
    print(f"Forwarding: localhost:11434 -> {OLLAMA_SERVER}")
    print("Container'lar http://host.docker.internal:11434 ile erişebilir")
    print("=" * 60)
    app.run(host='0.0.0.0', port=11434, debug=False)



