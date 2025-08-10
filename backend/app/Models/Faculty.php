<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
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
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the departments for the faculty.
     */
    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    /**
     * Get the applications for the faculty through departments.
     */
    public function applications()
    {
        return $this->hasManyThrough(Application::class, Department::class);
    }

    /**
     * Get the admissions for the faculty through departments.
     */
    public function admissions()
    {
        return $this->hasManyThrough(Admission::class, Department::class);
    }

    /**
     * Scope a query to only include active faculties.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the total number of applications for this faculty.
     */
    public function getTotalApplicationsAttribute()
    {
        return $this->applications()->count();
    }

    /**
     * Get the total number of approved applications for this faculty.
     */
    public function getApprovedApplicationsAttribute()
    {
        return $this->applications()->where('status', 'approved')->count();
    }

    /**
     * Get the total number of pending applications for this faculty.
     */
    public function getPendingApplicationsAttribute()
    {
        return $this->applications()->whereIn('status', ['submitted', 'under_review'])->count();
    }

    /**
     * Get the total number of rejected applications for this faculty.
     */
    public function getRejectedApplicationsAttribute()
    {
        return $this->applications()->where('status', 'rejected')->count();
    }
} 