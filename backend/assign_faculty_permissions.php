<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== ASSIGN FACULTY PERMISSIONS ===\n\n";

// Get all staff users
$staff = \App\Models\Staff::with('roles')->get();

echo "Available staff users:\n";
foreach ($staff as $index => $s) {
    echo ($index + 1) . ". {$s->name} ({$s->email}) - Roles: " . $s->roles->pluck('name')->join(', ') . "\n";
}

echo "\nEnter the number of the staff user to assign faculty permissions to (or 'all' to assign to all): ";
$handle = fopen("php://stdin", "r");
$line = fgets($handle);
$choice = trim($line);
fclose($handle);

if ($choice === 'all') {
    // Assign faculty permissions to all staff
    foreach ($staff as $s) {
        $s->assignRole('admin');
        echo "Assigned admin role to {$s->name}\n";
    }
} else {
    $index = intval($choice) - 1;
    if (isset($staff[$index])) {
        $selectedStaff = $staff[$index];
        $selectedStaff->assignRole('admin');
        echo "Assigned admin role to {$selectedStaff->name}\n";
    } else {
        echo "Invalid choice\n";
    }
}

echo "\nDone!\n"; 