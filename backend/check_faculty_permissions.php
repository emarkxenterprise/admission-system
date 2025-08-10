<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Checking Faculty Permissions...\n\n";

// Check if faculty permissions exist
$viewFacultiesPermission = Permission::where('name', 'view-faculties')->where('guard_name', 'staff-api')->first();
$manageFacultiesPermission = Permission::where('name', 'manage-faculties')->where('guard_name', 'staff-api')->first();

echo "Permissions:\n";
echo "- view-faculties: " . ($viewFacultiesPermission ? "EXISTS" : "MISSING") . "\n";
echo "- manage-faculties: " . ($manageFacultiesPermission ? "EXISTS" : "MISSING") . "\n\n";

// Check roles
$adminRole = Role::where('name', 'admin')->where('guard_name', 'staff-api')->first();
$superAdminRole = Role::where('name', 'super-admin')->where('guard_name', 'staff-api')->first();

echo "Roles:\n";
echo "- admin: " . ($adminRole ? "EXISTS" : "MISSING") . "\n";
echo "- super-admin: " . ($superAdminRole ? "EXISTS" : "MISSING") . "\n\n";

if ($adminRole) {
    echo "Admin role permissions:\n";
    $adminPermissions = $adminRole->permissions;
    foreach ($adminPermissions as $permission) {
        echo "- " . $permission->name . "\n";
    }
    echo "\n";
}

if ($superAdminRole) {
    echo "Super Admin role permissions:\n";
    $superAdminPermissions = $superAdminRole->permissions;
    foreach ($superAdminPermissions as $permission) {
        echo "- " . $permission->name . "\n";
    }
    echo "\n";
}

// Check staff users
$staffUsers = DB::table('staff')->get();
echo "Staff Users:\n";
foreach ($staffUsers as $staff) {
    echo "- " . $staff->name . " (" . $staff->email . ")\n";
    
    // Get user's roles
    $userRoles = DB::table('model_has_roles')
        ->where('model_id', $staff->id)
        ->where('model_type', 'App\Models\Staff')
        ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
        ->where('roles.guard_name', 'staff-api')
        ->get();
    
    foreach ($userRoles as $role) {
        echo "  Role: " . $role->name . "\n";
        
        // Get role permissions
        $rolePermissions = DB::table('role_has_permissions')
            ->where('role_id', $role->id)
            ->join('permissions', 'role_has_permissions.permission_id', '=', 'permissions.id')
            ->where('permissions.guard_name', 'staff-api')
            ->get();
        
        foreach ($rolePermissions as $permission) {
            echo "    Permission: " . $permission->name . "\n";
        }
    }
    echo "\n";
}

echo "Done!\n"; 