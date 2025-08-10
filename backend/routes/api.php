<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdmissionController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AdmissionOfferController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AccountantController;
use App\Http\Controllers\Api\HRController;
use App\Http\Controllers\Api\StaffAuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ------------------- Applicant/User Auth -------------------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/email', [AuthController::class, 'sendResetLinkEmail']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// ------------------- Staff/Admin Auth -------------------
Route::post('/staff/login', [StaffAuthController::class, 'login']);
Route::middleware('auth:staff-api')->group(function () {
    Route::post('/staff/logout', [StaffAuthController::class, 'logout']);
    Route::get('/staff/user', [StaffAuthController::class, 'user']);
    // Add staff password change, etc. here
});

// ------------------- Public Routes -------------------
Route::get('/test', function() {
    return response()->json(['status' => 'success', 'message' => 'API is working']);
});
Route::get('/settings', [AdminController::class, 'getPublicSettings']);
Route::get('/payments/verify', [PaymentController::class, 'verifyGet']);

// ------------------- Applicant/User Protected Routes -------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    // Application routes
    Route::get('/departments', [ApplicationController::class, 'departments']);
    Route::get('/sessions', [ApplicationController::class, 'sessions']);
    Route::get('/departments/{id}/programs', [ApplicationController::class, 'departmentPrograms']);
    Route::get('/programs/{id}/form-fee', [ApplicationController::class, 'programFormFee']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{id}', [ApplicationController::class, 'show']);
    Route::put('/applications/{id}', [ApplicationController::class, 'update']);
    
    // Admission routes (for admission offers)
    Route::post('/admissions/{id}/accept', [AdmissionController::class, 'accept']);
    Route::post('/admissions/{id}/reject', [AdmissionController::class, 'reject']);
    
    // Admission offer routes
    Route::get('/admission-offers', [AdmissionOfferController::class, 'getUserAdmissionOffers']);
    Route::get('/admission-offers/{id}', [AdmissionOfferController::class, 'getAdmissionOffer']);
    Route::post('/admission-offers/{id}/accept', [AdmissionOfferController::class, 'acceptAdmissionOffer']);
    Route::post('/admission-offers/{id}/decline', [AdmissionOfferController::class, 'declineAdmissionOffer']);
    // Payment routes
    Route::post('/payments/initialize', [PaymentController::class, 'initialize']);
    Route::post('/payments/verify', [PaymentController::class, 'verify']);
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/history', [PaymentController::class, 'history']);
    Route::get('/payments/by-reference', [PaymentController::class, 'getPaymentByReference']);
});

// ------------------- Staff/Admin Protected Routes -------------------
Route::middleware('auth:staff-api')->group(function () {
    // Admin dashboard and management
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/applications', [AdminController::class, 'applications']);
    Route::get('/admin/applications/{id}', [AdminController::class, 'applicationDetails']);
    Route::put('/admin/applications/{id}/status', [AdminController::class, 'updateApplicationStatus']);
    Route::get('/admin/payments', [AdminController::class, 'payments']);
    Route::get('/admin/recent-activity', [AdminController::class, 'recentActivity']);
    // Faculty management
    Route::get('/admin/faculties', [AdminController::class, 'faculties']);
    Route::post('/admin/faculties', [AdminController::class, 'storeFaculty']);
    Route::put('/admin/faculties/{id}', [AdminController::class, 'updateFaculty']);
    Route::delete('/admin/faculties/{id}', [AdminController::class, 'deleteFaculty']);
    
    // Department management
    Route::get('/admin/departments', [AdminController::class, 'departments']);
    Route::post('/admin/departments', [AdminController::class, 'storeDepartment']);
    Route::put('/admin/departments/{id}', [AdminController::class, 'updateDepartment']);
    Route::delete('/admin/departments/{id}', [AdminController::class, 'deleteDepartment']);
    
    // Program management
    Route::get('/admin/programs', [AdminController::class, 'programs']);
    Route::post('/admin/programs', [AdminController::class, 'storeProgram']);
    Route::put('/admin/programs/{id}', [AdminController::class, 'updateProgram']);
    Route::delete('/admin/programs/{id}', [AdminController::class, 'deleteProgram']);
    // Admission session management
    Route::get('/admin/admission-sessions', [AdminController::class, 'admissionSessions']);
    Route::get('/admin/admission-sessions/active', [AdminController::class, 'getActiveAdmissionSession']);
    Route::post('/admin/admission-sessions', [AdminController::class, 'storeAdmissionSession']);
    Route::put('/admin/admission-sessions/{id}', [AdminController::class, 'updateAdmissionSession']);
    Route::delete('/admin/admission-sessions/{id}', [AdminController::class, 'deleteAdmissionSession']);
    Route::get('/admin/admission-sessions/{id}/stats', [AdminController::class, 'admissionSessionStats']);
    
    // Admission offer management (admin)
    Route::get('/admin/admission-offers', [AdmissionOfferController::class, 'getAllAdmissionOffers']);
    Route::post('/admin/admission-offers/upload', [AdmissionOfferController::class, 'uploadAdmittedStudents']);
    Route::put('/admin/admission-offers/{id}', [AdmissionOfferController::class, 'updateAdmissionOffer']);
    
    // Applicant management
    Route::get('/admin/applicants', [AdminController::class, 'applicants']);
    Route::get('/admin/applicants/{id}', [AdminController::class, 'applicantDetails']);
    Route::put('/admin/applicants/{id}/status', [AdminController::class, 'updateApplicantStatus']);
    
    // Settings
    Route::get('/admin/settings', [AdminController::class, 'getSettings']);
    Route::post('/admin/settings', [AdminController::class, 'updateSettings']);
    Route::get('/admin/settings/acceptance-fee', [AdminController::class, 'getDefaultAcceptanceFee']);
    // Accountant
    Route::middleware(['role:accountant'])->group(function () {
        Route::get('/accountant/dashboard', [AccountantController::class, 'dashboard']);
    });
    // Payment management
    Route::middleware(['permission:manage-payments'])->group(function () {
        Route::post('/payments/process', [PaymentController::class, 'process']);
    });
    // HR module (super-admin only)
    Route::middleware(['role:super-admin'])->group(function () {
        Route::get('/hr/admins', [HRController::class, 'listAdmins']);
        Route::get('/hr/roles', [HRController::class, 'listRoles']);
        Route::post('/hr/assign-role', [HRController::class, 'assignRole']);
        Route::post('/hr/create-admin', [HRController::class, 'createAdmin']);
        Route::post('/hr/remove-role', [HRController::class, 'removeRole']);
        Route::put('/hr/edit-admin/{id}', [HRController::class, 'editAdmin']);
        Route::post('/hr/assign-roles', [HRController::class, 'assignRoles']);
        Route::post('/hr/toggle-active/{id}', [HRController::class, 'toggleActive']);
        Route::get('/hr/audit-log', [HRController::class, 'getAuditLog']);
        Route::post('/hr/create-role', [HRController::class, 'createRole']);
        Route::delete('/hr/delete-role/{id}', [HRController::class, 'deleteRole']);
        Route::get('/hr/permissions', [HRController::class, 'listPermissions']);
        Route::get('/hr/roles/{roleId}/permissions', [HRController::class, 'getRolePermissions']);
        Route::post('/hr/roles/{roleId}/permissions', [HRController::class, 'updateRolePermissions']);
    });
}); 