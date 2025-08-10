import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileText } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const reference = searchParams.get('reference');
  const status = searchParams.get('status');
  const paymentType = localStorage.getItem('payment_type');
  const admissionId = localStorage.getItem('admission_id');

  useEffect(() => {
    if (status === 'success') {
      toast.success('Payment completed successfully!');
    } else {
      toast.error('Payment failed. Please try again.');
    }

    // Countdown timer to redirect back to dashboard
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Try to go back to the previous page, or dashboard if that fails
          if (window.history.length > 1) {
            window.history.back();
          } else {
            navigate('/dashboard');
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'success' ? (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your payment has been processed successfully. You will be redirected back in {countdown} seconds.
            </p>
            {reference && (
              <p className="text-sm text-gray-500 mb-4">
                Reference: {reference}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">
              Your payment could not be processed. You will be redirected to your dashboard in {countdown} seconds.
            </p>
          </>
        )}
        
        <div className="flex gap-3">
          {status === 'success' && paymentType === 'acceptance_fee' && admissionId ? (
            <>
              <button
                onClick={() => navigate(`/admission-letter/${admissionId}`)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View Admission Letter
              </button>
              <button
                onClick={() => navigate('/admission-offers')}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Offers
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    navigate('/dashboard');
                  }
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go Back
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 