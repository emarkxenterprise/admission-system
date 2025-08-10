<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('admissions', function (Blueprint $table) {
            $table->boolean('acceptance_fee_paid')->default(false)->after('admission_accepted');
            $table->boolean('admission_rejected')->default(false)->after('acceptance_fee_paid');
            $table->timestamp('rejection_date')->nullable()->after('admission_rejected');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admissions', function (Blueprint $table) {
            $table->dropColumn(['acceptance_fee_paid', 'admission_rejected', 'rejection_date']);
        });
    }
};
