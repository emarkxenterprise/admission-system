<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admission extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'application_id',
        'admission_session_id',
        'department_id',
        'program_id',
        'status',
        'admin_notes',
        'acceptance_fee_amount',
        'offer_date',
        'acceptance_deadline',
        'acceptance_fee_paid',
        'admission_accepted',
        'accepted_at',
        'offer_letter_url',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'acceptance_fee_amount' => 'decimal:2',
        'offer_date' => 'date',
        'acceptance_deadline' => 'date',
        'acceptance_fee_paid' => 'boolean',
        'admission_accepted' => 'boolean',
        'accepted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the admission.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the application for this admission.
     */
    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    /**
     * Get the admission session for the admission.
     */
    public function admissionSession()
    {
        return $this->belongsTo(AdmissionSession::class);
    }

    /**
     * Get the department for the admission.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the program for the admission.
     */
    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the payments for the admission.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the full name of the applicant from the application.
     */
    public function getFullNameAttribute()
    {
        return $this->application ? $this->application->full_name : 'N/A';
    }

    /**
     * Check if admission is offered.
     */
    public function isOffered()
    {
        return $this->status === 'offered';
    }

    /**
     * Check if admission is accepted.
     */
    public function isAccepted()
    {
        return $this->status === 'accepted';
    }

    /**
     * Check if admission is declined.
     */
    public function isDeclined()
    {
        return $this->status === 'declined';
    }

    /**
     * Check if admission is expired.
     */
    public function isExpired()
    {
        return $this->status === 'expired';
    }

    /**
     * Check if acceptance fee payment is completed.
     */
    public function hasAcceptanceFeePayment()
    {
        return $this->acceptance_fee_paid;
    }

    /**
     * Check if admission is accepted by applicant.
     */
    public function isAcceptedByApplicant()
    {
        return $this->admission_accepted;
    }

    /**
     * Check if the admission offer has expired.
     */
    public function hasExpired()
    {
        return $this->acceptance_deadline && $this->acceptance_deadline->isPast();
    }

    /**
     * Check if the applicant can accept the admission.
     */
    public function canBeAccepted()
    {
        return $this->isOffered() && 
               $this->hasAcceptanceFeePayment() && 
               !$this->hasExpired();
    }
} 