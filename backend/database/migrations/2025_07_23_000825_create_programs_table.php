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
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['undergraduate', 'postgraduate', 'national_diploma', 'higher_national_diploma', 'certificate', 'diploma'])->default('undergraduate');
            $table->integer('duration_years')->default(4);
            $table->integer('duration_semesters')->default(8);
            $table->decimal('tuition_fee', 10, 2)->nullable();
            $table->decimal('acceptance_fee', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
