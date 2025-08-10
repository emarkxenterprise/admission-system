<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;

class HRController extends Controller
{
    // List all admin users
    public function listAdmins()
    {
        try {
            // Get all staff with their roles, including those without roles
            $admins = Staff::with('roles')->get();
            
            // Filter to only show staff who have roles (admin users)
            $adminsWithRoles = $admins->filter(function($staff) {
                return $staff->roles->count() > 0;
            });
            
            return response()->json($adminsWithRoles->values());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch admins: ' . $e->getMessage()], 500);
        }
    }

    // List all available roles
    public function listRoles()
    {
        try {
            $roles = Role::where('guard_name', 'staff')->get();
            return response()->json($roles);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch roles: ' . $e->getMessage()], 500);
        }
    }

    // Assign a role to a staff member
    public function assignRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:staff,id',
            'role' => 'required|exists:roles,name,guard_name,staff',
        ]);

        $staff = Staff::findOrFail($request->user_id);
        $staff->syncRoles([$request->role]);

        return response()->json(['message' => 'Role assigned successfully']);
    }

    // Create a new admin staff member and assign a role
    public function createAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:staff,email',
            'password' => 'required|string|min:6',
            'role' => 'required|exists:roles,name,guard_name,staff',
        ]);

        $staff = Staff::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'active' => true,
        ]);
        $staff->assignRole($request->role);

        return response()->json(['message' => 'Admin created successfully', 'staff' => $staff->load('roles')]);
    }

    // Remove a role from a staff member
    public function removeRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:staff,id',
            'role' => 'required|exists:roles,name,guard_name,staff',
        ]);

        $staff = Staff::findOrFail($request->user_id);
        $staff->removeRole($request->role);

        return response()->json(['message' => 'Role removed successfully']);
    }

    // Edit admin details
    public function editAdmin(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:staff,email,' . $id,
            'password' => 'nullable|string|min:6',
            'active' => 'sometimes|boolean',
            'role' => 'sometimes|exists:roles,name,guard_name,staff',
        ]);

        $staff = Staff::findOrFail($id);
        if ($request->has('name')) $staff->name = $request->name;
        if ($request->has('email')) $staff->email = $request->email;
        if ($request->filled('password')) $staff->password = bcrypt($request->password);
        if ($request->has('active')) $staff->active = $request->active;
        $staff->save();

        // If role is present, sync the staff's roles
        if ($request->has('role')) {
            $staff->syncRoles([$request->role]);
        }

        return response()->json(['message' => 'Admin updated successfully', 'staff' => $staff->load('roles')]);
    }

    // Assign multiple roles to a staff member
    public function assignRoles(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:staff,id',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name,guard_name,staff',
        ]);
        $staff = Staff::findOrFail($request->user_id);
        $staff->syncRoles($request->roles);
        $this->logRoleChange($staff->id, 'sync', $request->roles);
        return response()->json(['message' => 'Roles assigned successfully']);
    }

    // Deactivate or reactivate an admin
    public function toggleActive(Request $request, $id)
    {
        $staff = Staff::findOrFail($id);
        $staff->active = !$staff->active;
        $staff->save();
        return response()->json(['message' => $staff->active ? 'Admin reactivated' : 'Admin deactivated', 'active' => $staff->active]);
    }

    // Audit log: log role changes
    protected function logRoleChange($staffId, $action, $roles)
    {
        DB::table('role_change_logs')->insert([
            'staff_id' => $staffId,
            'action' => $action,
            'roles' => json_encode($roles),
            'created_at' => now(),
        ]);
    }

    // Fetch audit log
    public function getAuditLog(Request $request)
    {
        $logs = DB::table('role_change_logs')->orderBy('created_at', 'desc')->limit(100)->get();
        return response()->json($logs);
    }

    // Create a new role
    public function createRole(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            $role = Role::create([
                'name' => $request->name,
                'guard_name' => 'staff',
            ]);

            return response()->json(['message' => 'Role created successfully', 'role' => $role]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create role: ' . $e->getMessage()], 500);
        }
    }

    // Delete a role
    public function deleteRole(Request $request, $id)
    {
        try {
            $role = Role::where('guard_name', 'staff')->findOrFail($id);
            $role->delete();
            return response()->json(['message' => 'Role deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete role: ' . $e->getMessage()], 500);
        }
    }

    // List all permissions
    public function listPermissions()
    {
        return response()->json(Permission::where('guard_name', 'staff')->get());
    }

    // Get permissions for a specific role
    public function getRolePermissions($roleId)
    {
        $role = Role::where('guard_name', 'staff')->findOrFail($roleId);
        return response()->json($role->permissions);
    }

    // Update permissions for a specific role
    public function updateRolePermissions(Request $request, $roleId)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name,guard_name,staff',
        ]);
        $role = Role::where('guard_name', 'staff')->findOrFail($roleId);
        $role->syncPermissions($request->permissions);
        return response()->json(['message' => 'Permissions updated successfully', 'permissions' => $role->permissions]);
    }
} 