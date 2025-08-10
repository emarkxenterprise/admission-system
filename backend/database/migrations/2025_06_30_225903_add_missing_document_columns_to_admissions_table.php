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
            // Add missing document columns if they don't exist
            if (!Schema::hasColumn('admissions', 'transcript')) {
                $table->string('transcript')->nullable();
            }
            if (!Schema::hasColumn('admissions', 'certificate')) {
                $table->string('certificate')->nullable();
            }
            if (!Schema::hasColumn('admissions', 'id_card')) {
                $table->string('id_card')->nullable();
            }
            if (!Schema::hasColumn('admissions', 'passport')) {
                $table->string('passport')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admissions', function (Blueprint $table) {
            $columns = ['transcript', 'certificate', 'id_card', 'passport'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('admissions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
