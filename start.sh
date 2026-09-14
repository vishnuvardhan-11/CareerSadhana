#!/usr/bin/env bash
# CareerSadhana Full-Stack Application Launcher for Linux / macOS

set -e
cd "$(dirname "$0")"

echo "================================================================="
echo "  CareerSadhana — Full-Stack Application Launcher"
echo "================================================================="

if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 is not installed."
    exit 1
fi

python3 -c "import flask, flask_cors, requests" 2>/dev/null || {
    echo "Installing requirements..."
    python3 -m pip install -r requirements.txt
}

echo "Starting server on http://127.0.0.1:5000 ..."
python3 app.py
