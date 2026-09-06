import os
import sys
import time
import socket
import subprocess
import webbrowser

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")

def is_port_in_use(port: int) -> bool:
    """Checks if a TCP port is currently active on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0

def focus_or_open_browser(url: str):
    """
    Brings existing browser window to focus and reloads the active tab (F5),
    preventing creation of duplicate tabs. Opens a browser only if not already open.
    """
    if os.name == 'nt':
        ps_script = """
        $wshell = New-Object -ComObject WScript.Shell
        $titles = @("MultiUtility Tracker", "Chrome", "Edge", "Brave", "Firefox", "3000")
        $activated = $false
        foreach ($t in $titles) {
            if ($wshell.AppActivate($t)) {
                Start-Sleep -Milliseconds 150
                $wshell.SendKeys("{F5}")
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
                print("🌐 Focused existing browser window & reloaded active tab (F5)!")
                return
        except Exception:
            pass

    print(f"🌐 Opening web browser: {url}")
    webbrowser.open(url)

def main():
    print("=" * 70)
    print(" 🚀 MultiUtility Tracker - Smart One-Click System Launcher")
    print("=" * 70)

    backend_proc = None
    frontend_proc = None

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
    focus_or_open_browser(target_url)

    print("\n" + "=" * 70)
    print(" ✅ MultiUtility Tracker is live and ready!")
    print(" 📍 Master Admin Login Portal : http://localhost:3000/admin/login")
    print(" 📍 Scoped Module Gateway    : http://localhost:3000/modules")
    print(" 📍 SMS Workspace Login      : http://localhost:3000/sms/login")
    print(" 📍 Backend API Docs         : http://localhost:8000/docs")
    print("=" * 70)
    print(" 💡 Press CTRL+C in this window to stop services when finished.\n")

    try:
        if backend_proc:
            backend_proc.wait()
        if frontend_proc:
            frontend_proc.wait()
        
        # If both services were already running, keep launcher interactive
        if not backend_proc and not frontend_proc:
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down managed services...")
        if backend_proc:
            try:
                backend_proc.terminate()
            except Exception:
                pass
        if frontend_proc:
            try:
                frontend_proc.terminate()
            except Exception:
                pass
        print("👋 All services stopped cleanly. Have a great day!")

if __name__ == "__main__":
    main()
