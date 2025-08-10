Write-Host "Setting up Admission System Database..." -ForegroundColor Green
Write-Host ""

# Check if MySQL is available
try {
    $mysqlVersion = mysql --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "MySQL not found"
    }
    Write-Host "MySQL found! Proceeding with database setup..." -ForegroundColor Green
} catch {
    Write-Host "ERROR: MySQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install MySQL Community Server first" -ForegroundColor Yellow
    Write-Host "Download from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Create database
Write-Host "Creating database 'admission_system'..." -ForegroundColor Yellow
$createDb = mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS admission_system;" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create database" -ForegroundColor Red
    Write-Host "Please check your MySQL root password" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Database created successfully!" -ForegroundColor Green
Write-Host ""

# Run Laravel migrations
Write-Host "Running Laravel migrations..." -ForegroundColor Yellow
php artisan migrate --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to run migrations" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Migrations completed successfully!" -ForegroundColor Green
Write-Host ""

# Run database seeds
Write-Host "Running database seeds..." -ForegroundColor Yellow
php artisan db:seed --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to run seeds" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Database setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Default login credentials:" -ForegroundColor Cyan
Write-Host "Admin: admin@example.com / password" -ForegroundColor White
Write-Host "User: john@example.com / password" -ForegroundColor White
Write-Host "User: jane@example.com / password" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue" 