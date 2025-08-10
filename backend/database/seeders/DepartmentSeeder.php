<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Computer Science',
                'code' => 'CSC',
                'description' => 'Department of Computer Science and Information Technology',
                'is_active' => true,
                'faculty_id' => \App\Models\Faculty::where('code', 'SCI')->first()->id,
            ],
            [
                'name' => 'Electrical Engineering',
                'code' => 'EEE',
                'description' => 'Department of Electrical and Electronic Engineering',
                'is_active' => true,
                'faculty_id' => \App\Models\Faculty::where('code', 'ENG')->first()->id,
            ],
            [
                'name' => 'Mechanical Engineering',
                'code' => 'MEE',
                'description' => 'Department of Mechanical Engineering',
                'is_active' => true,
                'faculty_id' => \App\Models\Faculty::where('code', 'ENG')->first()->id,
            ],
            [
                'name' => 'Civil Engineering',
                'code' => 'CVE',
                'description' => 'Department of Civil Engineering',
                'is_active' => true,
                'faculty_id' => \App\Models\Faculty::where('code', 'ENG')->first()->id,
            ],
            [
                'name' => 'Business Administration',
                'code' => 'BUS',
                'description' => 'Department of Business Administration',
                'is_active' => true,
                'faculty_id' => \App\Models\Faculty::where('code', 'BUS')->first()->id,
            ],
            [
                'name' => 'Accounting',
                'code' => 'ACC',
                'description' => 'Department of Accounting and Finance',
                'is_active' => true,
                'faculty_id' => \App\Models\Faculty::where('code', 'BUS')->first()->id,
            ],
            [
                'name' => 'Economics',
                'code' => 'ECO',
                'description' => 'Department of Economics',
                'is_active' => true,
                'faculty_id' => \App\Models\Faculty::where('code', 'BUS')->first()->id,
            ],
            [
                'name' => 'Law',
                'code' => 'LAW',
                'description' => 'Department of Law',
                'is_active' => true,
                'faculty_id' => \App\Models\Faculty::where('code', 'LAW')->first()->id,
            ],
            [
                'name' => 'Medicine',
                'code' => 'MED',
                'description' => 'Department of Medicine and Surgery',
                'is_active' => true,
                'faculty_id' => \App\Models\Faculty::where('code', 'MED')->first()->id,
            ],
            [
                'name' => 'Pharmacy',
                'code' => 'PHA',
                'description' => 'Department of Pharmacy',
                'is_active' => true,
                'faculty_id' => \App\Models\Faculty::where('code', 'MED')->first()->id,
            ],
        ];

        foreach ($departments as $department) {
            Department::updateOrCreate(
                ['code' => $department['code']],
                $department
            );
        }
    }
} 