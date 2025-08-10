<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Admission;
use Laravel\Sanctum\Sanctum;

echo "=== PAYMENT AUTHENTICATION TEST ===\n\n";

try {
    // Test 1: Check if we have users and admissions
    $userCount = User::count();
    $admissionCount = Admission::count();
    
    echo "✓ Users in database: $userCount\n";
    echo "✓ Admissions in database: $admissionCount\n\n";
    
    if ($userCount === 0 || $admissionCount === 0) {
        echo "✗ Need users and admissions to test payment\n";
        exit(1);
    }
    
    // Test 2: Get admission and its owner
    $admission = Admission::find(1);
    if (!$admission) {
        echo "✗ Admission ID 1 does not exist\n";
        exit(1);
    }
    
    $user = User::find($admission->user_id);
    if (!$user) {
        echo "✗ User ID {$admission->user_id} does not exist\n";
        exit(1);
    }
    
    echo "✓ Using admission ID: {$admission->id}\n";
    echo "✓ Using user: {$user->email} (ID: {$user->id})\n";
    echo "✓ Admission status: {$admission->status}\n";
    echo "✓ Form paid: " . ($admission->form_paid ? 'Yes' : 'No') . "\n\n";
    
    // Create a token for the user who owns the admission
    $token = $user->createToken('test-token')->plainTextToken;
    echo "✓ Created token: " . substr($token, 0, 20) . "...\n\n";
    
    // Test 3: Test API with authentication
    echo "Testing authenticated API call...\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/payments/initialize');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'admission_id' => $admission->id,
        'type' => 'form_purchase'
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "✗ cURL Error: $error\n";
    } else {
        echo "✓ HTTP Response Code: $httpCode\n";
        
        if ($httpCode === 200) {
            echo "✓ Payment initialization successful!\n";
            $responseData = json_decode($response, true);
            if (isset($responseData['data']['authorization_url'])) {
                echo "✓ Authorization URL received\n";
                echo "✓ Amount: ₦" . $responseData['data']['amount'] . "\n";
            } else {
                echo "✗ No authorization URL in response\n";
            }
        } elseif ($httpCode === 401) {
            echo "✗ Authentication failed (401)\n";
        } elseif ($httpCode === 422) {
            echo "✗ Validation error (422)\n";
            $responseData = json_decode($response, true);
            echo "Response: " . json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
        } elseif ($httpCode === 400) {
            echo "✗ Bad request (400)\n";
            $responseData = json_decode($response, true);
            echo "Response: " . json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
        } else {
            echo "✗ Unexpected response code: $httpCode\n";
            echo "Response: $response\n";
        }
    }
    
    // Clean up
    $user->tokens()->delete();
    echo "\n✓ Test completed and token cleaned up\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} 