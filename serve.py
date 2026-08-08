#!/usr/bin/env python3
"""
Local HTTP Server launcher for IUPAC Vocabulary Project.
Finds an available port, binds to 127.0.0.1, and opens the browser.
"""

import http.server
import socketserver
import webbrowser
import socket
import os
import sys
import threading
import time

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    project_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_root)

    # Find a free port starting at 8000
    port = 8000
    for test_port in range(8000, 8100):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', test_port))
                port = test_port
                break
            except OSError:
                continue

    url = f"http://127.0.0.1:{port}"

    class ReusableTCPServer(socketserver.TCPServer):
        allow_reuse_address = True

    handler = http.server.SimpleHTTPRequestHandler

    print("=" * 58, flush=True)
    print("   IUPAC Vocabulary Companion - Local Web Server", flush=True)
    print("=" * 58, flush=True)
    print(f"\n[INFO] Server running at: {url}", flush=True)
    print("[INFO] Opening website in default web browser...\n", flush=True)
    print("-" * 58, flush=True)
    print(" Keep this window open while browsing.", flush=True)
    print(" Press Ctrl+C in this window to stop the server.", flush=True)
    print("-" * 58 + "\n", flush=True)

    def open_browser():
        time.sleep(0.8)
        webbrowser.open(url)

    threading.Thread(target=open_browser, daemon=True).start()

    try:
        with ReusableTCPServer(('127.0.0.1', port), handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Server stopped successfully.", flush=True)
        sys.exit(0)

if __name__ == '__main__':
    main()
