@echo off
echo Setting up Admission System Database...
echo.

REM Check if MySQL is available
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not installed or not in PATH
    echo Please install MySQL Community Server first
    echo Download from: https://dev.mysql.com/downloads/mysql/
    pause
    exit /b 1
)

echo MySQL found! Proceeding with database setup...
echo.

REM Create database
echo Creating database 'admission_system'...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS admission_system;"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database
    echo Please check your MySQL root password
    pause
    exit /b 1
)

echo Database created successfully!
echo.

REM Run Laravel migrations
echo Running Laravel migrations...
php artisan migrate --force
if %errorlevel% neq 0 (
    echo ERROR: Failed to run migrations
    pause
    exit /b 1
)

echo Migrations completed successfully!
echo.

REM Run database seeds
echo Running database seeds...
php artisan db:seed --force
if %errorlevel% neq 0 (
    echo ERROR: Failed to run seeds
    pause
    exit /b 1
)

echo Database setup completed successfully!
echo.
echo Default login credentials:
echo Admin: admin@example.com / password
echo User: john@example.com / password
echo User: jane@example.com / password
echo.
pause 