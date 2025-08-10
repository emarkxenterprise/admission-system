<?php

namespace Database\Seeders;

use App\Models\AdmissionSession;
use Illuminate\Database\Seeder;

class AdmissionSessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sessions = [
            [
                'name' => '2024/2025 Academic Session',
                'academic_year' => '2024/2025',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'form_price' => 5000.00,
                'admission_fee' => 50000.00,
                'status' => 'active',
                'description' => 'Admission for the 2024/2025 academic session',
            ],
            [
                'name' => '2025/2026 Academic Session',
                'academic_year' => '2025/2026',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'form_price' => 5500.00,
                'admission_fee' => 55000.00,
                'status' => 'inactive',
                'description' => 'Admission for the 2025/2026 academic session',
            ],
        ];

        foreach ($sessions as $session) {
            AdmissionSession::updateOrCreate(
                ['academic_year' => $session['academic_year']],
                $session
            );
        }
    }
} 