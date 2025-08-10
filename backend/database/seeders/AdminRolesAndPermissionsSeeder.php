<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdminRolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define permissions
        $permissions = [
            'manage-users',
            'manage-payments',
            'view-payments',
            'manage-admissions',
            'view-applications',
            'manage-departments',
            // Faculty management permissions
            'manage-faculties',
            'view-faculties',
            // Settings management permission
            'manage-settings',
        ];

        // Create permissions for default guard
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create permissions for staff guard
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'staff']);
        }

        // Define roles and assign permissions for default guard (users)
        $userRoles = [
            'super-admin' => $permissions, // all permissions
            'admin' => ['manage-admissions', 'view-applications', 'manage-payments', 'view-payments', 'manage-departments', 'manage-users', 'manage-settings'], // admin permissions
            'user' => [], // regular user - no admin permissions
            'accountant' => ['manage-payments', 'view-payments'],
            'admission-manager' => ['manage-admissions', 'view-applications'],
        ];

        foreach ($userRoles as $role => $perms) {
            $roleModel = Role::firstOrCreate(['name' => $role]);
            $roleModel->syncPermissions($perms);
        }

        // Define roles and assign permissions for staff guard
        $staffRoles = [
            'super-admin' => $permissions, // all permissions
            'admin' => [
                'manage-admissions',
                'view-applications',
                'manage-payments',
                'view-payments',
                'manage-departments',
                'manage-users',
                'manage-faculties',
                'view-faculties',
                'manage-settings',
            ], // admin permissions
            'accountant' => ['manage-payments', 'view-payments'],
            'admission-manager' => ['manage-admissions', 'view-applications'],
        ];

        foreach ($staffRoles as $role => $perms) {
            $roleModel = Role::firstOrCreate(['name' => $role, 'guard_name' => 'staff']);
            $roleModel->syncPermissions($perms);
        }
    }
} 