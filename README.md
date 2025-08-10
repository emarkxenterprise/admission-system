# PRTL - Portal for Registration and Transfer of Learning

A comprehensive university admission portal built with Laravel backend and React frontend.

## Features

### Application Form
- **Multi-step application process** with validation
- **Searchable department selection** - Users can type to search for departments by name, code, or faculty
- **Keyboard navigation** - Arrow keys, Enter, and Escape support for department selection
- **Real-time filtering** - Instant search results as users type
- **Faculty grouping** - Departments are organized by faculties when available
- **Document upload** support for transcripts, certificates, ID cards, and passports

### Admin Dashboard
- **Comprehensive statistics** including faculty-wise breakdowns
- **Application management** with filtering and search capabilities
- **Department and faculty management** with CRUD operations
- **Admission offer management** with bulk operations
- **User and staff management** with role-based permissions

### Faculty System
- **Faculty management** - Group departments into faculties
- **Faculty statistics** - Dashboard shows faculty-wise application counts
- **Permission-based access** - Role-based access control for faculty management

### Searchable Department Selection

The application form now includes an enhanced department selection feature:

#### Features:
- **Real-time search**: Type to filter departments instantly
- **Multi-field search**: Search by department name, code, or faculty name
- **Keyboard navigation**: 
  - Arrow keys to navigate options
  - Enter to select highlighted option
  - Escape to close dropdown
- **Visual feedback**: Selected items are highlighted
- **Faculty grouping**: Departments are shown with their faculty names
- **Responsive design**: Works on all screen sizes

#### Usage:
1. Click on the department field or start typing
2. Type any part of the department name, code, or faculty name
3. Use arrow keys to navigate through results
4. Press Enter or click to select a department
5. Press Escape to close the dropdown

#### Technical Implementation:
- Uses React hooks for state management
- Implements click-outside detection to close dropdown
- Debounced search for performance
- Accessible keyboard navigation
- Mobile-friendly touch interactions

## Installation

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Public Endpoints
- `GET /api/sessions` - Get available admission sessions
- `GET /api/departments` - Get departments with faculty grouping
- `POST /api/applications` - Submit new application
- `GET /api/applications/{id}` - Get specific application

### Admin Endpoints
- `GET /api/admin/departments` - Get all departments
- `POST /api/admin/departments` - Create new department
- `GET /api/admin/faculties` - Get all faculties
- `POST /api/admin/faculties` - Create new faculty
- `GET /api/admin/applications` - Get applications with filtering

## Database Structure

### Key Tables
- `users` - Student accounts
- `staff` - Admin and staff accounts
- `faculties` - Faculty information
- `departments` - Department information (linked to faculties)
- `applications` - Student applications
- `admission_sessions` - Admission periods
- `admissions` - Admission offers

## Permissions

### Staff Roles
- **super-admin**: Full system access
- **admin**: Administrative access including faculty management
- **staff**: Limited administrative access

### Faculty Permissions
- `view-faculties` - View faculty information
- `manage-faculties` - Create, edit, delete faculties

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 