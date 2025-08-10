# Admission Processing System - Setup Instructions

This guide will help you set up the complete Admission Processing System with Laravel backend and React frontend.

## Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 16 or higher
- MySQL 8.0 or higher
- Paystack account (for payment processing)

## Backend Setup (Laravel)

### 1. Install Dependencies
```bash
cd backend
composer install
```

### 2. Environment Configuration
```bash
cp env.example .env
```

Edit the `.env` file and configure:
- Database connection details
- Paystack API keys (get from your Paystack dashboard)
- App URL and other settings

### 3. Generate Application Key
```bash
php artisan key:generate
```

### 4. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE admission_system;
exit

# Run migrations
php artisan migrate

# Seed the database
php artisan db:seed
```

### 5. Configure Paystack
1. Sign up at [Paystack](https://paystack.com)
2. Get your API keys from the dashboard
3. Update the `.env` file with your keys:
   ```
   PAYSTACK_SECRET_KEY=sk_test_your_secret_key
   PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
   PAYSTACK_MERCHANT_EMAIL=your_email@example.com
   ```

### 6. Start Laravel Server
```bash
php artisan serve
```

The backend will be available at `http://localhost:8000`

## Frontend Setup (React)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
```bash
cp env.example .env
```

Edit the `.env` file:
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### 3. Start Development Server
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Default Login Credentials

### Admin User
- Email: admin@example.com
- Password: password

### Sample Users
- Email: john@example.com
- Password: password
- Email: jane@example.com
- Password: password

## Features Overview

### User Features
1. **Registration & Login**: Secure authentication system
2. **Application Form**: Comprehensive admission application with validation
3. **Payment Processing**: Paystack integration for form purchase and admission fees
4. **Application Tracking**: View application status and history
5. **Payment History**: Track all payment transactions

### Admin Features
1. **Dashboard**: Overview of applications, payments, and statistics
2. **Application Management**: Review, approve, reject, or admit applications
3. **Department Categorization**: Filter applications by department/course
4. **Payment Reports**: View payment history and revenue reports
5. **User Management**: Monitor user registrations and activities

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Admissions
- `GET /api/admissions` - Get user's applications
- `POST /api/admissions` - Submit new application
- `GET /api/admissions/{id}` - Get specific application
- `PUT /api/admissions/{id}` - Update application (accept admission)
- `GET /api/admissions/sessions/available` - Get available sessions
- `GET /api/admissions/departments/available` - Get available departments

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Admin (Protected)
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/applications` - Get all applications with filters
- `PUT /api/admin/applications/{id}/status` - Update application status
- `GET /api/admin/applications/{id}` - Get application details
- `GET /api/admin/departments` - Get departments with statistics
- `GET /api/admin/payments` - Get payment reports

## Database Structure

### Tables
1. **users** - User accounts and authentication
2. **departments** - Academic departments/courses
3. **admission_sessions** - Admission periods with pricing
4. **admissions** - Application records
5. **payments** - Payment transactions

### Relationships
- Users have many Admissions
- Users have many Payments
- Admissions belong to Department and AdmissionSession
- Payments belong to User and Admission

## Payment Flow

1. **Form Purchase**: User pays for admission form
2. **Application Submission**: User submits application after form payment
3. **Admin Review**: Admin reviews and updates application status
4. **Admission Fee**: If admitted, user pays admission fee
5. **Acceptance**: User accepts admission offer

## Security Features

- Laravel Sanctum for API authentication
- Admin middleware for protected routes
- Input validation and sanitization
- Secure payment processing with Paystack
- Password hashing and token management

## Customization

### Adding New Departments
1. Add department in the database seeder
2. Or use the admin interface to manage departments

### Modifying Payment Amounts
1. Update admission session pricing in the database
2. Or create new admission sessions with different pricing

### Styling Changes
1. Modify Tailwind CSS classes in React components
2. Update color scheme in `tailwind.config.js`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Laravel CORS is configured properly
2. **Payment Failures**: Verify Paystack API keys and webhook configuration
3. **Database Connection**: Check MySQL credentials and database existence
4. **Port Conflicts**: Ensure ports 8000 (Laravel) and 3000 (React) are available

### Logs
- Laravel logs: `backend/storage/logs/laravel.log`
- React build errors: Check browser console

## Production Deployment

### Backend
1. Set `APP_ENV=production` in `.env`
2. Configure production database
3. Set up SSL certificates
4. Configure web server (Apache/Nginx)

### Frontend
1. Build production version: `npm run build`
2. Deploy to web server or CDN
3. Update API URL to production endpoint

## Support

For issues and questions:
1. Check the logs for error details
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Test API endpoints with tools like Postman

## License

This project is licensed under the MIT License. 