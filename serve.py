"""
PashuRakshak AI - Localhost Web Server
Serves the HTML Dashboard on a local port (e.g. http://localhost:5500)
"""

import http.server
import socketserver
import os
import sys
import webbrowser
import socket

DEFAULT_PORT = 5500
PREFERRED_PORTS = [5500, 5501, 8080, 3000, 8888]

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS and no-cache headers for smooth local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def translate_path(self, path):
        # Normalize path
        normalized = super().translate_path(path)
        # If accessing root and index.html exists, serve it
        return normalized

def is_port_available(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) != 0

def find_available_port():
    for port in PREFERRED_PORTS:
        if is_port_available(port):
            return port
    # Otherwise grab an ephemeral port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def main():
    workspace_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(workspace_dir)

    # Parse port from args if provided as integer
    port = None
    for arg in sys.argv[1:]:
        if arg.isdigit():
            port = int(arg)
            break
    if port is None:
        port = find_available_port()
    
    # Check if pashu folder has the HTML or root has index.html
    html_target = "index.html"
    if not os.path.exists(os.path.join(workspace_dir, "index.html")):
        if os.path.exists(os.path.join(workspace_dir, "pashu", "index.html")):
            html_target = "pashu/index.html"

    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    url = f"http://localhost:{port}/{html_target}"
    direct_url = f"http://localhost:{port}/"

    print("=" * 60)
    print(" [*] PashuRakshak AI - Localhost Server")
    print("=" * 60)
    print(f" [OK] Localhost Server Running at : {direct_url}")
    print(f" [OK] Direct Dashboard URL       : {url}")
    print(f" [OK] Backend AI API (FastAPI)    : http://localhost:8000")
    print("=" * 60)
    print(" Press Ctrl+C in this terminal to stop the server.\n")


    # Automatically launch browser if not in headless/quiet mode
    if "--no-browser" not in sys.argv:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    # Use ThreadingHTTPServer for fast concurrent request handling
    server_cls = getattr(http.server, "ThreadingHTTPServer", socketserver.ThreadingTCPServer)
    socketserver.TCPServer.allow_reuse_address = True
    with server_cls(("0.0.0.0", port), CustomHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[!] Localhost server stopped.")

if __name__ == "__main__":
    main()

