# Dynamic Form Fee Feature

## Overview
The dynamic form fee feature allows administrators to set program-specific application form fees while maintaining the ability to use a default form fee from the settings. This provides flexibility in pricing different programs based on their complexity, duration, or market demand.

## Key Features

### 1. Program-Level Form Fee Control
- **Default Form Fee**: Programs can use the global form fee set in the admin settings
- **Custom Form Fee**: Programs can have their own specific form fee amount
- **Toggle Control**: Easy checkbox to switch between default and custom form fees

### 2. Database Changes

#### Programs Table Updates
```sql
ALTER TABLE programs ADD COLUMN use_default_form_fee BOOLEAN DEFAULT TRUE;
ALTER TABLE programs ADD COLUMN form_fee DECIMAL(10,2) NULL;
```

#### New Fields
- `use_default_form_fee`: Boolean flag to determine if program uses default form fee
- `form_fee`: Custom form fee amount for the program (nullable)

### 3. Backend Implementation

#### Program Model Updates
- Added `use_default_form_fee` and `form_fee` to fillable fields
- Added proper casting for the new fields
- Added `getEffectiveFormFeeAttribute()` method to calculate the actual form fee

#### Effective Form Fee Logic
```php
public function getEffectiveFormFeeAttribute()
{
    if ($this->use_default_form_fee) {
        return Setting::get('form_amount', 5000);
    }
    return $this->form_fee ?? Setting::get('form_amount', 5000);
}
```

#### Payment Controller Updates
- Modified form purchase logic to use program-specific form fees
- Applications now load their associated program to get the correct form fee
- Fallback to default form fee if no program is associated

#### API Endpoints
- `GET /programs/{id}/form-fee` - Get form fee for a specific program
- Updated program management endpoints to handle form fee fields

### 4. Frontend Implementation

#### Program Management Interface
- Added form fee configuration section in program create/edit forms
- Checkbox to toggle between default and custom form fees
- Conditional form fee input field
- Form fee display in program listing table

#### Application Form Updates
- Added program selection dropdown after department selection
- Dynamic program loading based on selected department
- Real-time form fee display when program is selected
- Program details preview with fees and duration

#### Form Fee Display
- Shows program-specific form fee when available
- Falls back to default form fee when program uses default
- Clear indication of fee source (default vs custom)

## User Workflow

### For Administrators

#### Setting Up Program Form Fees
1. Navigate to Admin Dashboard → Programs
2. Create new program or edit existing program
3. Configure program details (name, type, duration, etc.)
4. In the form fee section:
   - Check "Use default form fee from settings" to use global fee
   - Uncheck to set custom form fee
   - Enter custom amount if not using default
5. Save the program

#### Managing Form Fees
- View all programs with their form fee configuration
- Filter and search programs by form fee type
- Export program data including form fee information
- Bulk update form fees if needed

### For Applicants

#### Application Process
1. Select admission session
2. Choose department from searchable dropdown
3. Select program from department-specific programs
4. View program details including form fee
5. Complete application form
6. Pay the program-specific form fee

#### Form Fee Transparency
- Clear display of form fee before payment
- Program details shown during selection
- Fee breakdown in application summary

## Technical Implementation

### Database Relationships
```
Program → Department (Many-to-One)
Application → Program (Many-to-One)
Payment → Application (Many-to-One)
```

### Form Fee Calculation Flow
1. User selects program in application form
2. Frontend fetches program form fee via API
3. Form fee is displayed to user
4. During payment, backend calculates effective form fee
5. Payment is processed with correct amount

### Validation Rules
- Form fee must be positive number when custom
- Program must exist and be active
- Department must have active programs
- Form fee cannot exceed reasonable limits

## Benefits

### For Institutions
- **Flexible Pricing**: Set different fees for different program types
- **Revenue Optimization**: Price programs based on demand and complexity
- **Market Alignment**: Adjust fees to match market expectations
- **Administrative Control**: Easy management of program-specific fees

### For Applicants
- **Transparent Pricing**: Know exact form fee before applying
- **Program Comparison**: Compare fees across different programs
- **Informed Decisions**: Make application decisions based on cost
- **Clear Expectations**: No hidden fees or surprises

### For System Administrators
- **Centralized Management**: Control fees from admin interface
- **Audit Trail**: Track fee changes and program configurations
- **Reporting**: Generate reports on form fee revenue by program
- **Scalability**: Easy to add new programs with custom fees

## Configuration Examples

### Undergraduate Programs
- **Computer Science**: ₦5,000 (default)
- **Medicine**: ₦10,000 (custom - higher demand)
- **Business Admin**: ₦5,000 (default)

### Postgraduate Programs
- **MBA**: ₦7,500 (custom - premium program)
- **MSc Computer Science**: ₦6,000 (custom - specialized)

### Diploma Programs
- **National Diploma**: ₦3,000 (custom - lower cost)
- **Higher National Diploma**: ₦4,000 (custom - intermediate)

## Migration and Deployment

### Database Migration
```bash
php artisan migrate
```

### Data Seeding
```bash
php artisan db:seed --class=ProgramSeeder
```

### Configuration Steps
1. Run database migrations
2. Update existing programs with form fee settings
3. Test program selection in application form
4. Verify payment processing with program-specific fees
5. Update admin documentation

## Future Enhancements

### Planned Features
- **Bulk Form Fee Updates**: Update multiple programs at once
- **Fee History Tracking**: Track form fee changes over time
- **Seasonal Pricing**: Different fees for different admission periods
- **Discount Management**: Apply discounts to specific programs
- **Payment Plans**: Installment options for higher form fees

### Technical Improvements
- **Caching**: Cache program form fees for better performance
- **Analytics**: Form fee revenue analytics and reporting
- **Integration**: Connect with external payment systems
- **Notifications**: Alert administrators of fee changes

## Troubleshooting

### Common Issues
1. **Form fee not displaying**: Check if program is active and has form fee set
2. **Payment amount mismatch**: Verify program association in application
3. **Program not loading**: Ensure department has active programs
4. **Validation errors**: Check form fee validation rules

### Debug Steps
1. Check program form fee configuration in admin panel
2. Verify API responses for program form fee endpoint
3. Review payment initialization logs
4. Test with different program types and fee configurations

## Security Considerations

### Data Protection
- Form fee data is validated and sanitized
- Payment amounts are verified server-side
- Program associations are validated before payment
- Audit logs track fee changes

### Access Control
- Only administrators can modify form fees
- Program selection is restricted to active programs
- Payment processing includes security checks
- Form fee changes require proper permissions 