<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\AdmissionSession;
use App\Models\Department;
use App\Models\Setting;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdmissionController extends Controller
{
    /**
     * Get all admissions for the authenticated user.
     */
    public function index(Request $request)
    {
        $admissions = $request->user()->admissions()
            ->with(['admissionSession', 'department'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => [
                'admissions' => $admissions
            ]
        ]);
    }

    /**
     * Store a new admission application.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'admission_session_id' => 'required|exists:admission_sessions,id',
            'department_id' => 'required|exists:departments,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'nationality' => 'required|string|max:255',
            'state_of_origin' => 'required|string|max:255',
            'local_government' => 'required|string|max:255',
            'address' => 'required|string',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'emergency_contact_name' => 'required|string|max:255',
            'emergency_contact_phone' => 'required|string|max:20',
            'emergency_contact_relationship' => 'required|string|max:255',
            'previous_school' => 'required|string|max:255',
            'previous_qualification' => 'required|string|max:255',
            'graduation_year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'cgpa' => 'nullable|numeric|min:0|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle file uploads
        $transcriptPath = null;
        $certificatePath = null;
        $idCardPath = null;
        $passportPath = null;
        if ($request->hasFile('transcript')) {
            $transcriptPath = $request->file('transcript')->store('admissions', 'public');
        }
        if ($request->hasFile('certificate')) {
            $certificatePath = $request->file('certificate')->store('admissions', 'public');
        }
        if ($request->hasFile('id_card')) {
            $idCardPath = $request->file('id_card')->store('admissions', 'public');
        }
        if ($request->hasFile('passport')) {
            $passportPath = $request->file('passport')->store('passports', 'public');
        }

        // Check if user has already applied for this session
        $existingAdmission = $request->user()->admissions()
            ->where('admission_session_id', $request->admission_session_id)
            ->first();

        if ($existingAdmission) {
            return response()->json([
                'status' => false,
                'message' => 'You have already applied for this admission session'
            ], 400);
        }

        // Generate application number: APPYYYYMMDD5RandomDigitsSerialNo
        $dateString = date('Ymd'); // YYYYMMDD format
        $randomDigits = str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT); // 5 random digits
        $serialNo = str_pad(Admission::count() + 1, 2, '0', STR_PAD_LEFT); // 2-digit serial number with 1 leading zero
        $applicationNumber = "APP{$dateString}{$randomDigits}{$serialNo}";

        $admission = $request->user()->admissions()->create([
            'admission_session_id' => $request->admission_session_id,
            'department_id' => $request->department_id,
            'application_number' => $applicationNumber,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'nationality' => $request->nationality,
            'state_of_origin' => $request->state_of_origin,
            'local_government' => $request->local_government,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_phone' => $request->emergency_contact_phone,
            'emergency_contact_relationship' => $request->emergency_contact_relationship,
            'previous_school' => $request->previous_school,
            'previous_qualification' => $request->previous_qualification,
            'graduation_year' => $request->graduation_year,
            'cgpa' => $request->cgpa,
            'transcript' => $transcriptPath,
            'certificate' => $certificatePath,
            'id_card' => $idCardPath,
            'passport' => $passportPath,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Admission application submitted successfully',
            'data' => [
                'admission' => $admission->load(['admissionSession', 'department'])
            ]
        ], 201);
    }

    /**
     * Get a specific admission.
     */
    public function show(Request $request, $id)
    {
        $admission = $request->user()->admissions()
            ->with(['admissionSession', 'department', 'payments'])
            ->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => [
                'admission' => $admission
            ]
        ]);
    }

    /**
     * Accept admission offer.
     */
    public function accept(Request $request, $id)
    {
        $admission = $request->user()->admissions()->findOrFail($id);

        // Check if admission is approved
        if (!$admission->isAdmitted()) {
            return response()->json([
                'status' => false,
                'message' => 'Admission is not yet approved'
            ], 400);
        }

        // Check if already accepted
        if ($admission->isAcceptedByApplicant()) {
            return response()->json([
                'status' => false,
                'message' => 'Admission has already been accepted'
            ], 400);
        }

        // Check if acceptance fee is already paid
        if ($admission->acceptance_fee_paid) {
            return response()->json([
                'status' => false,
                'message' => 'Acceptance fee has already been paid'
            ], 400);
        }

        // Get acceptance fee amount from the admission record
        $acceptanceFee = $admission->acceptance_fee_amount;

        // Create payment record for acceptance fee
        $payment = Payment::create([
            'admission_id' => $admission->id,
            'user_id' => $request->user()->id,
            'amount' => $acceptanceFee,
            'type' => 'acceptance_fee',
            'status' => 'pending',
            'reference' => 'ACCEPT_' . time() . '_' . $admission->id,
            'description' => 'Admission Acceptance Fee'
        ]);

        // Update admission status
        $admission->update([
            'admission_accepted' => true,
            'acceptance_fee_paid' => true,
            'status' => 'accepted',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Admission accepted successfully. Please complete the acceptance fee payment.',
            'data' => [
                'admission' => $admission->load(['admissionSession', 'department']),
                'payment' => $payment,
                'acceptance_fee' => $acceptanceFee
            ]
        ]);
    }

    /**
     * Reject admission offer.
     */
    public function reject(Request $request, $id)
    {
        $admission = $request->user()->admissions()->findOrFail($id);

        // Check if admission is approved
        if (!$admission->isAdmitted()) {
            return response()->json([
                'status' => false,
                'message' => 'Admission is not yet approved'
            ], 400);
        }

        // Check if already accepted
        if ($admission->isAcceptedByApplicant()) {
            return response()->json([
                'status' => false,
                'message' => 'Admission has already been accepted and cannot be rejected'
            ], 400);
        }

        // Update admission status
        $admission->update([
            'admission_rejected' => true,
            'rejection_date' => now()
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Admission offer rejected successfully',
            'data' => [
                'admission' => $admission->load(['admissionSession', 'department'])
            ]
        ]);
    }

    /**
     * Get available admission sessions.
     */
    public function sessions()
    {
        $sessions = AdmissionSession::active()->get();
        $formAmount = Setting::get('form_amount', 5000);

        return response()->json([
            'status' => true,
            'data' => [
                'sessions' => $sessions,
                'form_amount' => $formAmount
            ]
        ]);
    }

    /**
     * Get available departments.
     */
    public function departments()
    {
        $departments = Department::active()->get();

        return response()->json([
            'status' => true,
            'data' => [
                'departments' => $departments
            ]
        ]);
    }

    /**
     * Delete an admission application if payment has not been made.
     */
    public function destroy(Request $request, $id)
    {
        $admission = $request->user()->admissions()->findOrFail($id);
        if ($admission->form_paid) {
            return response()->json([
                'status' => false,
                'message' => 'Cannot delete application after payment has been made.'
            ], 403);
        }
        $admission->delete();
        return response()->json([
            'status' => true,
            'message' => 'Application deleted successfully.'
        ]);
    }

    /**
     * Update application data if payment has not been made.
     */
    public function updateApplication(Request $request, $id)
    {
        $admission = $request->user()->admissions()->findOrFail($id);
        if ($admission->form_paid) {
            return response()->json([
                'status' => false,
                'message' => 'Cannot edit application after payment has been made.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'admission_session_id' => 'required|exists:admission_sessions,id',
            'department_id' => 'required|exists:departments,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'nationality' => 'required|string|max:255',
            'state_of_origin' => 'required|string|max:255',
            'local_government' => 'required|string|max:255',
            'address' => 'required|string',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'emergency_contact_name' => 'required|string|max:255',
            'emergency_contact_phone' => 'required|string|max:20',
            'emergency_contact_relationship' => 'required|string|max:255',
            'previous_school' => 'required|string|max:255',
            'previous_qualification' => 'required|string|max:255',
            'graduation_year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'cgpa' => 'nullable|numeric|min:0|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle file uploads
        $data = $request->only([
            'admission_session_id', 'department_id', 'first_name', 'last_name', 'middle_name',
            'date_of_birth', 'gender', 'nationality', 'state_of_origin', 'local_government',
            'address', 'phone', 'email', 'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relationship', 'previous_school', 'previous_qualification',
            'graduation_year', 'cgpa'
        ]);
        if ($request->hasFile('transcript')) {
            $data['transcript'] = $request->file('transcript')->store('admissions', 'public');
        }
        if ($request->hasFile('certificate')) {
            $data['certificate'] = $request->file('certificate')->store('admissions', 'public');
        }
        if ($request->hasFile('id_card')) {
            $data['id_card'] = $request->file('id_card')->store('admissions', 'public');
        }
        if ($request->hasFile('passport')) {
            $data['passport'] = $request->file('passport')->store('passports', 'public');
        }

        $admission->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Application updated successfully',
            'data' => [
                'admission' => $admission->fresh()->load(['admissionSession', 'department'])
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        // Find the admission record for the authenticated user
        $admission = $request->user()->admissions()->findOrFail($id);

        // Validate the request data (customize as needed)
        $validated = $request->validate([
            'admission_session_id' => 'sometimes|exists:admission_sessions,id',
            'department_id' => 'sometimes|exists:departments,id',
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            // Add other fields and validation rules as needed
        ]);

        // Update the admission with validated data
        $admission->update($validated);

        // If you handle file uploads, add logic here

        return response()->json([
            'message' => 'Admission updated successfully',
            'admission' => $admission->fresh(),
        ]);
    }
} 