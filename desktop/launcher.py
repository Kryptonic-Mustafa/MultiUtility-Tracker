import os
import sys
import time
import socket
import tempfile
import subprocess
import webbrowser
import signal
import atexit

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
USER_DATA_DIR = os.path.join(tempfile.gettempdir(), "multiutility_desktop_profile")

backend_proc = None
frontend_proc = None
window_proc = None
is_cleaning_up = False

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_process_tree(pid: int):
    if not pid:
        return
    try:
        if os.name == 'nt':
            subprocess.run(['taskkill', '/F', '/T', '/PID', str(pid)], capture_output=True)
        else:
            os.kill(pid, signal.SIGTERM)
    except Exception:
        pass

def kill_processes_on_ports(ports):
    if os.name == 'nt':
        for port in ports:
            try:
                res = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
                for line in res.stdout.splitlines():
                    if f":{port} " in line and "LISTENING" in line:
                        parts = line.strip().split()
                        pid = parts[-1]
                        if pid.isdigit() and int(pid) != os.getpid():
                            subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True)
            except Exception:
                pass

def cleanup():
    global is_cleaning_up, backend_proc, frontend_proc, window_proc
    if is_cleaning_up:
        return
    is_cleaning_up = True
    print("\n🛑 Shutting down MultiUtility Tracker desktop app and services...")

    if window_proc and window_proc.poll() is None:
        try:
            kill_process_tree(window_proc.pid)
        except Exception:
            pass

    if backend_proc and backend_proc.poll() is None:
        try:
            kill_process_tree(backend_proc.pid)
        except Exception:
            pass

    if frontend_proc and frontend_proc.poll() is None:
        try:
            kill_process_tree(frontend_proc.pid)
        except Exception:
            pass

    # Terminate listener processes on ports 8000 & 3000 cleanly
    kill_processes_on_ports([8000, 3000])
    print("👋 All desktop services and windows terminated cleanly.")

atexit.register(cleanup)

def signal_handler(sig, frame):
    cleanup()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def launch_app_window(url):
    global window_proc
    os.makedirs(USER_DATA_DIR, exist_ok=True)

    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expanduser(r"~\AppData\Local\Google\Chrome\Application\chrome.exe"),
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    for path in chrome_paths:
        if os.path.exists(path):
            try:
                cmd = [
                    path,
                    f"--app={url}",
                    f"--user-data-dir={USER_DATA_DIR}",
                    "--no-first-run",
                    "--no-default-browser-check"
                ]
                window_proc = subprocess.Popen(cmd)
                print(f"🖥️ Standalone Desktop App Window launched with {os.path.basename(path)}")
                return window_proc
            except Exception as e:
                print(f"Warning: Failed to launch browser at {path}: {e}")

    print(f"🌐 Opening default web browser: {url}")
    webbrowser.open(url)
    return None

def main():
    global backend_proc, frontend_proc, window_proc
    print("=" * 65)
    print("   MultiUtility Tracker - Enterprise Desktop & Web Platform")
    print("=" * 65)

    # 1. Start FastAPI Backend if port 8000 not active
    if is_port_in_use(8000):
        print("🔹 FastAPI Backend active on http://localhost:8000")
    else:
        print("🔹 Starting FastAPI Backend Server (Port 8000)...")
        backend_cmd = [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--port", "8000"]
        backend_proc = subprocess.Popen(backend_cmd, cwd=PROJECT_ROOT)

    # 2. Start Next.js Frontend if port 3000 not active
    if is_port_in_use(3000):
        print("🔹 Next.js Frontend active on http://localhost:3000")
    else:
        print("🔹 Starting Next.js Web UI Server (Port 3000)...")
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        frontend_cmd = [npm_cmd, "run", "dev"]
        frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR)

    # 3. Wait for Web UI readiness
    print("🔹 Checking Web UI readiness on http://localhost:3000...")
    target_url = "http://localhost:3000"
    ready = False
    for _ in range(30):
        if is_port_in_use(3000):
            ready = True
            break
        time.sleep(1)

    if ready:
        print("✅ Web UI is online! Launching standalone application window...")
        time.sleep(1)
        launch_app_window(target_url)
    else:
        print("⚠️ Timeout waiting for Web UI. Opening fallback browser...")
        webbrowser.open(target_url)

    # 4. Monitor loop: Exit cleanly if desktop window is closed or Ctrl+C is pressed
    start_time = time.time()
    try:
        while True:
            if window_proc:
                poll_res = window_proc.poll()
                if poll_res is not None:
                    # Only treat as user-closed if window ran for more than 2.5 seconds
                    if time.time() - start_time > 2.5:
                        print("\n🚪 Desktop application window closed by user. Terminating all services...")
                        break
                    else:
                        window_proc = None
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()

if __name__ == "__main__":
    main()
