<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use App\Models\Application;
use App\Models\Admission;
use App\Models\Payment;

$applicationNumber = 'APP2025000005';

$appObj = Application::where('application_number', $applicationNumber)->first();
if (!$appObj) {
    echo "No application found for $applicationNumber\n";
    exit;
}

$admission = Admission::where('application_id', $appObj->id)->first();
if (!$admission) {
    echo "No admission found for application $applicationNumber\n";
    exit;
}

echo "Application Number: $applicationNumber\n";
echo "Admission ID: $admission->id\n";
echo "Acceptance Fee Paid: " . ($admission->acceptance_fee_paid ? 'Yes' : 'No') . "\n";
echo "Admission Accepted: " . ($admission->admission_accepted ? 'Yes' : 'No') . "\n";
echo "Status: $admission->status\n";

echo "\nPayments for this admission:\n";
$payments = Payment::where('admission_id', $admission->id)->get();
if ($payments->isEmpty()) {
    echo "No payments found for this admission.\n";
} else {
    foreach ($payments as $p) {
        echo "- Payment ID: $p->id | Type: $p->type | Status: $p->status | Amount: $p->amount | Reference: $p->reference\n";
    }
} 