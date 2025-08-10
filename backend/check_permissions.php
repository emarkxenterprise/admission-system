<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== STAFF PERMISSIONS CHECK ===\n\n";

// Check all staff users and their permissions
$staff = \App\Models\Staff::with('roles.permissions')->get();

foreach ($staff as $s) {
    echo "Staff: {$s->name} ({$s->email})\n";
    echo "Roles: " . $s->roles->pluck('name')->join(', ') . "\n";
    
    $permissions = $s->roles->flatMap(function($role) {
        return $role->permissions->pluck('name');
    })->unique();
    
    echo "Permissions: " . $permissions->join(', ') . "\n";
    echo "Has faculty permissions: " . ($permissions->contains('manage-faculties') || $permissions->contains('view-faculties') ? 'YES' : 'NO') . "\n";
    echo "---\n";
}

echo "\n=== ALL STAFF PERMISSIONS ===\n";
$allPermissions = \Spatie\Permission\Models\Permission::where('guard_name', 'staff')->get();
foreach ($allPermissions as $p) {
    echo "- {$p->name}\n";
}

echo "\n=== ALL STAFF ROLES ===\n";
$allRoles = \Spatie\Permission\Models\Role::where('guard_name', 'staff')->get();
foreach ($allRoles as $r) {
    echo "Role: {$r->name}\n";
    $rolePermissions = $r->permissions->pluck('name')->join(', ');
    echo "Permissions: {$rolePermissions}\n";
    echo "---\n";
} 