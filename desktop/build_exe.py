import os
import subprocess

def build():
    print("Building MultiUtilityTracker.exe executable...")
    cmd = [
        "pyinstaller",
        "--noconfirm",
        "--onedir",
        "--windowed",
        "--name=MultiUtilityTracker",
        "desktop/launcher.py"
    ]
    subprocess.run(cmd)
    print("Executable build script ready.")

if __name__ == "__main__":
    build()
