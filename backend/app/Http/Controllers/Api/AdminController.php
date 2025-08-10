<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\AdmissionSession;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Payment;
use App\Models\Program;
use App\Models\Setting;
use App\Models\User;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics.
     */
    public function dashboard()
    {
        $totalApplications = Application::count();
        $pendingApplications = Application::whereIn('status', ['submitted', 'under_review'])->count();
        $approvedApplications = Application::where('status', 'approved')->count();
        $totalRevenue = Payment::where('status', 'successful')->sum('amount');
        $totalDepartments = Department::where('is_active', true)->count();
        $totalFaculties = Faculty::where('is_active', true)->count();
        $totalStaff = Staff::where('active', true)->count();
        
        // Applicant statistics
        $totalApplicants = User::where('role', 'user')->count();
        $activeApplicants = User::where('role', 'user')->where('status', 'active')->count();
        $inactiveApplicants = User::where('role', 'user')->where('status', 'inactive')->count();
        $suspendedApplicants = User::where('role', 'user')->where('status', 'suspended')->count();
        $applicantsWithApplications = User::where('role', 'user')->whereHas('applications')->count();
        $applicantsWithPayments = User::where('role', 'user')->whereHas('payments')->count();

        return response()->json([
            'total_applications' => $totalApplications,
            'pending_applications' => $pendingApplications,
            'approved_applications' => $approvedApplications,
            'total_revenue' => $totalRevenue,
            'total_departments' => $totalDepartments,
            'total_faculties' => $totalFaculties,
            'total_staff' => $totalStaff,
            'total_applicants' => $totalApplicants,
            'active_applicants' => $activeApplicants,
            'inactive_applicants' => $inactiveApplicants,
            'suspended_applicants' => $suspendedApplicants,
            'applicants_with_applications' => $applicantsWithApplications,
            'applicants_with_payments' => $applicantsWithPayments,
        ]);
    }

    /**
     * Get all admissions with filtering.
     */
    public function applications(Request $request)
    {
        $query = Application::with(['user', 'department', 'admissionSession']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('session_id')) {
            $query->where('admission_session_id', $request->session_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('application_number', 'like', "%{$search}%");
            });
        }

        // Apply date filters
        if ($request->filled('date_filter')) {
            $dateFilter = $request->date_filter;
            $now = now();
            
            switch ($dateFilter) {
                case 'today':
                    $query->whereDate('created_at', $now->toDateString());
                    break;
                case 'yesterday':
                    $query->whereDate('created_at', $now->copy()->subDay()->toDateString());
                    break;
                case 'this_week':
                    $query->whereBetween('created_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()]);
                    break;
                case 'this_month':
                    $query->whereBetween('created_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()]);
                    break;
                case 'last_month':
                    $lastMonth = $now->copy()->subMonth();
                    $query->whereBetween('created_at', [$lastMonth->startOfMonth(), $lastMonth->endOfMonth()]);
                    break;
                case 'last_three_months':
                    $query->whereBetween('created_at', [$now->copy()->subMonths(3), $now]);
                    break;
                case 'custom_range':
                    if ($request->filled('start_date') && $request->filled('end_date')) {
                        $query->whereBetween('created_at', [
                            $request->start_date . ' 00:00:00',
                            $request->end_date . ' 23:59:59'
                        ]);
                    }
                    break;
            }
        }

        $applications = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'status' => true,
            'data' => $applications
        ]);
    }

    /**
     * Get admission details.
     */
    public function applicationDetails($id)
    {
        $application = Application::with(['user', 'department', 'admissionSession', 'academicBackgrounds'])->findOrFail($id);
        return response()->json([
            'status' => true,
            'data' => $application
        ]);
    }

    /**
     * Update admission status.
     */
    public function updateApplicationStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,submitted,under_review,approved,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = Application::findOrFail($id);
        $application->status = $request->status;
        if ($request->filled('admin_notes')) {
            $application->admin_notes = $request->admin_notes;
        }
        $application->save();

        return response()->json(['message' => 'Application status updated successfully']);
    }

    // ==================== FACULTY MANAGEMENT ====================

    /**
     * Get all faculties.
     */
    public function faculties(Request $request)
    {
        $this->authorize('view-faculties');
        $faculties = Faculty::with('departments')->orderBy('name')->get();
        return response()->json([
            'status' => true,
            'data' => $faculties
        ]);
    }

    /**
     * Store a new faculty.
     */
    public function storeFaculty(Request $request)
    {
        $this->authorize('manage-faculties');
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:faculties,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $faculty = Faculty::create($request->all());
        return response()->json([
            'message' => 'Faculty created successfully',
            'faculty' => $faculty
        ], 201);
    }

    /**
     * Update a faculty.
     */
    public function updateFaculty(Request $request, $id)
    {
        $this->authorize('manage-faculties');
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:faculties,code,' . $id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $faculty = Faculty::findOrFail($id);
        $faculty->update($request->all());

        return response()->json([
            'message' => 'Faculty updated successfully',
            'faculty' => $faculty
        ]);
    }

    /**
     * Delete a faculty.
     */
    public function deleteFaculty($id)
    {
        $this->authorize('manage-faculties');
        $faculty = Faculty::findOrFail($id);
        
        // Check if faculty has departments
        if ($faculty->departments()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete faculty with existing departments'
            ], 422);
        }

        $faculty->delete();
        return response()->json(['message' => 'Faculty deleted successfully']);
    }

    // ==================== DEPARTMENT MANAGEMENT ====================

    /**
     * Get all departments.
     */
    public function departments()
    {
        $departments = Department::with('faculty')->orderBy('name')->get();
        return response()->json([
            'status' => true,
            'data' => $departments
        ]);
    }

    /**
     * Store a new department.
     */
    public function storeDepartment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:departments,code',
            'description' => 'nullable|string',
            'faculty_id' => 'required|exists:faculties,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $department = Department::create($request->all());
        return response()->json([
            'message' => 'Department created successfully',
            'department' => $department->load('faculty')
        ], 201);
    }

    /**
     * Update a department.
     */
    public function updateDepartment(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:departments,code,' . $id,
            'description' => 'nullable|string',
            'faculty_id' => 'required|exists:faculties,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $department = Department::findOrFail($id);
        $department->update($request->all());

        return response()->json([
            'message' => 'Department updated successfully',
            'department' => $department->load('faculty')
        ]);
    }

    /**
     * Delete a department.
     */
    public function deleteDepartment($id)
    {
        $department = Department::findOrFail($id);
        
        // Check if department has admissions
        if ($department->admissions()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete department with existing admissions'
            ], 422);
        }

        $department->delete();
        return response()->json(['message' => 'Department deleted successfully']);
    }

    // ==================== PROGRAM MANAGEMENT ====================

    /**
     * Get all programs.
     */
    public function programs()
    {
        $programs = Program::with(['department.faculty'])->orderBy('name')->get();
        return response()->json([
            'status' => true,
            'data' => $programs
        ]);
    }

    /**
     * Store a new program.
     */
    public function storeProgram(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:programs,code',
            'description' => 'nullable|string',
            'type' => 'required|in:undergraduate,postgraduate,national_diploma,higher_national_diploma,certificate,diploma',
            'duration_years' => 'required|integer|min:1|max:10',
            'duration_semesters' => 'required|integer|min:1|max:20',
            'tuition_fee' => 'nullable|numeric|min:0',
            'acceptance_fee' => 'nullable|numeric|min:0',
            'use_default_form_fee' => 'boolean',
            'form_fee' => 'nullable|numeric|min:0',
            'department_id' => 'required|exists:departments,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $program = Program::create($request->all());
        return response()->json([
            'message' => 'Program created successfully',
            'program' => $program->load('department.faculty')
        ], 201);
    }

    /**
     * Update a program.
     */
    public function updateProgram(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:programs,code,' . $id,
            'description' => 'nullable|string',
            'type' => 'required|in:undergraduate,postgraduate,national_diploma,higher_national_diploma,certificate,diploma',
            'duration_years' => 'required|integer|min:1|max:10',
            'duration_semesters' => 'required|integer|min:1|max:20',
            'tuition_fee' => 'nullable|numeric|min:0',
            'acceptance_fee' => 'nullable|numeric|min:0',
            'use_default_form_fee' => 'boolean',
            'form_fee' => 'nullable|numeric|min:0',
            'department_id' => 'required|exists:departments,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $program = Program::findOrFail($id);
        $program->update($request->all());

        return response()->json([
            'message' => 'Program updated successfully',
            'program' => $program->load('department.faculty')
        ]);
    }

    /**
     * Delete a program.
     */
    public function deleteProgram($id)
    {
        $program = Program::findOrFail($id);
        
        // Check if program has applications
        if ($program->applications()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete program with existing applications'
            ], 422);
        }

        $program->delete();
        return response()->json(['message' => 'Program deleted successfully']);
    }

    // ==================== ADMISSION SESSION MANAGEMENT ====================

    /**
     * Get all admission sessions.
     */
    public function admissionSessions()
    {
        $sessions = AdmissionSession::orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => true,
            'data' => $sessions
        ]);
    }

    /**
     * Store a new admission session.
     */
    public function storeAdmissionSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'academic_year' => 'required|string|max:20',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'form_price' => 'required|numeric|min:0',
            'admission_fee' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive,closed',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // If creating an active session, deactivate all other sessions first
        if ($request->status === 'active') {
            // Deactivate all other active sessions
            AdmissionSession::where('status', 'active')->update(['status' => 'inactive']);
        }

        $session = AdmissionSession::create($request->all());
        return response()->json([
            'message' => 'Admission session created successfully',
            'session' => $session
        ], 201);
    }

    /**
     * Update an admission session.
     */
    public function updateAdmissionSession(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'academic_year' => 'required|string|max:20',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'form_price' => 'required|numeric|min:0',
            'admission_fee' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive,closed',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $session = AdmissionSession::findOrFail($id);
        
        // If trying to activate this session, deactivate all other sessions first
        if ($request->status === 'active' && $session->status !== 'active') {
            // Deactivate all other active sessions
            AdmissionSession::where('status', 'active')
                ->where('id', '!=', $id)
                ->update(['status' => 'inactive']);
        }

        $session->update($request->all());

        return response()->json([
            'message' => 'Admission session updated successfully',
            'session' => $session
        ]);
    }

    /**
     * Delete an admission session.
     */
    public function deleteAdmissionSession($id)
    {
        $session = AdmissionSession::findOrFail($id);
        
        // Check if session has admissions
        if ($session->admissions()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete session with existing admissions'
            ], 422);
        }

        $session->delete();
        return response()->json(['message' => 'Admission session deleted successfully']);
    }

    /**
     * Get the currently active admission session.
     */
    public function getActiveAdmissionSession()
    {
        $activeSession = AdmissionSession::where('status', 'active')->first();
        
        return response()->json([
            'status' => true,
            'data' => [
                'active_session' => $activeSession
            ]
        ]);
    }

    /**
     * Get admission session statistics.
     */
    public function admissionSessionStats($id)
    {
        $session = AdmissionSession::findOrFail($id);
        
        // Application statistics using the new applications table
        $totalApplications = Application::where('admission_session_id', $id)->count();
        $pendingApplications = Application::where('admission_session_id', $id)
            ->whereIn('status', ['submitted', 'under_review'])->count();
        $approvedApplications = Application::where('admission_session_id', $id)
            ->where('status', 'approved')->count();
        $rejectedApplications = Application::where('admission_session_id', $id)
            ->where('status', 'rejected')->count();
        $draftApplications = Application::where('admission_session_id', $id)
            ->where('status', 'draft')->count();
        
        // Payment statistics for this session
        $formPayments = Payment::where('type', 'form_purchase')
            ->whereHas('application', function($query) use ($id) {
                $query->where('admission_session_id', $id);
            })
            ->where('status', 'successful')
            ->count();
            
        $admissionFeePayments = Payment::where('type', 'admission_fee')
            ->where(function($query) use ($id) {
                $query->whereHas('application', function($appQuery) use ($id) {
                    $appQuery->where('admission_session_id', $id);
                })
                ->orWhereHas('admission', function($admQuery) use ($id) {
                    $admQuery->whereHas('application', function($appQuery) use ($id) {
                        $appQuery->where('admission_session_id', $id);
                    });
                });
            })
            ->where('status', 'successful')
            ->count();
            
        $acceptanceFeePayments = Payment::where('type', 'acceptance_fee')
            ->where(function($query) use ($id) {
                $query->whereHas('application', function($appQuery) use ($id) {
                    $appQuery->where('admission_session_id', $id);
                })
                ->orWhereHas('admission', function($admQuery) use ($id) {
                    $admQuery->whereHas('application', function($appQuery) use ($id) {
                        $appQuery->where('admission_session_id', $id);
                    });
                });
            })
            ->where('status', 'successful')
            ->count();
        
        // Revenue calculations
        $formRevenue = Payment::where('type', 'form_purchase')
            ->whereHas('application', function($query) use ($id) {
                $query->where('admission_session_id', $id);
            })
            ->where('status', 'successful')
            ->sum('amount');
            
        $admissionFeeRevenue = Payment::where('type', 'admission_fee')
            ->where(function($query) use ($id) {
                $query->whereHas('application', function($appQuery) use ($id) {
                    $appQuery->where('admission_session_id', $id);
                })
                ->orWhereHas('admission', function($admQuery) use ($id) {
                    $admQuery->whereHas('application', function($appQuery) use ($id) {
                        $appQuery->where('admission_session_id', $id);
                    });
                });
            })
            ->where('status', 'successful')
            ->sum('amount');
            
        $acceptanceFeeRevenue = Payment::where('type', 'acceptance_fee')
            ->where(function($query) use ($id) {
                $query->whereHas('application', function($appQuery) use ($id) {
                    $appQuery->where('admission_session_id', $id);
                })
                ->orWhereHas('admission', function($admQuery) use ($id) {
                    $admQuery->whereHas('application', function($appQuery) use ($id) {
                        $appQuery->where('admission_session_id', $id);
                    });
                });
            })
            ->where('status', 'successful')
            ->sum('amount');
        
        $totalRevenue = $formRevenue + $admissionFeeRevenue + $acceptanceFeeRevenue;
        
        // Faculty-wise application distribution
        $facultyStats = Application::where('admission_session_id', $id)
            ->with('department.faculty')
            ->get()
            ->groupBy('department.faculty_id')
            ->map(function($applications, $facultyId) {
                $faculty = $applications->first()->department->faculty;
                return [
                    'faculty_id' => $facultyId,
                    'faculty_name' => $faculty ? $faculty->name : 'Unknown',
                    'total_applications' => $applications->count(),
                    'approved_applications' => $applications->where('status', 'approved')->count(),
                    'pending_applications' => $applications->whereIn('status', ['submitted', 'under_review'])->count(),
                    'rejected_applications' => $applications->where('status', 'rejected')->count(),
                ];
            })
            ->values();
        
        // Department-wise application distribution
        $departmentStats = Application::where('admission_session_id', $id)
            ->with('department')
            ->get()
            ->groupBy('department_id')
            ->map(function($applications, $deptId) {
                $dept = $applications->first()->department;
                return [
                    'department_id' => $deptId,
                    'department_name' => $dept ? $dept->name : 'Unknown',
                    'total_applications' => $applications->count(),
                    'approved_applications' => $applications->where('status', 'approved')->count(),
                    'pending_applications' => $applications->whereIn('status', ['submitted', 'under_review'])->count(),
                    'rejected_applications' => $applications->where('status', 'rejected')->count(),
                ];
            })
            ->values();
        
        // Monthly application trends
        $monthlyStats = Application::where('admission_session_id', $id)
            ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function($stat) {
                return [
                    'month' => $stat->month,
                    'year' => $stat->year,
                    'month_name' => date('F', mktime(0, 0, 0, $stat->month, 1)),
                    'applications_count' => $stat->count,
                ];
            });
        
        $stats = [
            // Application counts
            'total_applications' => $totalApplications,
            'pending_applications' => $pendingApplications,
            'approved_applications' => $approvedApplications,
            'rejected_applications' => $rejectedApplications,
            'draft_applications' => $draftApplications,
            
            // Payment counts
            'form_payments' => $formPayments,
            'admission_fee_payments' => $admissionFeePayments,
            'acceptance_fee_payments' => $acceptanceFeePayments,
            
            // Revenue breakdown
            'form_revenue' => $formRevenue,
            'admission_fee_revenue' => $admissionFeeRevenue,
            'acceptance_fee_revenue' => $acceptanceFeeRevenue,
            'total_revenue' => $totalRevenue,
            
            // Additional statistics
            'faculty_stats' => $facultyStats,
            'department_stats' => $departmentStats,
            'monthly_trends' => $monthlyStats,
            
            // Session info
            'session_name' => $session->name,
            'session_academic_year' => $session->academic_year,
            'session_start_date' => $session->start_date ? $session->start_date->format('Y-m-d') : null,
            'session_end_date' => $session->end_date ? $session->end_date->format('Y-m-d') : null,
            'session_form_price' => $session->form_price,
            'session_status' => $session->status,
        ];

        return response()->json($stats);
    }

    /**
     * Get payments report.
     */
    public function payments(Request $request)
    {
        $query = Payment::with(['user', 'admission']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('first_name', 'like', "%{$search}%")
                              ->orWhere('last_name', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('reference', 'like', "%{$search}%")
                ->orWhere('paystack_reference', 'like', "%{$search}%");
            });
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json([
            'status' => true,
            'data' => $payments
        ]);
    }

    /**
     * Get public settings (school name and logo).
     */
    public function getPublicSettings()
    {
        $settings = [
            'school_name' => Setting::get('school_name', ''),
            'school_motto' => Setting::get('school_motto', 'Excellence in Education'),
            'school_address' => Setting::get('school_address', 'University Address, City, State'),
            'school_phone' => Setting::get('school_phone', '+234 XXX XXX XXXX'),
            'school_email' => Setting::get('school_email', 'info@university.edu.ng'),
            'registrar_name' => Setting::get('registrar_name', 'Registrar'),
            'registrar_title' => Setting::get('registrar_title', 'Registrar'),
            'print_logo' => Setting::get('print_logo', ''),
            'paystack_public_key' => Setting::get('paystack_public_key', config('services.paystack.public')),
        ];

        return response()->json([
            'status' => true,
            'data' => $settings
        ]);
    }

    public function getSettings()
    {
        $settings = [
            'school_name' => Setting::get('school_name', ''),
            'school_motto' => Setting::get('school_motto', 'Excellence in Education'),
            'school_address' => Setting::get('school_address', 'University Address, City, State'),
            'school_phone' => Setting::get('school_phone', '+234 XXX XXX XXXX'),
            'school_email' => Setting::get('school_email', 'info@university.edu.ng'),
            'registrar_name' => Setting::get('registrar_name', 'Registrar'),
            'registrar_title' => Setting::get('registrar_title', 'Registrar'),
            'print_logo' => Setting::get('print_logo', ''),
            'admin_logo' => Setting::get('admin_logo', ''),
            'form_amount' => Setting::get('form_amount', 0),
            'currency' => Setting::get('currency', 'NGN'),
            'paystack_public_key' => Setting::get('paystack_public_key', ''),
            'paystack_secret_key' => Setting::get('paystack_secret_key', ''),
        ];

        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_name' => 'required|string|max:255',
            'school_motto' => 'nullable|string|max:255',
            'school_address' => 'nullable|string|max:500',
            'school_phone' => 'nullable|string|max:50',
            'school_email' => 'nullable|email|max:255',
            'registrar_name' => 'nullable|string|max:255',
            'registrar_title' => 'nullable|string|max:255',
            'form_amount' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'paystack_public_key' => 'required|string',
            'paystack_secret_key' => 'required|string',
            'print_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'admin_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Handle file uploads
        if ($request->hasFile('print_logo')) {
            $printLogoPath = $request->file('print_logo')->store('logos', 'public');
            Setting::set('print_logo', $printLogoPath, 'file');
        }

        if ($request->hasFile('admin_logo')) {
            $adminLogoPath = $request->file('admin_logo')->store('logos', 'public');
            Setting::set('admin_logo', $adminLogoPath, 'file');
        }

        // Update other settings
        Setting::set('school_name', $request->school_name);
        Setting::set('school_motto', $request->school_motto);
        Setting::set('school_address', $request->school_address);
        Setting::set('school_phone', $request->school_phone);
        Setting::set('school_email', $request->school_email);
        Setting::set('registrar_name', $request->registrar_name);
        Setting::set('registrar_title', $request->registrar_title);
        Setting::set('form_amount', $request->form_amount, 'number');
        Setting::set('currency', $request->currency);
        Setting::set('paystack_public_key', $request->paystack_public_key);
        Setting::set('paystack_secret_key', $request->paystack_secret_key);

        return response()->json(['message' => 'Settings updated successfully']);
    }

    /**
     * Get the default acceptance fee from settings
     */
    public function getDefaultAcceptanceFee()
    {
        $fee = \App\Models\Setting::get('acceptance_fee', 50000);
        return response()->json([
            'success' => true,
            'acceptance_fee' => $fee
        ]);
    }

    /**
     * Get recent activity for the admin dashboard.
     */
    public function recentActivity()
    {
        // Recent applications
        $recentApplications = \App\Models\Application::with(['user', 'department'])
            ->orderBy('updated_at', 'desc')
            ->take(12)
            ->get()
            ->map(function($app) {
                return [
                    'type' => 'application',
                    'user' => $app->user ? $app->user->name : 'Unknown',
                    'description' => 'Application ' . ($app->status ? ucfirst($app->status) : 'updated') . ' for ' . ($app->department->name ?? 'Department'),
                    'timestamp' => $app->updated_at,
                ];
            });

        // Recent payments
        $recentPayments = \App\Models\Payment::with(['user'])
            ->orderBy('updated_at', 'desc')
            ->take(12)
            ->get()
            ->map(function($pay) {
                return [
                    'type' => 'payment',
                    'user' => $pay->user ? $pay->user->name : 'Unknown',
                    'description' => 'Payment of ₦' . number_format($pay->amount, 2) . ' (' . ucfirst($pay->type) . ') ' . ucfirst($pay->status),
                    'timestamp' => $pay->updated_at,
                ];
            });

        // Recent admin actions (status/settings changes)
        $recentAdminActions = [];
        // If you have an AdminAction or AuditLog model, fetch here. Otherwise, this is a placeholder.
        // Example:
        // $recentAdminActions = AdminAction::orderBy('created_at', 'desc')->take(10)->get()->map(...);

        // Merge and sort all activities by timestamp desc
        $allActivities = $recentApplications
            ->merge($recentPayments)
            ->merge($recentAdminActions)
            ->sortByDesc('timestamp')
            ->values()
            ->take(20);

        return response()->json([
            'status' => true,
            'data' => $allActivities
        ]);
    }

    // ==================== APPLICANT MANAGEMENT ====================

    /**
     * Get all applicants (normal users) with filtering and pagination.
     */
    public function applicants(Request $request)
    {
        try {
            $query = User::where('role', 'user')
                ->with(['applications.admissionSession', 'applications.department', 'payments', 'admissions.department', 'admissions.admissionSession']);

            // Apply filters
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhereHas('applications', function($appQuery) use ($search) {
                          $appQuery->where('application_number', 'like', "%{$search}%")
                                  ->orWhere('first_name', 'like', "%{$search}%")
                                  ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('session_id')) {
                $query->whereHas('applications', function($appQuery) use ($request) {
                    $appQuery->where('admission_session_id', $request->session_id);
                });
            }

            $applicants = $query->orderBy('created_at', 'desc')->paginate(15);

            \Log::info('Applicants API Response', [
                'count' => $applicants->count(),
                'total' => $applicants->total(),
                'data_structure' => get_class($applicants),
                'first_user' => $applicants->first() ? $applicants->first()->toArray() : null
            ]);

            return response()->json([
                'status' => true,
                'data' => $applicants->items(),
                'pagination' => [
                    'current_page' => $applicants->currentPage(),
                    'per_page' => $applicants->perPage(),
                    'total' => $applicants->total(),
                    'last_page' => $applicants->lastPage()
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in applicants method: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error fetching applicants',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed applicant information.
     */
    public function applicantDetails($id)
    {
        $applicant = User::where('role', 'user')
            ->with([
                'applications.admissionSession', 
                'applications.department', 
                'payments', 
                'admissions.department', 
                'admissions.admissionSession'
            ])->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $applicant
        ]);
    }

    /**
     * Update applicant status.
     */
    public function updateApplicantStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive,suspended',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $applicant = User::where('role', 'user')->findOrFail($id);
        $applicant->status = $request->status;
        if ($request->filled('notes')) {
            $applicant->admin_notes = $request->notes;
        }
        $applicant->save();

        return response()->json([
            'message' => 'Applicant status updated successfully',
            'applicant' => $applicant
        ]);
    }
} 