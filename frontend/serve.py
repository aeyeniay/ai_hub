#!/usr/bin/env python3
"""
Simple HTTP server for AI Hub Services Frontend
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Configuration
PORT = 3000
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    # Change to frontend directory
    os.chdir(DIRECTORY)
    
    # Create server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Frontend server başlatıldı!")
        print(f"📁 Dizin: {DIRECTORY}")
        print(f"🌐 URL: http://localhost:{PORT}")
        print(f"📱 Tarayıcıda otomatik açılıyor...")
        print(f"⏹️  Durdurmak için Ctrl+C")
        print("-" * 50)
        
        # Open browser automatically
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            print("⚠️  Tarayıcı otomatik açılamadı, manuel olarak açın")
        
        # Start server
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server durduruldu")

if __name__ == "__main__":
    main()

