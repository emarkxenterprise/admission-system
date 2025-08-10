import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileText } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';



const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [admissionOffers, setAdmissionOffers] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect admin users to admin dashboard
    if (user && (hasRole('admin') || hasRole('super-admin'))) {
      navigate('/admin');
      return;
    }
  }, [user, hasRole, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [applicationsResponse, admissionOffersResponse] = await Promise.all([
          api.get('/applications'),
          api.get('/admission-offers')
        ]);
        
        setApplications(applicationsResponse.data.data.applications || []);
        setAdmissionOffers(admissionOffersResponse.data.data || []);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'admitted':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Don't render anything for admin users (they'll be redirected)
  if (user && (hasRole('admin') || hasRole('super-admin'))) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex space-x-3">
              <Link
                to="/admission-offers"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Admission Offers
              </Link>
              <Link
                to="/payment-history"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Payment History
              </Link>
              <Link
                to="/verify-payment"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Verify Payment
              </Link>
              <Link
                to="/apply"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                New Application
              </Link>
            </div>
          </div>

          {/* Admission Offers Section */}
          {admissionOffers.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Admission Offers</h2>
                <Link
                  to="/admission-offers"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid gap-4">
                    {admissionOffers.slice(0, 3).map((offer) => (
                      <div key={offer.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {offer.department?.name} - {offer.admission_session?.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Application #: {offer.application?.application_number}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                offer.acceptance_fee_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {offer.acceptance_fee_paid ? 'Accepted' : 'Pending Payment'}
                              </span>
                              {offer.acceptance_fee_paid && (
                                <button
                                  onClick={() => navigate(`/admission-letter/${offer.id}`)}
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  <FileText className="w-4 h-4" />
                                  View Admission Letter
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applications Section */}
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                No applications yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start your admission journey by submitting your first application.
              </p>
              <Link
                to="/apply"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md text-sm font-medium"
              >
                Apply Now
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <li key={application.id}>
                    <Link
                      to={`/application/${application.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {application.first_name?.charAt(0) || 'A'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {application.first_name} {application.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {application.department?.name} • {application.admission_session?.name || application.admissionSession?.name}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                application.status
                              )}`}
                            >
                              {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
                            </span>
                            <div className="text-sm text-gray-500">
                              {new Date(application.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="font-medium">Application #:</span>
                              <span className="ml-1">{application.application_number}</span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <div className="flex space-x-4">
                              <span className={`${application.form_paid ? 'text-green-600' : 'text-red-600'}`}>
                                Application Form: {application.form_paid ? 'Paid' : 'Pending'}
                              </span>
                              {application.status === 'admitted' && (
                                <span className={`${application.admission_fee_paid ? 'text-green-600' : 'text-red-600'}`}>
                                  Admission Fee: {application.admission_fee_paid ? 'Paid' : 'Pending'}
                                </span>
                              )}
                              {application.status === 'admitted' && (
                                <span className={`${application.acceptance_fee_paid ? 'text-green-600' : 'text-red-600'}`}>
                                  Acceptance Fee: {application.acceptance_fee_paid ? 'Paid' : 'Pending'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 