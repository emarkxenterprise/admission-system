<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Staff;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MigrateAdminsToStaff extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:admins-to-staff';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate all admin users from users table to staff table, copying roles and removing admin roles from users table.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $adminRoles = ['super-admin', 'admin', 'accountant', 'admission-manager'];
        $users = User::whereHas('roles', function ($q) use ($adminRoles) {
            $q->whereIn('name', $adminRoles);
        })->get();

        if ($users->isEmpty()) {
            $this->info('No admin users found to migrate.');
            return;
        }

        foreach ($users as $user) {
            // Check if already migrated
            $existing = Staff::where('email', $user->email)->first();
            if ($existing) {
                $this->line("Staff already exists for: {$user->email}");
                continue;
            }

            // Create staff record
            $staff = Staff::create([
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'password' => $user->password, // already hashed
                'active' => $user->active ?? true,
            ]);

            // Copy roles (for staff guard)
            foreach ($user->roles as $role) {
                if (in_array($role->name, $adminRoles)) {
                    $staff->assignRole($role->name);
                }
            }

            $this->info("Migrated user {$user->email} to staff.");

            // Remove admin roles from user
            foreach ($user->roles as $role) {
                if (in_array($role->name, $adminRoles)) {
                    $user->removeRole($role->name);
                }
            }
        }

        $this->info('Migration complete.');
    }
}
