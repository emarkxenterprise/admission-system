# Program Management Feature

## Overview
The program management system allows administrators to create and manage academic programs within departments. Programs represent different levels of study such as undergraduate, postgraduate, national diploma, etc.

## Program Types
- **Undergraduate**: Bachelor's degree programs (typically 4-5 years)
- **Postgraduate**: Master's and PhD programs (typically 1-3 years)
- **National Diploma (ND)**: 2-year diploma programs
- **Higher National Diploma (HND)**: Advanced 2-year diploma programs
- **Certificate**: Short-term certificate programs
- **Diploma**: General diploma programs

## Program Attributes

### Basic Information
- **Name**: Full program name (e.g., "Bachelor of Science in Computer Science")
- **Code**: Unique program code (e.g., "BSC-CS")
- **Description**: Detailed program description
- **Type**: Program level (undergraduate, postgraduate, etc.)
- **Department**: Associated academic department

### Duration
- **Duration Years**: Number of years to complete the program
- **Duration Semesters**: Number of semesters in the program

### Financial Information
- **Tuition Fee**: Annual tuition fee amount
- **Acceptance Fee**: One-time acceptance fee for admitted students

### Status
- **Active**: Whether the program is currently accepting applications

## Database Structure

### Programs Table
```sql
CREATE TABLE programs (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    type ENUM('undergraduate', 'postgraduate', 'national_diploma', 'higher_national_diploma', 'certificate', 'diploma') DEFAULT 'undergraduate',
    duration_years INT DEFAULT 4,
    duration_semesters INT DEFAULT 8,
    tuition_fee DECIMAL(10,2),
    acceptance_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    department_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);
```

### Relationships
- **Program → Department**: Many-to-one relationship
- **Program → Application**: One-to-many relationship
- **Program → Admission**: One-to-many relationship

## API Endpoints

### Admin Endpoints
- `GET /admin/programs` - Get all programs
- `POST /admin/programs` - Create new program
- `PUT /admin/programs/{id}` - Update program
- `DELETE /admin/programs/{id}` - Delete program

### Public Endpoints
- `GET /departments/{id}/programs` - Get programs for a specific department

## Frontend Features

### Program Management Interface
- **List View**: Display all programs with filtering and search
- **Create Form**: Add new programs with validation
- **Edit Form**: Update existing program details
- **Delete Functionality**: Remove programs (with validation)
- **Export Options**: Export program data to CSV/Excel

### Program Selection in Applications
- Programs are displayed when selecting departments
- Applicants can choose specific programs within departments
- Program information is included in application details

## Admin Workflow

### Creating a Program
1. Navigate to Admin Dashboard → Programs
2. Click "Add New Program"
3. Fill in program details:
   - Name and code
   - Select program type
   - Choose department
   - Set duration
   - Configure fees
   - Add description
4. Save the program

### Managing Programs
- View all programs in a table format
- Filter by department, type, or status
- Edit program details including fees and duration
- Deactivate programs that are no longer offered
- Delete programs (only if no applications exist)

### Program Statistics
- View number of applications per program
- Track approved vs pending applications
- Monitor program popularity

## Integration with Existing Features

### Application System
- Applications now include program selection
- Program fees are used for payment calculations
- Program information appears in application details

### Admission System
- Admission offers are linked to specific programs
- Program fees determine acceptance fee amounts
- Program duration affects admission timelines

### Reporting
- Program-specific application reports
- Revenue tracking by program
- Enrollment statistics by program type

## Validation Rules

### Program Creation/Update
- Name: Required, max 255 characters
- Code: Required, unique, max 20 characters
- Type: Required, must be valid program type
- Duration Years: Required, 1-10 years
- Duration Semesters: Required, 1-20 semesters
- Department: Required, must exist
- Fees: Optional, must be positive numbers

### Deletion Restrictions
- Cannot delete programs with existing applications
- Cannot delete programs with active admissions

## Benefits

### For Administrators
- **Better Organization**: Programs are clearly categorized by type and department
- **Flexible Pricing**: Set different fees for different program types
- **Improved Reporting**: Track applications and revenue by program
- **Enhanced Management**: Easy program lifecycle management

### For Applicants
- **Clear Choices**: See all available programs within departments
- **Transparent Pricing**: Know program fees before applying
- **Better Information**: Detailed program descriptions and duration

### For the Institution
- **Structured Data**: Organized academic program hierarchy
- **Financial Control**: Program-specific fee management
- **Analytics**: Better insights into program popularity and performance

## Future Enhancements

### Planned Features
- Program prerequisites and requirements
- Program capacity limits
- Program-specific admission criteria
- Program accreditation information
- Program curriculum details
- Program alumni tracking

### Technical Improvements
- Program search and filtering
- Program comparison tools
- Program recommendation system
- Integration with external education databases 