import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const PaymentVerification = () => {
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const navigate = useNavigate();

  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!reference.trim()) {
      toast.error('Please enter a payment reference');
      return;
    }

    setLoading(true);
    setVerificationResult(null);

    try {
      const response = await api.post('/payments/verify', { reference: reference.trim() });
      
      if (response.data.status) {
        const { payment, admission } = response.data.data;
        setVerificationResult({
          success: true,
          payment,
          admission,
          message: 'Payment verified successfully!'
        });
        toast.success('Payment verified successfully!');
      } else {
        setVerificationResult({
          success: false,
          message: response.data.message || 'Payment verification failed'
        });
        toast.error(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      let errorMessage = 'Failed to verify payment';
      
      if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to verify this payment. Please ensure you are logged in with the correct account.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to verify payments.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Payment not found. Please check your reference number.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setVerificationResult({
        success: false,
        message: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = () => {
    if (verificationResult?.payment?.application_id) {
      navigate(`/application/${verificationResult.payment.application_id}`);
    } else if (verificationResult?.payment?.admission_id && verificationResult?.admission?.application_id) {
      navigate(`/application/${verificationResult.admission.application_id}`);
    } else if (verificationResult?.payment?.admission_id) {
      // If we have admission_id but no admission data, we need to fetch it
      api.get(`/admission-offers/${verificationResult.payment.admission_id}`)
        .then(response => {
          if (response.data.success && response.data.data.application_id) {
            navigate(`/application/${response.data.data.application_id}`);
          } else {
            toast.error('Could not find the associated application');
          }
        })
        .catch(error => {
          console.error('Error fetching admission details:', error);
          toast.error('Could not find the associated application');
        });
    } else {
      toast.error('Could not find the associated application');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Payment
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your payment reference to verify your payment status
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            You can only verify payments that belong to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerification}>
          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
              Payment Reference
            </label>
            <input
              id="reference"
              name="reference"
              type="text"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your payment reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Verifying...
                </>
              ) : (
                'Verify Payment'
              )}
            </button>
          </div>
        </form>

        {/* Verification Result */}
        {verificationResult && (
          <div className={`mt-6 p-4 rounded-md ${
            verificationResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {verificationResult.success ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  verificationResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {verificationResult.message}
                </h3>
                
                {verificationResult.success && verificationResult.payment && (
                  <div className="mt-2 text-sm text-green-700">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Amount:</span> ₦{verificationResult.payment.amount}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {verificationResult.payment.type.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {verificationResult.payment.status}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(verificationResult.payment.paid_at || verificationResult.payment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <button
                        onClick={handleViewApplication}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        View Application
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerification; 