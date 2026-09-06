import os
import sys
import time
import subprocess
import webbrowser

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")

def main():
    print("=" * 70)
    print(" 🚀 MultiUtility Tracker - One-Click System Launcher")
    print("=" * 70)

    # 1. Start FastAPI Backend
    print("🔹 [1/3] Starting FastAPI Backend (http://localhost:8000)...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--reload", "--port", "8000"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=PROJECT_ROOT)

    # 2. Start Next.js Frontend
    print("🔹 [2/3] Starting Next.js Frontend (http://localhost:3000)...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR)

    # 3. Wait briefly and open browser
    print("🔹 [3/3] Waiting 4 seconds for services to initialize...")
    time.sleep(4)

    target_url = "http://localhost:3000/"
    print(f"🌐 Opening default web browser: {target_url}")
    webbrowser.open(target_url)

    print("\n" + "=" * 70)
    print(" ✅ MultiUtility Tracker is now live!")
    print(" 📍 Master Admin Login Portal : http://localhost:3000/admin/login")
    print(" 📍 Scoped Module Gateway    : http://localhost:3000/modules")
    print(" 📍 SMS Workspace Login      : http://localhost:3000/sms/login")
    print(" 📍 Backend API Docs         : http://localhost:8000/docs")
    print("=" * 70)
    print(" 💡 Press CTRL+C in this window at any time to stop all servers cleanly.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down backend and frontend services...")
        try:
            backend_proc.terminate()
        except Exception:
            pass
        try:
            frontend_proc.terminate()
        except Exception:
            pass
        print("👋 All services stopped. Have a great day!")

if __name__ == "__main__":
    main()
