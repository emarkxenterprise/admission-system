<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminRolesAndPermissionsSeeder::class,
            UserSeeder::class,
            FacultySeeder::class,
            DepartmentSeeder::class,
            ProgramSeeder::class,
            AdmissionSessionSeeder::class,
            SettingsSeeder::class,
        ]);
    }
} 