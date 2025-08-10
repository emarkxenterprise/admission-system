<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Setting;

class Program extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'description',
        'type',
        'duration_years',
        'duration_semesters',
        'tuition_fee',
        'acceptance_fee',
        'use_default_form_fee',
        'form_fee',
        'is_active',
        'department_id',
        'application_start_date',
        'application_end_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'duration_years' => 'integer',
        'duration_semesters' => 'integer',
        'tuition_fee' => 'decimal:2',
        'acceptance_fee' => 'decimal:2',
        'use_default_form_fee' => 'boolean',
        'form_fee' => 'decimal:2',
        'is_active' => 'boolean',
        'application_start_date' => 'date',
        'application_end_date' => 'date',
    ];

    /**
     * Get the department that owns the program.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the applications for the program.
     */
    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Get the admissions for the program.
     */
    public function admissions()
    {
        return $this->hasMany(Admission::class);
    }

    /**
     * Scope a query to only include active programs.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the faculty through department.
     */
    public function faculty()
    {
        return $this->hasOneThrough(Faculty::class, Department::class, 'id', 'id', 'department_id', 'faculty_id');
    }

    /**
     * Get the program type label.
     */
    public function getTypeLabelAttribute()
    {
        return ucwords(str_replace('_', ' ', $this->type));
    }

    /**
     * Get the total number of applications for this program.
     */
    public function getTotalApplicationsAttribute()
    {
        return $this->applications()->count();
    }

    /**
     * Get the total number of approved applications for this program.
     */
    public function getApprovedApplicationsAttribute()
    {
        return $this->applications()->where('status', 'approved')->count();
    }

    /**
     * Get the total number of pending applications for this program.
     */
    public function getPendingApplicationsAttribute()
    {
        return $this->applications()->whereIn('status', ['submitted', 'under_review'])->count();
    }

    /**
     * Get the total number of rejected applications for this program.
     */
    public function getRejectedApplicationsAttribute()
    {
        return $this->applications()->where('status', 'rejected')->count();
    }

    /**
     * Get the effective form fee for this program.
     */
    public function getEffectiveFormFeeAttribute()
    {
        if ($this->use_default_form_fee) {
            return Setting::get('form_amount', 5000);
        }
        return $this->form_fee ?? Setting::get('form_amount', 5000);
    }

    /**
     * Check if the application period is currently active for this program.
     */
    public function isApplicationPeriodActive()
    {
        // If no application period is set, consider it always active
        if (!$this->application_start_date && !$this->application_end_date) {
            return true;
        }

        $now = now();

        // Check if current date is within the application period
        if ($this->application_start_date && $this->application_end_date) {
            return $now->between($this->application_start_date, $this->application_end_date);
        }

        // If only start date is set, check if we're past the start date
        if ($this->application_start_date && !$this->application_end_date) {
            return $now->gte($this->application_start_date);
        }

        // If only end date is set, check if we're before the end date
        if (!$this->application_start_date && $this->application_end_date) {
            return $now->lte($this->application_end_date);
        }

        return false;
    }

    /**
     * Get the application period status message.
     */
    public function getApplicationPeriodStatusAttribute()
    {
        if (!$this->application_start_date && !$this->application_end_date) {
            return 'Application period not set';
        }

        $now = now();

        if ($this->isApplicationPeriodActive()) {
            if ($this->application_end_date) {
                $daysLeft = $now->diffInDays($this->application_end_date, false);
                if ($daysLeft > 0) {
                    return "Applications open - {$daysLeft} days remaining";
                } else {
                    return "Applications open - Last day today";
                }
            } else {
                return "Applications open";
            }
        } else {
            if ($this->application_start_date && $now->lt($this->application_start_date)) {
                $daysUntil = $now->diffInDays($this->application_start_date, false);
                return "Applications open in {$daysUntil} days";
            } else {
                return "Application period closed";
            }
        }
    }
}
