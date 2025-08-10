<?php

// Simple test to check if the API is accessible
$apiUrl = 'http://localhost:8000/api/settings';

echo "Testing API accessibility...\n";
echo "Testing URL: $apiUrl\n\n";

// Test 1: Check if server is running
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HEADER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "✗ cURL Error: $error\n";
    echo "This suggests the server might not be running or there's a network issue.\n";
} else {
    echo "✓ Server is accessible (HTTP Code: $httpCode)\n";
    
    if ($httpCode === 200) {
        echo "✓ API endpoint is working\n";
    } else {
        echo "✗ API endpoint returned HTTP $httpCode\n";
    }
}

echo "\nResponse preview:\n";
echo substr($response, 0, 500) . "...\n";

// Test 2: Check if payment endpoint exists (should return 401 for unauthenticated)
echo "\nTesting payment endpoint (should return 401 for unauthenticated)...\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/payments/initialize');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['admission_id' => 1, 'type' => 'form_purchase']));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 401) {
    echo "✓ Payment endpoint exists and requires authentication (HTTP 401)\n";
} else {
    echo "✗ Payment endpoint returned unexpected HTTP $httpCode\n";
} 