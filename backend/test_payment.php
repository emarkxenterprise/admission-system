<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\Api\PaymentController;
use App\Models\Setting;

echo "Testing PaymentController...\n";

try {
    // Test 1: Check if Paystack key is valid
    $secretKey = Setting::get('paystack_secret_key');
    echo "Paystack Secret Key: " . substr($secretKey, 0, 10) . "...\n";
    
    if (strpos($secretKey, 'sk_') === 0) {
        echo "✓ Paystack key format is valid\n";
    } else {
        echo "✗ Paystack key format is invalid\n";
        exit(1);
    }
    
    // Test 2: Try to initialize PaymentController
    $controller = new PaymentController();
    echo "✓ PaymentController initialized successfully\n";
    
    // Test 3: Check if Paystack object is created using reflection
    $reflection = new ReflectionClass($controller);
    $paystackProperty = $reflection->getProperty('paystack');
    $paystackProperty->setAccessible(true);
    $paystack = $paystackProperty->getValue($controller);
    
    if ($paystack !== null) {
        echo "✓ Paystack object created successfully\n";
    } else {
        echo "✗ Paystack object is null\n";
        exit(1);
    }
    
    echo "\nAll tests passed! Payment system should be working.\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
} 