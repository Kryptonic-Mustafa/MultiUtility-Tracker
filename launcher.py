import os
import sys
import time
import socket
import subprocess
import webbrowser
import signal
import atexit

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")

backend_proc = None
frontend_proc = None
window_proc = None
is_cleaning_up = False

def is_port_in_use(port: int) -> bool:
    """Checks if a TCP port is currently active on localhost."""
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
    print("\n🛑 Shutting down MultiUtility Tracker services...")

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

    # Ensure all background processes on ports 8000 & 3000 are terminated
    kill_processes_on_ports([8000, 3000])
    print("👋 All services and windows terminated cleanly. Have a great day!")

atexit.register(cleanup)

def signal_handler(sig, frame):
    cleanup()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def focus_or_launch_app(url: str):
    global window_proc
    if os.name == 'nt':
        ps_script = """
        $wshell = New-Object -ComObject WScript.Shell
        $titles = @("MultiUtility Tracker", "Chrome", "Edge", "Brave", "Firefox", "3000")
        $activated = $false
        foreach ($t in $titles) {
            if ($wshell.AppActivate($t)) {
                Start-Sleep -Milliseconds 200
                $wshell.SendKeys("^+r")
                Start-Sleep -Milliseconds 100
                $wshell.SendKeys("^{F5}")
                $activated = $true
                break
            }
        }
        if ($activated) { Write-Output "REUSED" } else { Write-Output "NOT_FOUND" }
        """
        try:
            res = subprocess.run(
                ['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps_script],
                capture_output=True,
                text=True,
                timeout=3
            )
            if "REUSED" in res.stdout:
                print("🌐 Focused existing browser window & triggered Hard Cache Refresh (Ctrl+Shift+R)!")
                return None
        except Exception:
            pass

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
                window_proc = subprocess.Popen([path, f"--app={url}"])
                print(f"🖥️ Launched application window using {os.path.basename(path)}")
                return window_proc
            except Exception:
                pass

    print(f"🌐 Opening default web browser: {url}")
    webbrowser.open(url)
    return None

def main():
    global backend_proc, frontend_proc, window_proc
    print("=" * 70)
    print(" 🚀 MultiUtility Tracker - Smart One-Click System Launcher")
    print("=" * 70)

    # 1. Check / Start FastAPI Backend
    if is_port_in_use(8000):
        print("🔹 [1/3] FastAPI Backend active on http://localhost:8000 (reusing running backend).")
    else:
        print("🔹 [1/3] Starting FastAPI Backend (http://localhost:8000)...")
        backend_cmd = [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--reload", "--port", "8000"]
        backend_proc = subprocess.Popen(backend_cmd, cwd=PROJECT_ROOT)

    # 2. Check / Start Next.js Frontend
    if is_port_in_use(3000):
        print("🔹 [2/3] Next.js Frontend active on http://localhost:3000 (reusing running frontend).")
    else:
        print("🔹 [2/3] Starting Next.js Frontend (http://localhost:3000)...")
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        frontend_cmd = [npm_cmd, "run", "dev"]
        frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR)

    # 3. Wait briefly if servers were newly started
    if backend_proc or frontend_proc:
        print("🔹 [3/3] Waiting 3 seconds for services to initialize...")
        time.sleep(3)
    else:
        print("🔹 [3/3] Services verified active.")

    target_url = "http://localhost:3000/"
    focus_or_launch_app(target_url)

    print("\n" + "=" * 70)
    print(" ✅ MultiUtility Tracker is live and ready!")
    print(" 📍 Master Admin Login Portal : http://localhost:3000/admin/login")
    print(" 📍 Scoped Module Gateway    : http://localhost:3000/modules")
    print(" 📍 SMS Workspace Login      : http://localhost:3000/sms/login")
    print(" 📍 Backend API Docs         : http://localhost:8000/docs")
    print("=" * 70)
    print(" 💡 Closing application window or pressing CTRL+C terminates all services cleanly.\n")

    try:
        while True:
            if window_proc and window_proc.poll() is not None:
                print("\n🚪 Desktop application window closed by user. Terminating all services...")
                break
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()

if __name__ == "__main__":
    main()
