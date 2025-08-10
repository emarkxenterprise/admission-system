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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('admission_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->string('application_number')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('nationality');
            $table->string('state_of_origin');
            $table->string('local_government');
            $table->text('address');
            $table->string('phone');
            $table->string('email');
            $table->string('emergency_contact_name');
            $table->string('emergency_contact_phone');
            $table->string('emergency_contact_relationship');
            $table->string('previous_school');
            $table->string('previous_qualification');
            $table->year('graduation_year');
            $table->string('jamb_registration_number')->nullable();
            $table->string('jamb_score')->nullable();
            $table->decimal('cgpa', 3, 2)->nullable();
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected'])->default('draft');
            $table->text('admin_notes')->nullable();
            $table->boolean('form_paid')->default(false);
            $table->string('transcript')->nullable();
            $table->string('certificate')->nullable();
            $table->string('id_card')->nullable();
            $table->string('passport')->nullable();
            $table->string('photo')->nullable();
            $table->string('signature')->nullable();
            $table->string('olevel_result')->nullable();
            $table->string('olevel_result_number')->nullable();
            $table->string('olevel_result_year')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
}; 