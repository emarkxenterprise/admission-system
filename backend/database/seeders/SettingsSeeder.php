<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultSettings = [
            [
                'key' => 'school_name',
                'value' => 'Admission Portal',
                'type' => 'string',
            ],
            [
                'key' => 'school_motto',
                'value' => 'Excellence in Education',
                'type' => 'string',
            ],
            [
                'key' => 'school_address',
                'value' => 'University Address, City, State',
                'type' => 'string',
            ],
            [
                'key' => 'school_phone',
                'value' => '+234 XXX XXX XXXX',
                'type' => 'string',
            ],
            [
                'key' => 'school_email',
                'value' => 'info@university.edu.ng',
                'type' => 'string',
            ],
            [
                'key' => 'registrar_name',
                'value' => 'Registrar',
                'type' => 'string',
            ],
            [
                'key' => 'registrar_title',
                'value' => 'Registrar',
                'type' => 'string',
            ],
            [
                'key' => 'form_amount',
                'value' => 5000,
                'type' => 'number',
            ],
            [
                'key' => 'acceptance_fee',
                'value' => 50000,
                'type' => 'number',
            ],
            [
                'key' => 'currency',
                'value' => 'NGN',
                'type' => 'string',
            ],
            [
                'key' => 'paystack_public_key',
                'value' => 'pk_test_your_public_key_here',
                'type' => 'string',
            ],
            [
                'key' => 'paystack_secret_key',
                'value' => 'sk_test_your_secret_key_here',
                'type' => 'string',
            ],
        ];

        foreach ($defaultSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
} 