<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'phone' => '08012345678',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );
        $admin->assignRole('super-admin');

        // Create sample users
        $accountant = User::updateOrCreate(
            ['email' => 'john@example.com'],
            [
                'name' => 'John Doe',
                'phone' => '08087654321',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );
        $accountant->assignRole('accountant');

        $admissionManager = User::updateOrCreate(
            ['email' => 'jane@example.com'],
            [
                'name' => 'Jane Smith',
                'phone' => '08011223344',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );
        $admissionManager->assignRole('admission-manager');
    }
} 