# CareerSadhana Full-Stack PowerShell Launcher
$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  CareerSadhana — Full-Stack Application Launcher" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

Write-Host "`n[1/3] Checking Python installation..." -ForegroundColor Yellow
$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) {
    Write-Host "[ERROR] Python is not found. Please install Python 3.10+." -ForegroundColor Red
    exit 1
}

Write-Host "[2/3] Checking dependencies..." -ForegroundColor Yellow
try {
    python -c "import flask, flask_cors, requests" 2>$null
} catch {
    Write-Host "Installing dependencies from requirements.txt..." -ForegroundColor Magenta
    python -m pip install -r requirements.txt
}

Write-Host "[3/3] Starting Full-Stack Server on http://127.0.0.1:5000 ..." -ForegroundColor Green
Start-Process "http://127.0.0.1:5000"

python app.py
