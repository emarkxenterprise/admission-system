<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicBackground extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'school_name',
        'qualification',
        'graduation_year',
        'cgpa',
        'certificate_file',
    ];

    protected $casts = [
        'graduation_year' => 'integer',
        'cgpa' => 'decimal:2',
    ];

    /**
     * Get the application that owns the academic background.
     */
    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}