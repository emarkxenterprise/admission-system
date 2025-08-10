# PowerShell script to start both backend and frontend servers
# This script avoids the && operator which is not supported in PowerShell

Write-Host "Starting PRTL Application Servers..." -ForegroundColor Green

# Function to start backend server
function Start-BackendServer {
    Write-Host "Starting Backend Server..." -ForegroundColor Yellow
    Set-Location -Path "backend"
    Start-Process -FilePath "php" -ArgumentList "artisan", "serve", "--host=127.0.0.1", "--port=8000" -WindowStyle Normal
    Set-Location -Path ".."
}

# Function to start frontend server
function Start-FrontendServer {
    Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
    Set-Location -Path "frontend"
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal
    Set-Location -Path ".."
}

# Start backend server
Start-BackendServer

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Start-FrontendServer

Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press any key to exit this script (servers will continue running)" -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 