<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\AcademicBackground;
use App\Models\AdmissionSession;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Program;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    /**
     * Get all applications for the authenticated user.
     */
    public function index(Request $request)
    {
        $applications = $request->user()->applications()
            ->with(['admissionSession', 'department', 'academicBackgrounds'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => [
                'applications' => $applications
            ]
        ]);
    }

    /**
     * Store a new application.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'admission_session_id' => 'required|exists:admission_sessions,id',
            'department_id' => 'required|exists:departments,id',
            'program_id' => 'required|exists:programs,id',
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
            'previous_school' => 'nullable|string|max:255',
            'previous_qualification' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'cgpa' => 'nullable|numeric|min:0|max:5',
            'jamb_registration_number' => 'nullable|string|max:255',
            'jamb_year' => 'nullable|integer|min:2000|max:' . (date('Y') + 1),
            'jamb_score' => 'nullable|integer|min:0|max:400',
            'is_first_choice' => 'nullable|in:0,1,true,false',
            'academic_backgrounds' => 'required|array|min:1',
            'academic_backgrounds.*.school_name' => 'required|string|max:255',
            'academic_backgrounds.*.qualification' => 'required|string|max:255',
            'academic_backgrounds.*.graduation_year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'academic_backgrounds.*.cgpa' => 'nullable|numeric|min:0|max:5',
            'academic_backgrounds.*.certificate_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
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
            $transcriptPath = $request->file('transcript')->store('applications', 'public');
        }
        if ($request->hasFile('certificate')) {
            $certificatePath = $request->file('certificate')->store('applications', 'public');
        }
        if ($request->hasFile('id_card')) {
            $idCardPath = $request->file('id_card')->store('applications', 'public');
        }
        if ($request->hasFile('passport')) {
            $passportPath = $request->file('passport')->store('passports', 'public');
        }

        // Check if user has already applied for this session
        $existingApplication = $request->user()->applications()
            ->where('admission_session_id', $request->admission_session_id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'status' => false,
                'message' => 'You have already applied for this admission session'
            ], 400);
        }

        // Check if the program's application period is active
        $program = Program::findOrFail($request->program_id);
        if (!$program->isApplicationPeriodActive()) {
            return response()->json([
                'status' => false,
                'message' => 'Applications for this program are currently closed. ' . $program->application_period_status
            ], 400);
        }

        // Generate application number: APPYYYYMMDD5RandomDigitsSerialNo
        $dateString = date('Ymd'); // YYYYMMDD format
        $randomDigits = str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT); // 5 random digits
        $serialNo = str_pad(Application::count() + 1, 2, '0', STR_PAD_LEFT); // 2-digit serial number with 1 leading zero
        $applicationNumber = "APP{$dateString}{$randomDigits}{$serialNo}";

        $application = $request->user()->applications()->create([
            'admission_session_id' => $request->admission_session_id,
            'department_id' => $request->department_id,
            'program_id' => $request->program_id,
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
            'jamb_registration_number' => $request->jamb_registration_number,
            'jamb_year' => $request->jamb_year,
            'jamb_score' => $request->jamb_score,
            'is_first_choice' => $request->has('is_first_choice') ? (bool)$request->is_first_choice : false,
            'transcript' => $transcriptPath,
            'certificate' => $certificatePath,
            'id_card' => $idCardPath,
            'passport' => $passportPath,
            'status' => 'submitted', // Set initial status to submitted
        ]);

        // Save academic backgrounds
        if ($request->has('academic_backgrounds')) {
            foreach ($request->academic_backgrounds as $backgroundData) {
                // Handle certificate file upload
                $certificateFilePath = null;
                if (isset($backgroundData['certificate_file']) && $backgroundData['certificate_file'] instanceof \Illuminate\Http\UploadedFile) {
                    $certificateFilePath = $backgroundData['certificate_file']->store('academic_certificates', 'public');
                }

                $application->academicBackgrounds()->create([
                    'school_name' => $backgroundData['school_name'],
                    'qualification' => $backgroundData['qualification'],
                    'graduation_year' => $backgroundData['graduation_year'],
                    'cgpa' => $backgroundData['cgpa'] ?? null,
                    'certificate_file' => $certificateFilePath,
                ]);
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Application submitted successfully',
            'data' => [
                'application' => $application->load(['admissionSession', 'department', 'program', 'academicBackgrounds'])
            ]
        ], 201);
    }

    /**
     * Get a specific application.
     */
    public function show(Request $request, $id)
    {
        $application = $request->user()->applications()
            ->with(['admissionSession', 'department', 'program', 'payments', 'academicBackgrounds'])
            ->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => [
                'application' => $application
            ]
        ]);
    }

    /**
     * Update application data.
     */
    public function update(Request $request, $id)
    {
        $application = $request->user()->applications()->findOrFail($id);

        // Validation rules (same as store, but all fields are sometimes)
        $validator = Validator::make($request->all(), [
            'admission_session_id' => 'sometimes|exists:admission_sessions,id',
            'department_id' => 'sometimes|exists:departments,id',
            'program_id' => 'sometimes|exists:programs,id',
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'date_of_birth' => 'sometimes|date',
            'gender' => 'sometimes|in:male,female,other',
            'nationality' => 'sometimes|string|max:255',
            'state_of_origin' => 'sometimes|string|max:255',
            'local_government' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
            'phone' => 'sometimes|string|max:20',
            'email' => 'sometimes|email|max:255',
            'emergency_contact_name' => 'sometimes|string|max:255',
            'emergency_contact_phone' => 'sometimes|string|max:20',
            'emergency_contact_relationship' => 'sometimes|string|max:255',
            'previous_school' => 'sometimes|string|max:255',
            'previous_qualification' => 'sometimes|string|max:255',
            'graduation_year' => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'cgpa' => 'nullable|numeric|min:0|max:5',
            'jamb_registration_number' => 'sometimes|string|max:255',
            'jamb_year' => 'sometimes|integer|min:2000|max:' . (date('Y') + 1),
            'jamb_score' => 'sometimes|integer|min:0|max:400',
            'is_first_choice' => 'sometimes|in:0,1,true,false',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        // Handle boolean conversion for is_first_choice
        if (isset($data['is_first_choice'])) {
            $data['is_first_choice'] = (bool)$data['is_first_choice'];
        }

        // Handle file uploads
        if ($request->hasFile('transcript')) {
            $data['transcript'] = $request->file('transcript')->store('applications', 'public');
        }
        if ($request->hasFile('certificate')) {
            $data['certificate'] = $request->file('certificate')->store('applications', 'public');
        }
        if ($request->hasFile('id_card')) {
            $data['id_card'] = $request->file('id_card')->store('applications', 'public');
        }
        if ($request->hasFile('passport')) {
            $data['passport'] = $request->file('passport')->store('passports', 'public');
        }

        $application->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Application updated successfully',
            'data' => [
                'application' => $application->fresh()->load(['admissionSession', 'department', 'program'])
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
     * Get available departments grouped by faculty.
     */
    public function departments()
    {
        $faculties = Faculty::with(['departments' => function($query) {
            $query->active();
        }])->active()->get();

        return response()->json([
            'status' => true,
            'data' => [
                'faculties' => $faculties,
                'departments' => Department::with(['faculty', 'programs' => function($query) {
                    $query->active();
                }])->active()->get()
            ]
        ]);
    }

    /**
     * Get programs for a specific department.
     */
    public function departmentPrograms($id)
    {
        $department = Department::with(['programs' => function($query) {
            $query->active();
        }])->findOrFail($id);

        // Add application period information to each program
        $programs = $department->programs->map(function($program) {
            $program->application_period_active = $program->isApplicationPeriodActive();
            $program->application_period_status = $program->application_period_status;
            return $program;
        });

        return response()->json([
            'status' => true,
            'data' => $programs
        ]);
    }

    /**
     * Get form fee for a specific program.
     */
    public function programFormFee($id)
    {
        $program = Program::findOrFail($id);
        $defaultFormFee = Setting::get('form_amount', 5000);

        // Add application period information to the program
        $program->application_period_active = $program->isApplicationPeriodActive();
        $program->application_period_status = $program->application_period_status;

        return response()->json([
            'status' => true,
            'data' => [
                'program' => $program,
                'form_fee' => $program->effective_form_fee,
                'default_form_fee' => $defaultFormFee,
                'uses_default' => $program->use_default_form_fee
            ]
        ]);
    }
} 