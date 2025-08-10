<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\Application;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdmissionOfferController extends Controller
{
    /**
     * Upload admitted students list for a session
     */
    public function uploadAdmittedStudents(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'admission_session_id' => 'required|exists:admission_sessions,id',
            'department_id' => 'required|exists:departments,id',
            'acceptance_fee_amount' => 'required|numeric|min:0',
            'acceptance_deadline_days' => 'required|integer|min:1|max:365',
            'admitted_students' => 'required|array',
            // 'admitted_students.*.email' => 'required|email', // Make email optional
            'admitted_students.*.email' => 'nullable|email',
            'admitted_students.*.application_number' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $admissionSessionId = $request->admission_session_id;
            $departmentId = $request->department_id;
            $acceptanceFeeAmount = $request->acceptance_fee_amount;
            $acceptanceDeadlineDays = $request->acceptance_deadline_days;
            $admittedStudents = $request->admitted_students;

            $createdOffers = [];
            $errors = [];
            $warnings = [];

            foreach ($admittedStudents as $student) {
                // Find the application by application number and session (email optional)
                $application = Application::where('application_number', $student['application_number'])
                    ->where('admission_session_id', $admissionSessionId)
                    ->first();

                if (!$application) {
                    $errors[] = "Application not found for application number: {$student['application_number']}";
                    continue;
                }

                // Warn if admitted department differs from application department
                if ((string)$application->department_id !== (string)$departmentId) {
                    $appliedDept = \App\Models\Department::find($application->department_id);
                    $admittedDept = \App\Models\Department::find($departmentId);
                    $appliedDeptName = $appliedDept ? $appliedDept->name : $application->department_id;
                    $admittedDeptName = $admittedDept ? $admittedDept->name : $departmentId;
                    $studentEmail = isset($student['email']) && $student['email'] ? $student['email'] : 'N/A';
                    $warnings[] = "Department mismatch for {$studentEmail} (App#: {$student['application_number']}): Applied to \"{$appliedDeptName}\", admitted to \"{$admittedDeptName}\".";
                }

                // Check if admission offer already exists
                $existingAdmission = Admission::where('application_id', $application->id)->first();
                if ($existingAdmission) {
                    $errors[] = "Admission offer already exists for application: {$student['application_number']}";
                    continue;
                }

                // Create admission offer with custom acceptance fee amount
                $admission = Admission::create([
                    'user_id' => $application->user_id,
                    'application_id' => $application->id,
                    'admission_session_id' => $admissionSessionId,
                    'department_id' => $departmentId,
                    'status' => 'offered',
                    'acceptance_fee_amount' => $acceptanceFeeAmount,
                    'offer_date' => now(),
                    'acceptance_deadline' => now()->addDays($acceptanceDeadlineDays),
                    'acceptance_fee_paid' => false,
                    'admission_accepted' => false,
                ]);

                \Log::info('Admission offer created with custom acceptance fee', [
                    'admission_id' => $admission->id,
                    'application_number' => $student['application_number'],
                    'email' => $student['email'],
                    'acceptance_fee_amount' => $acceptanceFeeAmount,
                    'session_id' => $admissionSessionId,
                    'department_id' => $departmentId
                ]);

                $createdOffers[] = [
                    'application_number' => $student['application_number'],
                    'email' => $student['email'] ?? $application->email ?? null,
                    'admission_id' => $admission->id
                ];
            }

            DB::commit();

            \Log::info('Admission offers upload completed', [
                'total_offers_created' => count($createdOffers),
                'total_errors' => count($errors),
                'total_warnings' => count($warnings),
                'acceptance_fee_amount' => $acceptanceFeeAmount,
                'session_id' => $admissionSessionId,
                'department_id' => $departmentId,
                'deadline_days' => $acceptanceDeadlineDays
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admission offers created successfully',
                'data' => [
                    'created_offers' => $createdOffers,
                    'errors' => $errors,
                    'warnings' => $warnings
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create admission offers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get admission offers for a user
     */
    public function getUserAdmissionOffers(Request $request)
    {
        $user = $request->user();
        
        $admissions = Admission::with(['application', 'admissionSession', 'department'])
            ->where('user_id', $user->id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $admissions
        ]);
    }

    /**
     * Get admission offer details
     */
    public function getAdmissionOffer($id)
    {
        $admission = Admission::with(['application', 'admissionSession', 'department', 'payments'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $admission
        ]);
    }

    /**
     * Accept admission offer
     */
    public function acceptAdmissionOffer(Request $request, $id)
    {
        $user = $request->user();
        
        $admission = Admission::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$admission) {
            return response()->json([
                'success' => false,
                'message' => 'Admission offer not found'
            ], 404);
        }

        // Check if admission can be accepted
        if (!$admission->canBeAccepted()) {
            return response()->json([
                'success' => false,
                'message' => 'Admission cannot be accepted. Please ensure acceptance fee is paid and offer has not expired.'
            ], 400);
        }

        try {
            $admission->update([
                'status' => 'accepted',
                'admission_accepted' => true,
                'accepted_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admission accepted successfully',
                'data' => $admission
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept admission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Decline admission offer
     */
    public function declineAdmissionOffer(Request $request, $id)
    {
        $user = $request->user();
        
        $admission = Admission::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'offered')
            ->first();

        if (!$admission) {
            return response()->json([
                'success' => false,
                'message' => 'Admission offer not found or cannot be declined'
            ], 404);
        }

        try {
            $admission->update([
                'status' => 'declined'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admission declined successfully',
                'data' => $admission
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to decline admission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all admission offers (admin)
     */
    public function getAllAdmissionOffers(Request $request)
    {
        $admissions = Admission::with(['application', 'admissionSession', 'department', 'user'])
            ->when($request->session_id, function($query, $sessionId) {
                return $query->where('admission_session_id', $sessionId);
            })
            ->when($request->department_id, function($query, $departmentId) {
                return $query->where('department_id', $departmentId);
            })
            ->when($request->status, function($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $admissions
        ]);
    }

    /**
     * Update admission offer (admin)
     */
    public function updateAdmissionOffer(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:offered,accepted,declined,expired',
            'acceptance_fee_amount' => 'sometimes|numeric|min:0',
            'acceptance_deadline' => 'sometimes|date|after:today',
            'admin_notes' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $admission = Admission::findOrFail($id);

        try {
            $admission->update($request->only([
                'status', 'acceptance_fee_amount', 'acceptance_deadline', 'admin_notes'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Admission offer updated successfully',
                'data' => $admission
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update admission offer',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 