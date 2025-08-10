<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class FixUserRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:fix-roles';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign default user role to users without roles';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $usersWithoutRoles = User::whereDoesntHave('roles')->get();
        
        if ($usersWithoutRoles->isEmpty()) {
            $this->info('All users already have roles assigned.');
            return;
        }

        $this->info("Found {$usersWithoutRoles->count()} users without roles. Assigning 'user' role...");

        foreach ($usersWithoutRoles as $user) {
            $user->assignRole('user');
            $this->line("Assigned 'user' role to: {$user->email}");
        }

        $this->info('Successfully assigned roles to all users.');
    }
} 