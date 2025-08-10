<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('description')->nullable()->after('currency');
        });

        // Update the type enum to include acceptance_fee
        DB::statement("ALTER TABLE payments MODIFY COLUMN type ENUM('form_purchase', 'admission_fee', 'acceptance_fee')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('description');
        });

        // Revert the type enum
        DB::statement("ALTER TABLE payments MODIFY COLUMN type ENUM('form_purchase', 'admission_fee')");
    }
};
