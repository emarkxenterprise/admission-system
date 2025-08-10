<?php

namespace Database\Seeders;

use App\Models\Faculty;
use Illuminate\Database\Seeder;

class FacultySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faculties = [
            [
                'name' => 'Faculty of Engineering',
                'code' => 'ENG',
                'description' => 'Faculty of Engineering and Technology',
                'is_active' => true,
            ],
            [
                'name' => 'Faculty of Science',
                'code' => 'SCI',
                'description' => 'Faculty of Science and Technology',
                'is_active' => true,
            ],
            [
                'name' => 'Faculty of Business and Management',
                'code' => 'BUS',
                'description' => 'Faculty of Business Administration and Management Sciences',
                'is_active' => true,
            ],
            [
                'name' => 'Faculty of Arts and Humanities',
                'code' => 'ARTS',
                'description' => 'Faculty of Arts, Humanities and Social Sciences',
                'is_active' => true,
            ],
            [
                'name' => 'Faculty of Law',
                'code' => 'LAW',
                'description' => 'Faculty of Law and Legal Studies',
                'is_active' => true,
            ],
            [
                'name' => 'Faculty of Medicine',
                'code' => 'MED',
                'description' => 'Faculty of Medicine and Health Sciences',
                'is_active' => true,
            ],
            [
                'name' => 'Faculty of Education',
                'code' => 'EDU',
                'description' => 'Faculty of Education and Training',
                'is_active' => true,
            ],
        ];

        foreach ($faculties as $faculty) {
            Faculty::updateOrCreate(
                ['code' => $faculty['code']],
                $faculty
            );
        }
    }
} 