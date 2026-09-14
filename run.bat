@echo off
TITLE CareerSadhana Full-Stack Application
echo =================================================================
echo   CareerSadhana — Full-Stack Application Launcher
echo =================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python environment...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python was not found in PATH. Please install Python 3.10+ from python.org.
    pause
    exit /b 1
)

echo [2/3] Checking dependencies...
python -c "import flask, flask_cors, requests" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Installing required packages (flask, flask-cors, requests, python-dotenv)...
    python -m pip install -r requirements.txt
)

echo [3/3] Starting Full-Stack Server on http://127.0.0.1:5000 ...
echo.
echo Opening browser in 2 seconds...
start "" http://127.0.0.1:5000

python app.py
pause
