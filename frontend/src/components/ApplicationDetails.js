import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';



const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [settings, setSettings] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const printRef = useRef();

  const refreshApplicationData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/applications/${id}`);
      const data = response.data && response.data.data ? response.data.data : null;
      const application = data ? data.application : null;
      if (!application) {
        toast.error('Application data not found');
        setApplication(null);
        setLoading(false);
        return;
      }
      
      console.log('Application data received:', application);
      console.log('Form paid status:', application.form_paid);
      console.log('Payment status:', application.status);
      console.log('Academic backgrounds:', application.academic_backgrounds);
      
      // Clean the data to remove any circular references
      const applicationData = cleanApplicationData(application);
      if (applicationData) {
        console.log('Cleaned application data:', applicationData);
        console.log('Cleaned form_paid status:', applicationData.form_paid);
        console.log('Cleaned academic backgrounds:', applicationData.academic_backgrounds);
        setApplication(applicationData);
      } else {
        toast.error('Failed to process application data');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load application details'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/applications/${id}`);
        const data = response.data && response.data.data ? response.data.data : null;
        const application = data ? data.application : null;
        if (!application) {
          toast.error('Application data not found');
          setApplication(null);
          setLoading(false);
          return;
        }
        
        console.log('Initial application data received:', application);
        console.log('Initial form paid status:', application.form_paid);
        console.log('Initial payment status:', application.status);
        
        // Clean the data to remove any circular references
        const applicationData = cleanApplicationData(application);
        if (applicationData) {
          console.log('Initial cleaned application data:', applicationData);
          console.log('Initial cleaned form_paid status:', applicationData.form_paid);
          setApplication(applicationData);
        } else {
          toast.error('Failed to process application data');
        }
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load application details'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplicationDetails();
      fetchSettings();
    }
  }, [id]);

  // Refresh data when user returns to the page (e.g., from payment)
  useEffect(() => {
    const handleFocus = () => {
      if (id) {
        refreshApplicationData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id, refreshApplicationData]);

  // Check for payment success parameters and refresh data
  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    const reference = searchParams.get('reference');
    
    if (paymentStatus === 'success' && reference) {
      toast.success('Payment completed successfully!');
      refreshApplicationData();
      // Clean up URL parameters
      navigate(`/application/${id}`, { replace: true });
    } else if (paymentStatus === 'failed') {
      toast.error('Payment failed. Please try again.');
      navigate(`/application/${id}`, { replace: true });
    }
  }, [searchParams, id, navigate, refreshApplicationData]);

  // Universal error message helper
  function getErrorMessage(error, fallback = 'An error occurred') {
    try {
      let message =
        error?.response?.data?.message ||
        error?.message ||
        fallback;
      
      if (typeof message !== 'string') {
        if (Array.isArray(message)) {
          message = message.join(' ');
        } else if (typeof message === 'object' && message !== null) {
          // Safely extract values from object without circular references
          try {
            message = Object.values(message).flat().join(' ');
          } catch (e) {
            message = 'Error processing response';
          }
        } else {
          try {
            message = JSON.stringify(message);
          } catch (e) {
            message = 'Error serializing response';
          }
        }
      }
      
      if (error?.response?.data?.errors) {
        try {
          const errors = error.response.data.errors;
          const errorMessages = Object.values(errors).flat().join(' ');
          message += ': ' + errorMessages;
        } catch (e) {
          message += ': Error processing validation errors';
        }
      }
      
      return message;
    } catch (e) {
      return fallback;
    }
  }

  // Function to clean application data and remove circular references
  const cleanApplicationData = (data) => {
    try {
      // Extract only the necessary fields to avoid circular references
      return {
        id: data.id,
        user_id: data.user_id,
        admission_session_id: data.admission_session_id,
        department_id: data.department_id,
        application_number: data.application_number,
        first_name: data.first_name,
        last_name: data.last_name,
        middle_name: data.middle_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        nationality: data.nationality,
        state_of_origin: data.state_of_origin,
        local_government: data.local_government,
        address: data.address,
        phone: data.phone,
        email: data.email,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_relationship: data.emergency_contact_relationship,
        previous_school: data.previous_school,
        previous_qualification: data.previous_qualification,
        graduation_year: data.graduation_year,
        cgpa: data.cgpa,
        status: data.status,
        admin_notes: data.admin_notes,
        form_paid: data.form_paid,
        admission_fee_paid: data.admission_fee_paid,
        admission_accepted: data.admission_accepted,
        acceptance_fee_paid: data.acceptance_fee_paid,
        admission_rejected: data.admission_rejected,
        rejection_date: data.rejection_date,
        transcript: data.transcript,
        certificate: data.certificate,
        id_card: data.id_card,
        passport: data.passport,
        created_at: data.created_at,
        updated_at: data.updated_at,
        // Clean nested objects
        admissionSession: data.admissionSession ? {
          id: data.admissionSession.id,
          name: data.admissionSession.name,
          academic_year: data.admissionSession.academic_year,
          form_price: data.admissionSession.form_price,
          admission_fee: data.admissionSession.admission_fee,
          status: data.admissionSession.status,
        } : null,
        department: data.department ? {
          id: data.department.id,
          name: data.department.name,
          code: data.department.code,
        } : null,
        payments: data.payments ? data.payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          type: payment.type,
          status: payment.status,
          reference: payment.reference,
          created_at: payment.created_at,
        })) : [],
        // Include academic backgrounds
        academic_backgrounds: data.academic_backgrounds ? data.academic_backgrounds.map(bg => ({
          id: bg.id,
          school_name: bg.school_name,
          qualification: bg.qualification,
          graduation_year: bg.graduation_year,
          cgpa: bg.cgpa,
          certificate_file: bg.certificate_file,
        })) : [],
      };
    } catch (error) {
      console.error('Error cleaning application data:', error);
      return null;
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Don't show error toast for settings as it's not critical
    }
  };

  const handleAcceptOffer = async () => {
    try {
      // Safety check to ensure application exists and has an ID
      if (!application || !application.id) {
        toast.error('Application data is not available');
        return;
      }

      const response = await api.post(`/admissions/${id}/accept`);
      
      if (response.data.status) {
        const { payment, acceptance_fee } = response.data.data;
        
        // Show confirmation with acceptance fee amount
        const confirmPayment = window.confirm(
          `Admission accepted successfully!\n\nAcceptance Fee: ₦${acceptance_fee.toLocaleString()}\n\nWould you like to proceed with the payment now?`
        );
        
        if (confirmPayment) {
          // Extract only the necessary data to avoid circular references
          const admissionId = parseInt(application.id, 10);
          const paymentId = parseInt(payment.id, 10);
          
          if (isNaN(admissionId) || isNaN(paymentId)) {
            toast.error('Invalid application or payment ID');
            return;
          }

          // Initialize payment for acceptance fee
          const paymentData = {
            admission_id: admissionId,
            type: 'acceptance_fee',
            payment_id: paymentId
          };
          
          console.log('Sending acceptance fee payment data:', JSON.stringify(paymentData)); // Safe debug log
          
          const paymentResponse = await api.post('/payments/initialize', paymentData);
          const { authorization_url } = paymentResponse.data.data;
          window.location.href = authorization_url;
        } else {
          toast.success('Admission accepted successfully! You can complete the payment later.');
        }
      }
      
      refreshApplicationData(); // Refresh data
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to accept offer'));
      console.error('Error accepting offer:', getErrorMessage(error));
    }
  };

  const handleRejectOffer = async () => {
    try {
      await api.post(`/admissions/${id}/reject`);
      toast.success('Admission offer rejected');
      refreshApplicationData(); // Refresh data
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to reject offer'));
      console.error('Error rejecting offer:', getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    setLoading(true);
    try {
      await api.delete(`/admissions/${id}`);
      toast.success('Application deleted successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete application'));
    } finally {
      setLoading(false);
    }
  };



  const handlePayNow = async (paymentType = 'form_purchase') => {
    if (paymentLoading) {
      toast.info('Payment request in progress. Please wait...');
      return;
    }

    setPaymentLoading(true);
    
    try {
      console.log('handlePayNow called with paymentType:', paymentType);
      console.log('Application object keys:', application ? Object.keys(application) : 'No application');
      
      // Safety check to ensure application exists and has an ID
      if (!application || !application.id) {
        console.error('Application or application.id is missing:', { application: !!application, hasId: application?.id });
        toast.error('Application data is not available');
        return;
      }

      // Extract only the necessary data to avoid circular references
      const admissionId = parseInt(application.id, 10);
      console.log('Parsed admission ID:', admissionId);
      
      if (isNaN(admissionId)) {
        console.error('Invalid admission ID:', application.id);
        toast.error('Invalid application ID');
        return;
      }

      // Create a clean payment data object
      const paymentData = {
        type: paymentType,
      };
      
      // Use the correct field name based on payment type
      if (paymentType === 'form_purchase') {
        paymentData.application_id = admissionId;
      } else {
        paymentData.admission_id = admissionId;
      }
      
      console.log('Sending payment data:', JSON.stringify(paymentData)); // Safe debug log
      console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:8000/api');
      console.log('Token present:', !!localStorage.getItem('token'));
      
      const response = await api.post('/payments/initialize', paymentData);
      console.log('Payment response received:', response.data);
      
      const { authorization_url } = response.data.data;
      console.log('Redirecting to:', authorization_url);
      
      window.location.href = authorization_url;
    } catch (error) {
      console.error('=== PAYMENT ERROR DEBUG ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response statusText:', error.response.statusText);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Request was made but no response received');
        console.error('Request:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      // Enhanced error handling with better message matching
      let errorMessage = '';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message.toLowerCase();
      }
      
      // User-friendly message for already completed payment
      if (errorMessage.includes('already been made') || errorMessage.includes('already completed')) {
        toast.info('You have already completed this payment.');
        return;
      }
      
      // Handle specific error types
      if (error.message && error.message.includes('circular structure')) {
        console.error('Circular reference detected in payment initialization');
        toast.error('Error processing payment request. Please try again.');
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.error('Network error detected');
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.response && error.response.status === 401) {
        console.error('Authentication error');
        toast.error('Authentication error. Please log in again.');
      } else if (error.response && error.response.status === 422) {
        console.error('Validation error');
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const errorText = Object.values(validationErrors).flat().join(', ');
          toast.error(`Validation error: ${errorText}`);
        } else {
          toast.error('Validation error. Please check your input.');
        }
      } else if (error.response && error.response.status === 400) {
        console.error('Bad request error');
        if (error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Invalid request. Please try again.');
        }
      } else if (error.response && error.response.status === 500) {
        console.error('Server error');
        toast.error('Server error. Please try again later.');
      } else if (error.response && error.response.status === 404) {
        console.error('Not found error');
        toast.error('Application not found. Please refresh the page.');
      } else {
        console.error('Payment initialization error:', error);
        // Use the backend error message if available, otherwise use fallback
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Failed to initialize payment. Please try again.');
        }
      }
    } finally {
      setPaymentLoading(false);
    }
  };



  // Helper to get public URL for a file
  const getFileUrl = (path) => path ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${path}` : null;
  // Helper to check if file is image
  const isImage = (filename) => filename && /\.(jpg|jpeg|png)$/i.test(filename);
  // Helper to check if file is PDF
  const isPDF = (filename) => filename && /\.pdf$/i.test(filename);

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // reload to restore app state
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }



  return (
    <div className="max-w-4xl mx-auto">
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 1in;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print-content {
            max-width: none;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }
          .print-table th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
        }
      `}</style>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Application Details</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
        {/* Printable acknowledgement slip (hidden except for print) */}
        <div ref={printRef} className="hidden print:block print-content">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-center">
            {/* School Header */}
            <div className="flex items-center justify-center mb-6 border-b-2 border-gray-300 pb-4 print-header">
              {settings?.print_logo && (
                <img
                                      src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${settings.print_logo}`}
                  alt="School Logo"
                  className="w-16 h-16 object-contain mr-4"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {settings?.school_name || 'SCHOOL NAME'}
                </h1>
                <h2 className="text-lg font-semibold text-gray-600">Acknowledgement Slip</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Application Number: {application.application_number}
                </p>
              </div>
            </div>

            {/* Application Details */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 text-left">
                <h3 className="text-base font-semibold mb-4">Application Details</h3>
              </div>
              <div className="relative">
                {application.passport ? (
                  <>
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${application.passport}`}
                      alt="Passport"
                      className="w-24 h-24 object-cover rounded border shadow ml-4"
                      style={{ aspectRatio: '1 / 1' }}
                      onError={(e) => {
                        console.error('Failed to load passport image:', e.target.src);
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                      onLoad={(e) => {
                        console.log('Passport image loaded successfully:', e.target.src);
                      }}
                    />
                    <div className="w-24 h-24 rounded bg-gray-200 flex items-center justify-center text-gray-400 border shadow ml-4" style={{ aspectRatio: '1 / 1', display: 'none' }}>
                      Image Error
                    </div>
                  </>
                ) : (
                  <div className="w-24 h-24 rounded bg-gray-200 flex items-center justify-center text-gray-400 border shadow ml-4" style={{ aspectRatio: '1 / 1' }}>
                    No Photo
                  </div>
                )}
              </div>
            </div>
            <table className="min-w-full text-left border border-gray-300 print-table text-xs">
              <tbody>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Application Number</th>
                  <td className="border px-3 py-1 font-semibold">{application.application_number || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Full Name</th>
                  <td className="border px-3 py-1">{`${application.first_name || ''} ${application.last_name || ''}`.toUpperCase()}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Email</th>
                  <td className="border px-3 py-1">{application.email?.toUpperCase()}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Phone</th>
                  <td className="border px-3 py-1">{application.phone?.toUpperCase()}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Date of Birth</th>
                  <td className="border px-3 py-1">{new Date(application.date_of_birth).toLocaleDateString().toUpperCase()}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Address</th>
                  <td className="border px-3 py-1">{application.address?.toUpperCase() || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Next of Kin Name</th>
                  <td className="border px-3 py-1">{application.emergency_contact_name?.toUpperCase() || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Next of Kin Phone</th>
                  <td className="border px-3 py-1">{application.emergency_contact_phone?.toUpperCase() || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Next of Kin Relationship</th>
                  <td className="border px-3 py-1">{application.emergency_contact_relationship?.toUpperCase() || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Program</th>
                  <td className="border px-3 py-1">{application.program?.name?.toUpperCase() || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Department</th>
                  <td className="border px-3 py-1">{application.department?.name?.toUpperCase() || 'N/A'}</td>
                </tr>
                <tr className="print:hidden">
                  <th className="border px-3 py-1 font-medium bg-gray-50">Previous Institution</th>
                  <td className="border px-3 py-1">{application.previous_school?.toUpperCase()}</td>
                </tr>
                <tr className="print:hidden">
                  <th className="border px-3 py-1 font-medium bg-gray-50">Previous Qualification</th>
                  <td className="border px-3 py-1">{application.previous_qualification?.toUpperCase()}</td>
                </tr>
                <tr className="print:hidden">
                  <th className="border px-3 py-1 font-medium bg-gray-50">CGPA</th>
                  <td className="border px-3 py-1">{String(application.cgpa).toUpperCase()}</td>
                </tr>
                <tr className="print:hidden">
                  <th className="border px-3 py-1 font-medium bg-gray-50">JAMB Registration Number</th>
                  <td className="border px-3 py-1">{application.jamb_registration_number?.toUpperCase() || 'N/A'}</td>
                </tr>
                <tr className="print:hidden">
                  <th className="border px-3 py-1 font-medium bg-gray-50">JAMB Year</th>
                  <td className="border px-3 py-1">{application.jamb_year || 'N/A'}</td>
                </tr>
                <tr className="print:hidden">
                  <th className="border px-3 py-1 font-medium bg-gray-50">JAMB Score</th>
                  <td className="border px-3 py-1">{application.jamb_score || 'N/A'}</td>
                </tr>
                <tr className="print:hidden">
                  <th className="border px-3 py-1 font-medium bg-gray-50">First Choice Institution</th>
                  <td className="border px-3 py-1">{application.is_first_choice ? 'YES' : 'NO'}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Admission Status</th>
                  <td className="border px-3 py-1">{typeof application.status === 'string' && application.status.length > 0
                    ? application.status.charAt(0).toUpperCase() + application.status.slice(1)
                    : 'N/A'}</td>
                </tr>
                <tr>
                  <th className="border px-3 py-1 font-medium bg-gray-50">Applied Date</th>
                  <td className="border px-3 py-1">{new Date(application.created_at).toLocaleDateString()}</td>
                </tr>
                {application.updated_at !== application.created_at && (
                  <tr>
                    <th className="border px-3 py-1 font-medium bg-gray-50">Last Updated</th>
                    <td className="border px-3 py-1">{new Date(application.updated_at).toLocaleDateString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
                         {/* Documents section for print */}
             <div className="mt-6 print:hidden">
               <h3 className="text-base font-semibold mb-2">Uploaded Documents</h3>
               <ul className="list-disc pl-5 text-xs">
                 <li>State of Origin Certificate: {application.transcript ? 'Uploaded' : 'Not uploaded'}</li>
                 <li>Certificate of Birth: {application.certificate ? 'Uploaded' : 'Not uploaded'}</li>
                 <li>ID Card: {application.id_card ? 'Uploaded' : 'Not uploaded'}</li>
                 <li>Passport: {application.passport ? 'Uploaded' : 'Not uploaded'}</li>
               </ul>
             </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t-2 border-gray-300">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-left">
                  <p><strong>Application Number:</strong> {application.application_number}</p>
                  <p><strong>Generated Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p><strong>Status:</strong> {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'N/A'}</p>
                  <p><strong>Form Payment:</strong> {application.form_paid ? 'Paid' : 'Pending'}</p>
                  {application.form_paid && application.payments && application.payments.length > 0 && (
                    <p><strong>Payment Reference:</strong> {application.payments.find(p => p.type === 'form_purchase' && p.status === 'successful')?.reference || 'N/A'}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 text-center text-xs text-gray-600">
                <p>This is an official acknowledgement slip from {settings?.school_name || 'the institution'}.</p>
                <p>Please keep this document safe for future reference.</p>
              </div>
            </div>
          </div>
        </div>
        {/* End printable acknowledgement slip */}
        {/* Normal card layout (hidden when printing) */}
        <div className="block print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-row items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-gray-700">Full Name:</label>
                      <p className="text-gray-900 text-xs uppercase">{`${application.first_name || ''} ${application.last_name || ''}`.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Email:</label>
                      <p className="text-gray-900 text-xs uppercase">{application.email?.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Phone:</label>
                      <p className="text-gray-900 text-xs uppercase">{application.phone?.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Date of Birth:</label>
                      <p className="text-gray-900 text-xs uppercase">{new Date(application.date_of_birth).toLocaleDateString().toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Address:</label>
                      <p className="text-gray-900 text-xs uppercase">{application.address?.toUpperCase() || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Next of Kin Name:</label>
                      <p className="text-gray-900 text-xs uppercase">{application.emergency_contact_name?.toUpperCase() || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Next of Kin Phone:</label>
                      <p className="text-gray-900 text-xs uppercase">{application.emergency_contact_phone?.toUpperCase() || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Next of Kin Relationship:</label>
                      <p className="text-gray-900 text-xs uppercase">{application.emergency_contact_relationship?.toUpperCase() || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-6">
                  {application.passport ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${application.passport}`}
                      alt="Passport"
                      className="w-28 h-28 object-cover rounded border shadow"
                      style={{ aspectRatio: '1 / 1' }}
                      onError={(e) => {
                        console.error('Failed to load passport image (second location):', e.target.src);
                      }}
                      onLoad={(e) => {
                        console.log('Passport image loaded successfully (second location):', e.target.src);
                      }}
                    />
                  ) : (
                    <div className="w-28 h-28 rounded bg-gray-200 flex items-center justify-center text-gray-400 border shadow" style={{ aspectRatio: '1 / 1' }}>
                      No Photo
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Academic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Academic Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="font-medium text-gray-700">Program:</label>
                  <p className="text-gray-900 text-xs uppercase">{application.program?.name?.toUpperCase() || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Department:</label>
                  <p className="text-gray-900 text-xs uppercase">{application.department?.name?.toUpperCase() || 'N/A'}</p>
                </div>
                
                {/* Academic Backgrounds - Hidden from print */}
                <div className="print:hidden">
                  <label className="font-medium text-gray-700 mb-3 block">Academic Background:</label>
                  {application.academic_backgrounds && application.academic_backgrounds.length > 0 ? (
                    <div className="space-y-4">
                      {application.academic_backgrounds.map((background, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                          <h4 className="font-medium text-gray-800 mb-2">
                            Academic Record {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">School:</span>
                              <p className="text-gray-900">{background.school_name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Qualification:</span>
                              <p className="text-gray-900">{background.qualification}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Graduation Year:</span>
                              <p className="text-gray-900">{background.graduation_year}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">CGPA/Grade:</span>
                              <p className="text-gray-900">{background.cgpa || 'N/A'}</p>
                            </div>
                            {background.certificate_file && (
                              <div className="md:col-span-2">
                                <span className="font-medium text-gray-600">Certificate:</span>
                                <div className="mt-1">
                                  <a
                                    href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${background.certificate_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                                  >
                                    View Certificate
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Fallback to old format if no academic_backgrounds exist - also hidden from print
                    <div className="space-y-3">
                      <div>
                        <label className="font-medium text-gray-700">Previous Institution:</label>
                        <p className="text-gray-900 text-xs uppercase">{application.previous_school?.toUpperCase() || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Previous Qualification:</label>
                        <p className="text-gray-900 text-xs uppercase">{application.previous_qualification?.toUpperCase() || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">CGPA:</label>
                        <p className="text-gray-900 text-xs uppercase">{String(application.cgpa || 'N/A').toUpperCase()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* JAMB Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">JAMB Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">JAMB Registration Number:</label>
                  <p className="text-gray-900 text-xs uppercase">{application.jamb_registration_number?.toUpperCase() || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">JAMB Year:</label>
                  <p className="text-gray-900 text-xs uppercase">{application.jamb_year || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">JAMB Score:</label>
                  <p className="text-gray-900 text-xs uppercase">{application.jamb_score || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">First Choice Institution:</label>
                  <p className="text-gray-900 text-xs uppercase">
                    {application.is_first_choice ? 'YES' : 'NO'}
                  </p>
                </div>
              </div>
            </div>

            {/* Application Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Application Status</h2>
              <div className="space-y-3">
                <div>
                  <label className="font-medium text-gray-700">Application Number:</label>
                  <p className="text-gray-900 font-semibold">{application.application_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Admission Status:</label>
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-sm font-medium
                      ${application.status === 'admitted' ? 'bg-green-100 text-green-800' : application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {typeof application.status === 'string' && application.status.length > 0
                      ? application.status.charAt(0).toUpperCase() + application.status.slice(1)
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Applied Date:</label>
                  <p className="text-gray-900">{new Date(application.created_at).toLocaleDateString()}</p>
                </div>
                {application.updated_at !== application.created_at && (
                  <div>
                    <label className="font-medium text-gray-700">Last Updated:</label>
                    <p className="text-gray-900">{new Date(application.updated_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
            {/* Payment Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
              <div className="space-y-3">
                <div>
                  <label className="font-medium text-gray-700">Form Payment:</label>
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-sm font-medium
                      ${application.form_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {application.form_paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                {application.status === 'admitted' && (
                  <>
                    <div>
                      <label className="font-medium text-gray-700">Admission Fee:</label>
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-sm font-medium
                          ${application.admission_fee_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {application.admission_fee_paid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Acceptance Fee:</label>
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-sm font-medium
                          ${application.acceptance_fee_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {application.acceptance_fee_paid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </>
                )}
                <div className="pt-2">
                  <Link
                    to="/payment-history"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    View Payment History
                  </Link>
                </div>
              </div>
            </div>
                         {/* Documents - Hidden from print */}
             <div className="bg-gray-50 p-4 rounded-lg print:hidden">
               <h2 className="text-xl font-semibold mb-4">Documents</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="text-center">
                   <label className="font-medium text-gray-700 block mb-2">State of Origin Certificate:</label>
                   {application.transcript ? (
                     isImage(application.transcript) ? (
                       <img
                         src={getFileUrl(application.transcript)}
                         alt="State of Origin Certificate"
                         className="w-20 h-20 object-cover rounded cursor-pointer border mx-auto"
                         onClick={() => setZoomedImage(getFileUrl(application.transcript))}
                       />
                     ) : isPDF(application.transcript) ? (
                       <a
                         href={getFileUrl(application.transcript)}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-blue-600 underline block"
                       >
                         View PDF
                       </a>
                     ) : (
                       <span className="text-green-600">Uploaded</span>
                     )
                   ) : (
                     <span className="text-gray-500">Not uploaded</span>
                   )}
                 </div>
                 <div className="text-center">
                   <label className="font-medium text-gray-700 block mb-2">Certificate of Birth:</label>
                   {application.certificate ? (
                     isImage(application.certificate) ? (
                       <img
                         src={getFileUrl(application.certificate)}
                         alt="Certificate of Birth"
                         className="w-20 h-20 object-cover rounded cursor-pointer border mx-auto"
                         onClick={() => setZoomedImage(getFileUrl(application.certificate))}
                       />
                     ) : isPDF(application.certificate) ? (
                       <a
                         href={getFileUrl(application.certificate)}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-blue-600 underline block"
                       >
                         View PDF
                       </a>
                     ) : (
                       <span className="text-green-600">Uploaded</span>
                     )
                   ) : (
                     <span className="text-gray-500">Not uploaded</span>
                   )}
                 </div>
                 <div className="text-center">
                   <label className="font-medium text-gray-700 block mb-2">ID Card:</label>
                   {application.id_card ? (
                     isImage(application.id_card) ? (
                       <img
                         src={getFileUrl(application.id_card)}
                         alt="ID Card"
                         className="w-20 h-20 object-cover rounded cursor-pointer border mx-auto"
                         onClick={() => setZoomedImage(getFileUrl(application.id_card))}
                       />
                     ) : isPDF(application.id_card) ? (
                       <a
                         href={getFileUrl(application.id_card)}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-blue-600 underline block"
                       >
                         View PDF
                       </a>
                     ) : (
                       <span className="text-green-600">Uploaded</span>
                     )
                   ) : (
                     <span className="text-gray-500">Not uploaded</span>
                   )}
                 </div>
                 <div className="text-center">
                   <label className="font-medium text-gray-700 block mb-2">Passport:</label>
                   {application.passport ? (
                     <img
                       src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${application.passport}`}
                       alt="Passport"
                       className="w-20 h-20 object-cover rounded cursor-pointer border mx-auto"
                       onError={(e) => {
                         console.error('Failed to load passport image (third location):', e.target.src);
                       }}
                       onLoad={(e) => {
                         console.log('Passport image loaded successfully (third location):', e.target.src);
                       }}
                     />
                   ) : (
                     <span className="text-gray-500">Not uploaded</span>
                   )}
                 </div>
               </div>
             </div>
          </div>
          {/* Action Buttons */}
          <div className="mt-6 flex gap-4 flex-wrap">
            {application.status === 'admitted' && !application.admission_accepted && !application.admission_rejected && (
              <>
                <button
                  onClick={handleAcceptOffer}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Accept Offer
                </button>
                <button
                  onClick={handleRejectOffer}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                >
                  Reject Offer
                </button>
              </>
            )}
            {application.status === 'admitted' && application.admission_accepted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold mb-2">✓ Admission Accepted</h3>
                <p className="text-green-700 text-sm">
                  {application.acceptance_fee_paid 
                    ? 'Acceptance fee has been paid successfully.' 
                    : 'Please complete the acceptance fee payment to finalize your admission.'}
                </p>
                {!application.acceptance_fee_paid ? (
                  <button
                    onClick={() => handlePayNow('acceptance_fee')}
                    disabled={paymentLoading}
                    className={`mt-2 px-4 py-2 rounded text-white text-sm ${
                      paymentLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {paymentLoading ? (
                      <>
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                        Processing...
                      </>
                    ) : (
                      'Pay Acceptance Fee'
                    )}
                  </button>
                ) : (
                  <div className="mt-2 text-green-600 font-medium">
                    ✓ Acceptance fee payment completed
                    {application.payments && application.payments.length > 0 && (
                      <div className="text-sm mt-1">
                        <strong>Payment Reference:</strong> {application.payments.find(p => p.type === 'acceptance_fee' && p.status === 'successful')?.reference || 'N/A'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {application.status === 'admitted' && application.admission_rejected && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-semibold mb-2">✗ Admission Rejected</h3>
                <p className="text-red-700 text-sm">
                  You have rejected this admission offer on {new Date(application.rejection_date).toLocaleDateString()}.
                </p>
              </div>
            )}
            {!application.form_paid ? (
              <>
                <button
                  id="pay-now-btn"
                  value="pay"
                  onClick={event => {
                    console.log(JSON.stringify({ id: event.target.id, value: event.target.value }));
                    handlePayNow('form_purchase');
                  }}
                  disabled={paymentLoading}
                  className={`px-6 py-2 rounded text-white ${
                    paymentLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {paymentLoading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                >
                  Delete Application
                </button>
                <button
                  onClick={() => navigate(`/application/${application.id}/edit`)}
                  className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
                >
                  Edit Application
                </button>
                <Link
                  to="/verify-payment"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Verify Payment
                </Link>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold mb-2">✓ Form Payment Completed</h3>
                <p className="text-green-700 text-sm">
                  Your application form payment has been processed successfully.
                </p>
                {application.payments && application.payments.length > 0 && (
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>Payment Reference:</strong> {application.payments.find(p => p.type === 'form_purchase' && p.status === 'successful')?.reference || 'N/A'}</p>
                  </div>
                )}
                <Link
                  to="/verify-payment"
                  className="inline-block mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Verify Another Payment →
                </Link>
              </div>
            )}
            {application.form_paid && (
              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Print Acknowledgement Slip
              </button>
            )}
          </div>

          {/* Additional Information */}
          {application.additional_info && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
              <p className="text-gray-900 whitespace-pre-wrap">{application.additional_info}</p>
            </div>
          )}

          {/* Zoom Modal */}
          {zoomedImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setZoomedImage(null)}>
              <img src={zoomedImage} alt="Zoomed Document" className="max-w-3xl max-h-[90vh] rounded shadow-lg border-4 border-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails; 