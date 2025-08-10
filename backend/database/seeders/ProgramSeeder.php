<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\Department;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programs = [
            // Computer Science Programs
            [
                'name' => 'Bachelor of Science in Computer Science',
                'code' => 'BSC-CS',
                'description' => 'A comprehensive program covering computer science fundamentals, programming, algorithms, and software engineering.',
                'type' => 'undergraduate',
                'duration_years' => 4,
                'duration_semesters' => 8,
                'tuition_fee' => 150000.00,
                'acceptance_fee' => 50000.00,
                'use_default_form_fee' => true,
                'form_fee' => null,
                'is_active' => true,
                'department_id' => Department::where('code', 'CSC')->first()->id,
            ],
            [
                'name' => 'Master of Science in Computer Science',
                'code' => 'MSC-CS',
                'description' => 'Advanced program focusing on research and specialized areas in computer science.',
                'type' => 'postgraduate',
                'duration_years' => 2,
                'duration_semesters' => 4,
                'tuition_fee' => 200000.00,
                'acceptance_fee' => 75000.00,
                'use_default_form_fee' => false,
                'form_fee' => 7500.00,
                'is_active' => true,
                'department_id' => Department::where('code', 'CSC')->first()->id,
            ],
            [
                'name' => 'National Diploma in Computer Science',
                'code' => 'ND-CS',
                'description' => 'Practical-oriented program for computer science and information technology.',
                'type' => 'national_diploma',
                'duration_years' => 2,
                'duration_semesters' => 4,
                'tuition_fee' => 100000.00,
                'acceptance_fee' => 35000.00,
                'use_default_form_fee' => false,
                'form_fee' => 3000.00,
                'is_active' => true,
                'department_id' => Department::where('code', 'CSC')->first()->id,
            ],

            // Engineering Programs
            [
                'name' => 'Bachelor of Engineering in Electrical Engineering',
                'code' => 'BENG-EE',
                'description' => 'Comprehensive electrical engineering program covering power systems, electronics, and telecommunications.',
                'type' => 'undergraduate',
                'duration_years' => 5,
                'duration_semesters' => 10,
                'tuition_fee' => 180000.00,
                'acceptance_fee' => 60000.00,
                'is_active' => true,
                'department_id' => Department::where('code', 'EEE')->first()->id,
            ],
            [
                'name' => 'Bachelor of Engineering in Mechanical Engineering',
                'code' => 'BENG-ME',
                'description' => 'Mechanical engineering program focusing on design, manufacturing, and mechanical systems.',
                'type' => 'undergraduate',
                'duration_years' => 5,
                'duration_semesters' => 10,
                'tuition_fee' => 180000.00,
                'acceptance_fee' => 60000.00,
                'is_active' => true,
                'department_id' => Department::where('code', 'MEE')->first()->id,
            ],
            [
                'name' => 'National Diploma in Electrical Engineering',
                'code' => 'ND-EE',
                'description' => 'Practical electrical engineering program for technicians.',
                'type' => 'national_diploma',
                'duration_years' => 2,
                'duration_semesters' => 4,
                'tuition_fee' => 120000.00,
                'acceptance_fee' => 40000.00,
                'is_active' => true,
                'department_id' => Department::where('code', 'EEE')->first()->id,
            ],

            // Business Programs
            [
                'name' => 'Bachelor of Science in Business Administration',
                'code' => 'BSC-BA',
                'description' => 'Comprehensive business administration program covering management, marketing, and finance.',
                'type' => 'undergraduate',
                'duration_years' => 4,
                'duration_semesters' => 8,
                'tuition_fee' => 140000.00,
                'acceptance_fee' => 45000.00,
                'is_active' => true,
                'department_id' => Department::where('code', 'BUS')->first()->id,
            ],
            [
                'name' => 'Master of Business Administration',
                'code' => 'MBA',
                'description' => 'Advanced business administration program for professionals.',
                'type' => 'postgraduate',
                'duration_years' => 2,
                'duration_semesters' => 4,
                'tuition_fee' => 250000.00,
                'acceptance_fee' => 80000.00,
                'is_active' => true,
                'department_id' => Department::where('code', 'BUS')->first()->id,
            ],
            [
                'name' => 'Bachelor of Science in Accounting',
                'code' => 'BSC-ACC',
                'description' => 'Accounting and finance program preparing students for professional accounting careers.',
                'type' => 'undergraduate',
                'duration_years' => 4,
                'duration_semesters' => 8,
                'tuition_fee' => 150000.00,
                'acceptance_fee' => 50000.00,
                'is_active' => true,
                'department_id' => Department::where('code', 'ACC')->first()->id,
            ],

            // Law Programs
            [
                'name' => 'Bachelor of Laws',
                'code' => 'LLB',
                'description' => 'Comprehensive law program preparing students for legal practice.',
                'type' => 'undergraduate',
                'duration_years' => 5,
                'duration_semesters' => 10,
                'tuition_fee' => 160000.00,
                'acceptance_fee' => 55000.00,
                'is_active' => true,
                'department_id' => Department::where('code', 'LAW')->first()->id,
            ],

            // Medical Programs
            [
                'name' => 'Bachelor of Medicine and Bachelor of Surgery',
                'code' => 'MBBS',
                'description' => 'Medical program preparing students for medical practice.',
                'type' => 'undergraduate',
                'duration_years' => 6,
                'duration_semesters' => 12,
                'tuition_fee' => 300000.00,
                'acceptance_fee' => 100000.00,
                'use_default_form_fee' => false,
                'form_fee' => 10000.00,
                'is_active' => true,
                'department_id' => Department::where('code', 'MED')->first()->id,
            ],
            [
                'name' => 'Bachelor of Pharmacy',
                'code' => 'BPharm',
                'description' => 'Pharmacy program preparing students for pharmaceutical practice.',
                'type' => 'undergraduate',
                'duration_years' => 5,
                'duration_semesters' => 10,
                'tuition_fee' => 200000.00,
                'acceptance_fee' => 70000.00,
                'is_active' => true,
                'department_id' => Department::where('code', 'PHA')->first()->id,
            ],
        ];

        foreach ($programs as $program) {
            Program::updateOrCreate(
                ['code' => $program['code']],
                $program
            );
        }
    }
}
