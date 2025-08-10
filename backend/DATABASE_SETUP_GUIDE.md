# Database Setup Guide

After uninstalling XAMPP, follow these steps to reinstate your project database and seeds.

## Step 1: Install MySQL Server

### Option A: MySQL Community Server (Recommended)
1. Download from: https://dev.mysql.com/downloads/mysql/
2. Choose "MySQL Installer for Windows"
3. Run installer as Administrator
4. Choose "Developer Default" or "Server only"
5. Set root password (remember this!)
6. Complete installation

### Option B: MariaDB (Alternative)
1. Download from: https://mariadb.org/download/
2. Follow installation wizard
3. Set root password

## Step 2: Update Environment Configuration

Edit your `.env` file and update the database settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=admission_system
DB_USERNAME=root
DB_PASSWORD=your_mysql_root_password
```

## Step 3: Create Database

Open Command Prompt or PowerShell and run:

```bash
mysql -u root -p
```

Enter your MySQL root password, then:

```sql
CREATE DATABASE admission_system;
exit;
```

## Step 4: Run Migrations and Seeds

In your backend directory, run:

```bash
# Run migrations
php artisan migrate

# Run seeds
php artisan db:seed
```

## Step 5: Verify Setup

Check that all tables are created:

```bash
php artisan migrate:status
```

## Available Seeders

Your project includes these seeders:

1. **DatabaseSeeder.php** - Main seeder that calls all others
2. **AdminRolesAndPermissionsSeeder.php** - Creates admin roles and permissions
3. **DepartmentSeeder.php** - Creates academic departments
4. **FacultySeeder.php** - Creates faculty data
5. **StaffSeeder.php** - Creates staff accounts
6. **UserSeeder.php** - Creates sample users
7. **SettingsSeeder.php** - Creates application settings
8. **AdmissionSessionSeeder.php** - Creates admission sessions
9. **ProgramSeeder.php** - Creates academic programs

## Default Login Credentials

After running seeds, you can login with:

### Admin User
- Email: admin@example.com
- Password: password

### Sample Users
- Email: john@example.com
- Password: password
- Email: jane@example.com
- Password: password

## Troubleshooting

### Common Issues

1. **"MySQL not found" error**
   - Ensure MySQL is installed and added to PATH
   - Restart Command Prompt after installation

2. **"Access denied" error**
   - Check your MySQL root password
   - Verify username in .env file

3. **"Database doesn't exist" error**
   - Create the database manually: `CREATE DATABASE admission_system;`

4. **Migration errors**
   - Check if tables already exist
   - Run: `php artisan migrate:fresh --seed` (WARNING: This will delete all data)

### Quick Setup Scripts

Use the provided scripts for automated setup:

- **setup_database.bat** - Windows batch script
- **setup_database.ps1** - PowerShell script

Run either script from the backend directory after installing MySQL.

## Next Steps

After database setup:

1. Start Laravel server: `php artisan serve`
2. Start React frontend: `cd ../frontend && npm start`
3. Access the application at http://localhost:3000 