# University Admission Processing System

A comprehensive web application for managing university admissions with Laravel backend and React frontend.

<!-- Deployment trigger - Updated workflow -->
<!-- Last updated: 2025-01-27 -->

## Features

- **User Management**: Student registration, staff management, role-based access control
- **Application Processing**: Online application submission, document upload, status tracking
- **Payment Integration**: Secure payment processing with Paystack
- **Admin Dashboard**: Comprehensive analytics, reporting, and management tools
- **Responsive Design**: Mobile-friendly interface for all devices

## Tech Stack

### Backend
- **Laravel 10** - PHP framework
- **MySQL** - Database
- **Laravel Sanctum** - API authentication
- **Spatie Laravel Permission** - Role and permission management

### Frontend
- **React 18** - JavaScript library
- **Material-UI** - Component library
- **Chart.js** - Data visualization
- **Axios** - HTTP client

## Quick Start

### Prerequisites
- PHP 8.1+
- Node.js 18+
- MySQL 8.0+
- Composer
- npm

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admission-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   composer install
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   php artisan serve
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api

## Deployment

### AWS Deployment
The application is configured for deployment on AWS with:
- **EC2** - Web server
- **RDS** - Database
- **S3** - File storage
- **GitHub Actions** - CI/CD pipeline

### CI/CD Pipeline
Automated deployment pipeline that:
1. Runs tests on push to main/master branch
2. Builds the frontend application
3. Deploys to AWS EC2 instance
4. Restarts services automatically

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License. 