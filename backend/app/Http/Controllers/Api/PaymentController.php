<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Yabacon\Paystack;

class PaymentController extends Controller
{
    protected $paystack;

    public function __construct()
    {
        try {
            $secretKey = Setting::get('paystack_secret_key', config('services.paystack.secret'));
            \Log::info('Initializing Paystack with secret key:', ['key' => substr($secretKey, 0, 10) . '...']);
            $this->paystack = new Paystack($secretKey);
        } catch (\Exception $e) {
            \Log::error('Failed to initialize Paystack:', ['error' => $e->getMessage()]);
            $this->paystack = null;
        }
    }

    /**
     * Initialize payment.
     */
    public function initialize(Request $request)
    {
        // Debug logging
        \Log::info('Payment initialization request received', [
            'request_data' => $request->all(),
            'user_id' => $request->user()->id ?? 'no_user'
        ]);

        $validator = Validator::make($request->all(), [
            'type' => 'required|in:form_purchase,admission_fee,acceptance_fee',
            'application_id' => 'required_if:type,form_purchase|nullable|exists:applications,id',
            'admission_id' => 'required_unless:type,form_purchase|nullable|exists:admissions,id',
            'payment_id' => 'nullable|exists:payments,id', // For acceptance fee payments
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if Paystack is properly initialized
        if (!$this->paystack) {
            \Log::error('Paystack not initialized');
            return response()->json([
                'status' => false,
                'message' => 'Payment service is not available. Please contact support.'
            ], 500);
        }

        $currency = Setting::get('currency', 'NGN');
        $amount = 0;
        $payment = null;
        $reference = null;
        $user = $request->user();

        if ($request->type === 'form_purchase') {
            // Application form payment
            $application = $user->applications()->with('program')->findOrFail($request->application_id);
            
            // Get program-specific form fee
            $formFee = $application->program ? $application->program->effective_form_fee : Setting::get('form_amount', 5000);
            $amount = $formFee * 100; // Convert to kobo

            // Debug logging for form fee calculation
            \Log::info('Form fee calculation', [
                'application_id' => $application->id,
                'program_id' => $application->program_id,
                'program_name' => $application->program ? $application->program->name : 'No program',
                'use_default_form_fee' => $application->program ? $application->program->use_default_form_fee : 'No program',
                'program_form_fee' => $application->program ? $application->program->form_fee : 'No program',
                'effective_form_fee' => $formFee,
                'default_form_fee' => Setting::get('form_amount', 5000),
                'final_amount' => $amount
            ]);

            // Check if payment already exists and is successful
            $existingPayment = Payment::where('application_id', $application->id)
                ->where('type', 'form_purchase')
                ->where('status', 'successful')
                ->first();
            if ($existingPayment) {
                return response()->json([
                    'status' => false,
                    'message' => 'Payment for this type has already been made'
                ], 400);
            }

            $reference = 'PAY' . time() . rand(1000, 9999);
        } else {
            // Admission/acceptance fee payment
            $admission = $user->admissions()->findOrFail($request->admission_id);
            if ($request->type === 'admission_fee') {
                $amount = $admission->admissionSession->admission_fee * 100;
            } elseif ($request->type === 'acceptance_fee') {
                // Use the admission's specific acceptance fee amount instead of default
                $amount = $admission->acceptance_fee_amount * 100; // Convert to kobo
            }
            // Check if payment already exists and is successful
            $existingPayment = Payment::where('admission_id', $admission->id)
                ->where('type', $request->type)
                ->where('status', 'successful')
                ->first();
            if ($existingPayment) {
                return response()->json([
                    'status' => false,
                    'message' => 'Payment for this type has already been made'
                ], 400);
            }
            $reference = 'PAY' . time() . rand(1000, 9999);
        }

        try {
            \Log::info('Attempting to initialize Paystack transaction', [
                'amount' => $amount,
                'email' => $user->email,
                'reference' => $reference,
                'type' => $request->type
            ]);

            $tranx = $this->paystack->transaction->initialize([
                'amount' => $amount,
                'email' => $user->email,
                'reference' => $reference,
                'callback_url' => config('app.url') . '/api/payments/verify',
                'currency' => $currency,
                'metadata' => [
                    'application_id' => $request->type === 'form_purchase' ? $request->application_id : null,
                    'admission_id' => $request->type !== 'form_purchase' ? $request->admission_id : null,
                    'user_id' => $user->id,
                    'type' => $request->type,
                ]
            ]);

            // Create payment record
            if ($request->type === 'form_purchase') {
                Payment::create([
                    'user_id' => $user->id,
                    'application_id' => $request->application_id,
                    'reference' => $tranx->data->reference,
                    'paystack_reference' => $tranx->data->reference,
                    'amount' => $amount / 100,
                    'type' => 'form_purchase',
                    'status' => 'pending',
                    'currency' => $currency,
                    'description' => 'Application Form Payment',
                    'metadata' => [
                        'application_id' => $request->application_id,
                        'user_id' => $user->id,
                        'type' => 'form_purchase',
                    ]
                ]);
            } else {
                Payment::create([
                    'user_id' => $user->id,
                    'admission_id' => $request->admission_id,
                    'reference' => $tranx->data->reference,
                    'paystack_reference' => $tranx->data->reference,
                    'amount' => $amount / 100,
                    'type' => $request->type,
                    'status' => 'pending',
                    'currency' => $currency,
                    'description' => $request->type === 'acceptance_fee' ? 'Admission Acceptance Fee' : null,
                    'metadata' => [
                        'admission_id' => $request->admission_id,
                        'user_id' => $user->id,
                        'type' => $request->type,
                    ]
                ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Payment initialized successfully',
                'data' => [
                    'authorization_url' => $tranx->data->authorization_url,
                    'reference' => $reference,
                    'amount' => $amount / 100,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Paystack initialization failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to initialize payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify payment (manual verification).
     */
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reference' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $reference = $request->input('reference');
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }

        try {
            $payment = Payment::where('reference', $reference)->first();
            
            if (!$payment) {
                return response()->json([
                    'status' => false,
                    'message' => 'Payment not found'
                ], 404);
            }

            // Security check: Ensure the user can only verify their own payments
            $canVerify = false;
            
            // Check if payment belongs to the authenticated user
            if ($payment->user_id === $user->id) {
                $canVerify = true;
            }
            
            // Check if payment is related to user's application
            if ($payment->application_id) {
                $application = $payment->application;
                if ($application && $application->user_id === $user->id) {
                    $canVerify = true;
                }
            }
            
            // Check if payment is related to user's admission
            if ($payment->admission_id) {
                $admission = $payment->admission;
                if ($admission && $admission->user_id === $user->id) {
                    $canVerify = true;
                }
            }
            
            if (!$canVerify) {
                \Log::warning('Unauthorized payment verification attempt', [
                    'user_id' => $user->id,
                    'payment_id' => $payment->id,
                    'payment_user_id' => $payment->user_id,
                    'application_id' => $payment->application_id,
                    'admission_id' => $payment->admission_id
                ]);
                
                return response()->json([
                    'status' => false,
                    'message' => 'You are not authorized to verify this payment'
                ], 403);
            }

            // Log the payment details for debugging
            \Log::info('Manual payment verification attempt', [
                'reference' => $reference,
                'payment_id' => $payment->id,
                'payment_status' => $payment->status,
                'payment_type' => $payment->type,
                'application_id' => $payment->application_id,
                'admission_id' => $payment->admission_id
            ]);

            // Check if payment is already verified
            if ($payment->status === 'successful') {
                return response()->json([
                    'status' => true,
                    'message' => 'Payment already verified',
                    'data' => [
                        'payment' => $payment,
                        'admission' => $payment->admission ? $payment->admission->load('application') : null
                    ]
                ]);
            }

            // Verify payment with Paystack
            $tranx = $this->paystack->transaction->verify([
                'reference' => $payment->paystack_reference
            ]);
            
            if ($tranx->status && $tranx->data->status === 'success') {
                // Update payment status
                $payment->update([
                    'status' => 'successful',
                    'paid_at' => now(),
                    'gateway_response' => $tranx->data->gateway_response ?? 'Payment verified'
                ]);

                // Update related model based on payment type
                if ($payment->type === 'form_purchase') {
                    if ($payment->application) {
                        $payment->application->update(['form_paid' => true]);
                        \Log::info('Application form_paid updated to true via manual verification', [
                            'application_id' => $payment->application_id,
                            'form_paid' => $payment->application->form_paid
                        ]);
                    } else {
                        \Log::error('Application not found for form purchase payment during manual verification', [
                            'payment_id' => $payment->id,
                            'application_id' => $payment->application_id
                        ]);
                    }
                } elseif ($payment->type === 'acceptance_fee') {
                    if ($payment->admission) {
                        $payment->admission->update(['acceptance_fee_paid' => true]);
                        \Log::info('Admission acceptance_fee_paid updated to true via manual verification', [
                            'admission_id' => $payment->admission_id,
                            'acceptance_fee_paid' => $payment->admission->acceptance_fee_paid
                        ]);
                    } else {
                        \Log::error('Admission not found for acceptance fee payment during manual verification', [
                            'payment_id' => $payment->id,
                            'admission_id' => $payment->admission_id
                        ]);
                    }
                } elseif ($payment->type === 'admission_fee') {
                    if ($payment->admission) {
                        $payment->admission->update(['admission_fee_paid' => true]);
                        \Log::info('Admission admission_fee_paid updated to true via manual verification', [
                            'admission_id' => $payment->admission_id,
                            'admission_fee_paid' => $payment->admission->admission_fee_paid
                        ]);
                    } else {
                        \Log::error('Admission not found for admission fee payment during manual verification', [
                            'payment_id' => $payment->id,
                            'admission_id' => $payment->admission_id
                        ]);
                    }
                }

                return response()->json([
                    'status' => true,
                    'message' => 'Payment verified successfully',
                    'data' => [
                        'payment' => $payment->fresh(),
                        'admission' => $payment->admission ? $payment->admission->load('application') : null
                    ]
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Payment verification failed'
                ], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Manual payment verification error', [
                'reference' => $reference,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Payment verification failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment history for user.
     */
    public function history(Request $request)
    {
        $payments = $request->user()->payments()
            ->with(['admission.admissionSession', 'admission.department'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => [
                'payments' => $payments
            ]
        ]);
    }

    /**
     * Get a specific payment by reference (with security checks).
     */
    public function getPaymentByReference(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reference' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $reference = $request->input('reference');
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }

        $payment = Payment::where('reference', $reference)->first();
        
        if (!$payment) {
            return response()->json([
                'status' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        // Security check: Ensure the user can only access their own payments
        $canAccess = false;
        
        // Check if payment belongs to the authenticated user
        if ($payment->user_id === $user->id) {
            $canAccess = true;
        }
        
        // Check if payment is related to user's application
        if ($payment->application_id) {
            $application = $payment->application;
            if ($application && $application->user_id === $user->id) {
                $canAccess = true;
            }
        }
        
        // Check if payment is related to user's admission
        if ($payment->admission_id) {
            $admission = $payment->admission;
            if ($admission && $admission->user_id === $user->id) {
                $canAccess = true;
            }
        }
        
        if (!$canAccess) {
            \Log::warning('Unauthorized payment access attempt', [
                'user_id' => $user->id,
                'payment_id' => $payment->id,
                'payment_user_id' => $payment->user_id,
                'application_id' => $payment->application_id,
                'admission_id' => $payment->admission_id
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'You are not authorized to access this payment'
            ], 403);
        }

        return response()->json([
            'status' => true,
            'data' => [
                'payment' => $payment->load(['admission.admissionSession', 'admission.department', 'application'])
            ]
        ]);
    }

    public function verifyGet(Request $request)
    {
        $reference = $request->query('reference');
        if (!$reference) {
            return response()->json(['status' => false, 'message' => 'Reference not provided'], 400);
        }
        
        \Log::info('Payment verification started', ['reference' => $reference]);
        
        $payment = Payment::where('reference', $reference)->first();
        if (!$payment) {
            \Log::error('Payment not found', ['reference' => $reference]);
            return response()->json(['status' => false, 'message' => 'Payment not found'], 404);
        }

        // For webhook verification, we need to check if the user is authenticated
        // and if they have permission to verify this payment
        $user = auth()->user();
        
        if ($user) {
            // Security check: Ensure the user can only verify their own payments
            $canVerify = false;
            
            // Check if payment belongs to the authenticated user
            if ($payment->user_id === $user->id) {
                $canVerify = true;
            }
            
            // Check if payment is related to user's application
            if ($payment->application_id) {
                $application = $payment->application;
                if ($application && $application->user_id === $user->id) {
                    $canVerify = true;
                }
            }
            
            // Check if payment is related to user's admission
            if ($payment->admission_id) {
                $admission = $payment->admission;
                if ($admission && $admission->user_id === $user->id) {
                    $canVerify = true;
                }
            }
            
            if (!$canVerify) {
                \Log::warning('Unauthorized payment verification attempt via GET', [
                    'user_id' => $user->id,
                    'payment_id' => $payment->id,
                    'payment_user_id' => $payment->user_id,
                    'application_id' => $payment->application_id,
                    'admission_id' => $payment->admission_id
                ]);
                
                return response()->json([
                    'status' => false,
                    'message' => 'You are not authorized to verify this payment'
                ], 403);
            }
        }
        
        \Log::info('Payment found', [
            'payment_id' => $payment->id,
            'type' => $payment->type,
            'status' => $payment->status,
            'application_id' => $payment->application_id,
            'admission_id' => $payment->admission_id
        ]);
        
        // If already successful, just redirect
        if ($payment->isSuccessful()) {
            \Log::info('Payment already successful, redirecting');
            // Get the correct application ID
            $applicationId = $payment->application_id;
            if (!$applicationId && $payment->admission_id) {
                $admission = $payment->admission;
                if ($admission && $admission->application_id) {
                    $applicationId = $admission->application_id;
                }
            }
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/application/' . $applicationId . '?payment_status=success&reference=' . $reference);
        }
        
        try {
            \Log::info('Verifying payment with Paystack', ['paystack_reference' => $payment->paystack_reference]);
            
            $tranx = $this->paystack->transaction->verify([
                'reference' => $payment->paystack_reference
            ]);
            
            \Log::info('Paystack verification response', [
                'paystack_status' => $tranx->status,
                'transaction_status' => $tranx->data->status ?? 'unknown'
            ]);
            
            if ($tranx->status && $tranx->data->status === 'success') {
                \Log::info('Payment verification successful, updating payment status');
                
                $payment->update([
                    'status' => 'successful',
                    'paid_at' => now(),
                ]);
                
                // Handle different payment types
                if ($payment->isFormPurchase()) {
                    \Log::info('Processing form purchase payment');
                    $application = $payment->application;
                    if ($application) {
                        \Log::info('Updating application form_paid status', ['application_id' => $application->id]);
                        $application->update(['form_paid' => true]);
                        \Log::info('Application form_paid updated successfully');
                    } else {
                        \Log::error('Application not found for form purchase payment', ['payment_id' => $payment->id]);
                    }
                } else {
                    \Log::info('Processing non-form purchase payment');
                    $admission = $payment->admission;
                    if ($admission) {
                        if ($payment->isAdmissionFee()) {
                            \Log::info('Updating admission fee paid status');
                            $admission->update(['admission_fee_paid' => true]);
                        } elseif ($payment->isAcceptanceFee()) {
                            \Log::info('Updating acceptance fee paid status');
                            $admission->update(['acceptance_fee_paid' => true]);
                        }
                    } else {
                        \Log::error('Admission not found for payment', ['payment_id' => $payment->id]);
                    }
                }
                
                // Redirect back to the application page with success parameters
                $applicationId = $payment->application_id;
                if (!$applicationId && $payment->admission_id) {
                    $admission = $payment->admission;
                    if ($admission && $admission->application_id) {
                        $applicationId = $admission->application_id;
                    }
                }
                \Log::info('Redirecting to application page', ['application_id' => $applicationId]);
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                return redirect($frontendUrl . '/application/' . $applicationId . '?payment_status=success&reference=' . $reference);
            } else {
                \Log::warning('Payment verification failed', [
                    'paystack_status' => $tranx->status,
                    'transaction_status' => $tranx->data->status ?? 'unknown'
                ]);
                
                $payment->update(['status' => 'failed']);
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                return redirect($frontendUrl . '/payment-failed?reference=' . $reference . '&status=failed');
            }
        } catch (\Exception $e) {
            \Log::error('Payment verification error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/payment-failed?reference=' . $reference . '&status=error');
        }
    }
} 