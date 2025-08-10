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
        Schema::table('applications', function (Blueprint $table) {
            // Make legacy academic fields nullable since we're now using academic_backgrounds table
            $table->string('previous_school')->nullable()->change();
            $table->string('previous_qualification')->nullable()->change();
            $table->year('graduation_year')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            // Revert back to non-nullable (only if safe to do so)
            $table->string('previous_school')->nullable(false)->change();
            $table->string('previous_qualification')->nullable(false)->change();
            $table->year('graduation_year')->nullable(false)->change();
        });
    }
};