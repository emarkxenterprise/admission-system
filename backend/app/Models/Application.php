<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'admission_session_id',
        'department_id',
        'program_id',
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
        'jamb_registration_number',
        'jamb_year',
        'jamb_score',
        'is_first_choice',
        'cgpa',
        'status',
        'admin_notes',
        'form_paid',
        'transcript',
        'certificate',
        'id_card',
        'passport',
        'photo',
        'signature',
        'olevel_result',
        'olevel_result_number',
        'olevel_result_year',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_of_birth' => 'date',
        'graduation_year' => 'integer',
        'jamb_year' => 'integer',
        'jamb_score' => 'integer',
        'cgpa' => 'decimal:2',
        'form_paid' => 'boolean',
        'is_first_choice' => 'boolean',
    ];

    /**
     * Get the user that owns the application.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admission session for the application.
     */
    public function admissionSession()
    {
        return $this->belongsTo(AdmissionSession::class);
    }

    /**
     * Get the department for the application.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the program for the application.
     */
    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the admission for this application.
     */
    public function admission()
    {
        return $this->hasOne(Admission::class);
    }

    /**
     * Get the payments for the application.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the academic backgrounds for the application.
     */
    public function academicBackgrounds()
    {
        return $this->hasMany(AcademicBackground::class);
    }

    /**
     * Get the full name of the applicant.
     */
    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->middle_name . ' ' . $this->last_name);
    }

    /**
     * Check if application is in draft status.
     */
    public function isDraft()
    {
        return $this->status === 'draft';
    }

    /**
     * Check if application is submitted.
     */
    public function isSubmitted()
    {
        return $this->status === 'submitted';
    }

    /**
     * Check if application is under review.
     */
    public function isUnderReview()
    {
        return $this->status === 'under_review';
    }

    /**
     * Check if application is approved.
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * Check if application is rejected.
     */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if form payment is completed.
     */
    public function hasFormPayment()
    {
        return $this->form_paid;
    }

    /**
     * Check if application has been offered admission.
     */
    public function hasAdmissionOffer()
    {
        return $this->admission()->exists();
    }

    /**
     * Get the admission offer if it exists.
     */
    public function getAdmissionOffer()
    {
        return $this->admission;
    }
} 