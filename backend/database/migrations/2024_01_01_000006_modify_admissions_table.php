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
        Schema::table('admissions', function (Blueprint $table) {
            // First change status to string to avoid enum issues
            $table->string('status')->default('pending')->change();
        });

        // Update the existing data
        DB::table('admissions')->where('status', 'pending')->update(['status' => 'offered']);
        DB::table('admissions')->where('status', 'approved')->update(['status' => 'offered']);
        DB::table('admissions')->where('status', 'admitted')->update(['status' => 'offered']);
        DB::table('admissions')->where('status', 'rejected')->update(['status' => 'declined']);

        Schema::table('admissions', function (Blueprint $table) {
            // Now change back to enum with new values
            $table->enum('status', ['offered', 'accepted', 'declined', 'expired'])->default('offered')->change();
            
            // Add application_id foreign key
            $table->foreignId('application_id')->after('user_id')->nullable()->constrained()->onDelete('cascade');
            
            // Remove application-specific fields that are now in applications table
            $table->dropColumn([
                'application_number',
                'first_name',
                'last_name',
                'middle_name',
                'date_of_birth',
                'gender',
                'nationality',
                'state_of_origin',
                'local_government',
                'address',
                'phone',
                'email',
                'emergency_contact_name',
                'emergency_contact_phone',
                'emergency_contact_relationship',
                'previous_school',
                'previous_qualification',
                'graduation_year',
                'cgpa',
                'transcript',
                'certificate',
                'id_card',
                'passport'
            ]);
            
            // Add only new admission-specific fields (skip existing ones)
            $table->decimal('acceptance_fee_amount', 10, 2)->default(0);
            $table->date('offer_date')->default(now());
            $table->date('acceptance_deadline')->default(now()->addDays(30));
            $table->timestamp('accepted_at')->nullable();
            $table->text('offer_letter_url')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admissions', function (Blueprint $table) {
            // Remove admission-specific fields
            $table->dropForeign(['application_id']);
            $table->dropColumn([
                'application_id',
                'acceptance_fee_amount',
                'offer_date',
                'acceptance_deadline',
                'accepted_at',
                'offer_letter_url'
            ]);
            
            // Restore original fields (this would need to be done carefully in a real migration)
            // For now, we'll just change the status back
            $table->enum('status', ['pending', 'approved', 'rejected', 'admitted'])->default('pending')->change();
        });
    }
}; 