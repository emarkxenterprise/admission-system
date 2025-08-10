<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'admission_id',
        'application_id',
        'reference',
        'paystack_reference',
        'amount',
        'type',
        'status',
        'currency',
        'description',
        'metadata',
        'paid_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'paid_at' => 'datetime',
    ];

    /**
     * Get the user that owns the payment.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admission for the payment.
     */
    public function admission()
    {
        return $this->belongsTo(Admission::class);
    }

    /**
     * Get the application for the payment.
     */
    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    /**
     * Check if payment is pending.
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payment is successful.
     */
    public function isSuccessful()
    {
        return $this->status === 'successful';
    }

    /**
     * Check if payment is failed.
     */
    public function isFailed()
    {
        return $this->status === 'failed';
    }

    /**
     * Check if payment is for form purchase.
     */
    public function isFormPurchase()
    {
        return $this->type === 'form_purchase';
    }

    /**
     * Check if payment is for admission fee.
     */
    public function isAdmissionFee()
    {
        return $this->type === 'admission_fee';
    }

    /**
     * Check if payment is for acceptance fee.
     */
    public function isAcceptanceFee()
    {
        return $this->type === 'acceptance_fee';
    }

    /**
     * Scope a query to only include successful payments.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'successful');
    }

    /**
     * Scope a query to only include form purchase payments.
     */
    public function scopeFormPurchase($query)
    {
        return $query->where('type', 'form_purchase');
    }

    /**
     * Scope a query to only include admission fee payments.
     */
    public function scopeAdmissionFee($query)
    {
        return $query->where('type', 'admission_fee');
    }

    /**
     * Scope a query to only include acceptance fee payments.
     */
    public function scopeAcceptanceFee($query)
    {
        return $query->where('type', 'acceptance_fee');
    }
} 