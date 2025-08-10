<?php

namespace Database\Seeders;

use App\Models\Staff;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create super admin
        $superAdmin = Staff::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'phone' => '08012345678',
                'password' => Hash::make('password'),
                'employee_id' => 'EMP001',
                'position' => 'System Administrator',
                'department' => 'IT',
                'active' => true,
            ]
        );
        $superAdmin->assignRole('super-admin');

        // Create admin
        $admin = Staff::updateOrCreate(
            ['email' => 'admin2@example.com'],
            [
                'name' => 'Admin User',
                'phone' => '08087654321',
                'password' => Hash::make('password'),
                'employee_id' => 'EMP002',
                'position' => 'Administrator',
                'department' => 'Administration',
                'active' => true,
            ]
        );
        $admin->assignRole('admin');

        // Create accountant
        $accountant = Staff::updateOrCreate(
            ['email' => 'accountant@example.com'],
            [
                'name' => 'John Accountant',
                'phone' => '08011223344',
                'password' => Hash::make('password'),
                'employee_id' => 'EMP003',
                'position' => 'Accountant',
                'department' => 'Finance',
                'active' => true,
            ]
        );
        $accountant->assignRole('accountant');

        // Create admission manager
        $admissionManager = Staff::updateOrCreate(
            ['email' => 'admission@example.com'],
            [
                'name' => 'Jane Admission Manager',
                'phone' => '08055667788',
                'password' => Hash::make('password'),
                'employee_id' => 'EMP004',
                'position' => 'Admission Manager',
                'department' => 'Admissions',
                'active' => true,
            ]
        );
        $admissionManager->assignRole('admission-manager');
    }
}
