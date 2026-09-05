import os
import sys
import subprocess
import time
import webbrowser
import threading

def start_backend():
    print("Starting MultiUtility Tracker FastAPI Engine...")
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    sys.path.append(root_dir)
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, log_level="info")

def open_ui():
    time.sleep(2)
    url = "http://localhost:3000"
    print(f"Opening MultiUtility Tracker Desktop Application UI at {url}...")
    try:
        # Try opening in Chrome App Mode
        chrome_cmd = f'start chrome --app={url}'
        os.system(chrome_cmd)
    except Exception:
        webbrowser.open(url)

if __name__ == "__main__":
    print("=" * 60)
    print("   MultiUtility Tracker - Enterprise Desktop Software")
    print("=" * 60)
    
    # Launch backend server thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()

    # Launch desktop browser window
    open_ui()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down MultiUtility Tracker...")
        sys.exit(0)
