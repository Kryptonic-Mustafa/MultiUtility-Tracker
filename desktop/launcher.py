import os
import sys
import time
import subprocess
import webbrowser
import threading
import urllib.request

def start_backend():
    print('Starting FastAPI Backend Server (Port 8000)...')
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    sys.path.append(root_dir)
    import uvicorn
    uvicorn.run('backend.app.main:app', host='127.0.0.1', port=8000, log_level='error')

def start_frontend():
    print('Starting Next.js Web UI Server (Port 3000)...')
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    frontend_dir = os.path.join(root_dir, 'frontend')
    cmd = 'node node_modules/next/dist/bin/next dev -p 3000'
    subprocess.Popen(cmd, cwd=frontend_dir, shell=True)

def is_port_ready(url):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=2) as response:
            return response.status == 200
    except Exception:
        return False

def open_browser():
    print('Checking Web UI readiness on http://localhost:3000...')
    for i in range(30):
        if is_port_ready('http://localhost:3000'):
            print('Web UI is online! Launching application window...')
            time.sleep(1)
            try:
                os.system('start chrome --app=http://localhost:3000')
            except Exception:
                webbrowser.open('http://localhost:3000')
            return
        time.sleep(1)
    
    print('Opening browser fallback...')
    webbrowser.open('http://localhost:3000')

if __name__ == '__main__':
    print('=' * 65)
    print('   MultiUtility Tracker - Enterprise Desktop & Web Platform')
    print('=' * 65)

    b_thread = threading.Thread(target=start_backend, daemon=True)
    b_thread.start()

    f_thread = threading.Thread(target=start_frontend, daemon=True)
    f_thread.start()

    open_browser()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print('Shutting down MultiUtility Tracker...')
        sys.exit(0)
