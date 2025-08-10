import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ExportOptions from '../ExportOptions';

const AdminApplications = () => {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    search: '',
    date_filter: '',
    start_date: '',
    end_date: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Define columns for export
  const exportColumns = [
    { key: 'application_number', header: 'Application Number' },
    { key: 'full_name', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'date_of_birth', header: 'Date of Birth' },
    { key: 'age', header: 'Age' },
    { key: 'department', header: 'Department' },
    { key: 'status', header: 'Status' },
    { key: 'applied_date', header: 'Applied Date' }
  ];

  // Prepare data for export
  const exportData = applications.map(app => ({
    application_number: app.application_number || 'N/A',
    full_name: `${app.first_name || ''} ${app.last_name || ''}`.trim(),
    email: app.email || 'N/A',
    phone: app.phone || 'N/A',
    date_of_birth: app.date_of_birth ? new Date(app.date_of_birth).toLocaleDateString() : 'N/A',
    age: app.date_of_birth ? calculateAge(app.date_of_birth) + ' years' : 'N/A',
    department: app.department?.name || 'N/A',
    status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
    applied_date: new Date(app.created_at).toLocaleDateString()
  }));

  useEffect(() => {
    fetchApplications();
    fetchDepartments();
  }, []);

  // Auto-fetch when date filter changes (except for custom range)
  useEffect(() => {
    if (filters.date_filter && filters.date_filter !== 'custom_range') {
      fetchApplications();
    }
  }, [filters.date_filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.department) params.append('department_id', filters.department);
      if (filters.search) params.append('search', filters.search);
      if (filters.date_filter) params.append('date_filter', filters.date_filter);
      if (filters.date_filter === 'custom_range' && filters.start_date) params.append('start_date', filters.start_date);
      if (filters.date_filter === 'custom_range' && filters.end_date) params.append('end_date', filters.end_date);
      const response = await api.get(`/admin/applications?${params}`);
      
      console.log('Applications API Response:', response.data);
      
      // Handle paginated response structure
      const responseData = response.data;
      if (responseData && responseData.data && Array.isArray(responseData.data.data)) {
        // Paginated response
        setApplications(responseData.data.data);
      } else if (Array.isArray(responseData.data)) {
        // Direct array response
        setApplications(responseData.data);
      } else if (Array.isArray(responseData)) {
        // Direct array response without wrapper
        setApplications(responseData);
      } else {
        console.error('Unexpected response structure:', responseData);
        setApplications([]);
      }
    } catch (error) {
      toast.error('Failed to load applications');
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/admin/departments');
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    
    // Validate custom date range
    if (filters.date_filter === 'custom_range') {
      if (!filters.start_date || !filters.end_date) {
        toast.error('Please select both start and end dates for custom range');
        return;
      }
      if (filters.start_date > filters.end_date) {
        toast.error('Start date cannot be after end date');
        return;
      }
    }
    
    fetchApplications();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      department: '',
      search: '',
      date_filter: '',
      start_date: '',
      end_date: ''
    });
  };

  const handleClearFilters = () => {
    clearFilters();
    // Fetch applications after clearing filters
    setTimeout(() => {
      fetchApplications();
    }, 100);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.department) count++;
    if (filters.search) count++;
    if (filters.date_filter) count++;
    return count;
  };

  const getDateFilterLabel = (filter) => {
    switch (filter) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'this_week': return 'This Week';
      case 'this_month': return 'This Month';
      case 'last_month': return 'Last Month';
      case 'last_three_months': return 'Last 3 Months';
      case 'custom_range': return 'Custom Range';
      default: return '';
    }
  };

  const formatDateForDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await api.put(`/admin/applications/${applicationId}/status`, {
        status: newStatus
      });
      toast.success(`Application ${newStatus} successfully`);
      fetchApplications(); // Refresh the list
    } catch (error) {
      toast.error(`Failed to ${newStatus} application`);
      console.error('Error updating application:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  function calculateAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const handleViewApplication = async (id) => {
    setModalLoading(true);
    setShowModal(true);
    try {
      const response = await api.get(`/admin/applications/${id}`);
      setSelectedApplication(response.data.data);
    } catch (error) {
      toast.error('Failed to load application details');
      setSelectedApplication(null);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-md p-6">


          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="mb-3">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Filter Applications</h3>
              <p className="text-sm text-gray-600">Use the filters below to find specific applications by status, department, search terms, or date range.</p>
            </div>
            <form onSubmit={handleFilterSubmit} className="space-y-4">
              {/* First row of filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    {Array.isArray(departments) && departments.length > 0 ? (
                      departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))
                    ) : (
                      <option disabled>No departments found</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by name or email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Filter</label>
                  <select
                    value={filters.date_filter}
                    onChange={(e) => handleFilterChange('date_filter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Dates</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_three_months">Last 3 Months</option>
                    <option value="custom_range">Custom Range</option>
                  </select>
                </div>
              </div>

              {/* Date range inputs (shown only when custom range is selected) */}
              {filters.date_filter === 'custom_range' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={filters.start_date}
                      onChange={(e) => handleFilterChange('start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={filters.end_date}
                      onChange={(e) => handleFilterChange('end_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          start_date: '',
                          end_date: ''
                        }));
                      }}
                      className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Clear Dates
                    </button>
                  </div>
                </div>
              )}

              {/* Filter button */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Clear All Filters
                </button>
              </div>
            </form>
          </div>

          {/* Active Filters Indicator */}
          {getActiveFiltersCount() > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                  {filters.status && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                    </span>
                  )}
                  {filters.department && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Department: {departments.find(d => d.id === parseInt(filters.department))?.name || 'Unknown'}
                    </span>
                  )}
                  {filters.search && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Search: "{filters.search}"
                    </span>
                  )}
                  {filters.date_filter && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Date: {getDateFilterLabel(filters.date_filter)}
                      {filters.date_filter === 'custom_range' && filters.start_date && filters.end_date && (
                        <span className="ml-1">({formatDateForDisplay(filters.start_date)} to {formatDateForDisplay(filters.end_date)})</span>
                      )}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {applications.length} application(s) found
            </div>
            <ExportOptions
              data={exportData}
              filename="applications"
              tableRef={tableRef}
              columns={exportColumns}
              title="Applications Report"
            />
          </div>

          {/* Applications Table */}
          <div className="overflow-x-auto" ref={tableRef}>
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth (Age)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(applications) && applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {application.application_number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.user ? `${application.user.first_name || ''} ${application.user.last_name || ''}`.trim() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.user?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.first_name || ''} {application.last_name || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.date_of_birth ? `${new Date(application.date_of_birth).toLocaleDateString()} (${calculateAge(application.date_of_birth)} years)` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.department?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(application.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* View Icon */}
                        <button
                          onClick={() => handleViewApplication(application.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                          aria-label="View"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {/* Approve Icon */}
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                              aria-label="Approve"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            {/* Reject Icon */}
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                              aria-label="Reject"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                        {/* Admit Icon */}
                        {application.status === 'approved' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'admitted')}
                              className="text-green-600 hover:text-green-900"
                              title="Admit"
                              aria-label="Admit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                            {/* Reject Icon */}
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                              aria-label="Reject"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!Array.isArray(applications) || applications.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500">No applications found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Modal for Application Details */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              {modalLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedApplication ? (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Application Details</h2>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <p><span className="font-semibold">Full Name:</span> {selectedApplication.first_name} {selectedApplication.last_name}</p>
                      <p><span className="font-semibold">Email:</span> {selectedApplication.email}</p>
                      <p><span className="font-semibold">Phone:</span> {selectedApplication.phone}</p>
                      <p><span className="font-semibold">Date of Birth:</span> {selectedApplication.date_of_birth} ({calculateAge(selectedApplication.date_of_birth)} years)</p>
                      <p><span className="font-semibold">Department:</span> {selectedApplication.department?.name}</p>
                      <p><span className="font-semibold">Status:</span> <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>{selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}</span></p>
                      
                      {/* Academic Backgrounds */}
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Academic Background:</h3>
                        {selectedApplication.academic_backgrounds && selectedApplication.academic_backgrounds.length > 0 ? (
                          <div className="space-y-3">
                            {selectedApplication.academic_backgrounds.map((background, index) => (
                              <div key={index} className="border border-gray-200 rounded p-3 bg-gray-50">
                                <h4 className="font-medium text-sm mb-2">Academic Record {index + 1}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div><span className="font-medium">School:</span> {background.school_name}</div>
                                  <div><span className="font-medium">Qualification:</span> {background.qualification}</div>
                                  <div><span className="font-medium">Year:</span> {background.graduation_year}</div>
                                  <div><span className="font-medium">CGPA:</span> {background.cgpa || 'N/A'}</div>
                                  {background.certificate_file && (
                                    <div className="col-span-2">
                                      <a
                                        href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${background.certificate_file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                                      >
                                        View Certificate
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Fallback to old format
                          <div className="text-sm">
                            <p><span className="font-medium">Previous School:</span> {selectedApplication.previous_school || 'N/A'}</p>
                            <p><span className="font-medium">Qualification:</span> {selectedApplication.previous_qualification || 'N/A'}</p>
                            <p><span className="font-medium">CGPA:</span> {selectedApplication.cgpa || 'N/A'}</p>
                          </div>
                        )}
                      </div>
                      {/* Approve button if submitted or under review */}
                      {(selectedApplication.status === 'submitted' || selectedApplication.status === 'under_review') && (
                        <button
                          onClick={async () => {
                            await handleStatusUpdate(selectedApplication.id, 'approved');
                            setShowModal(false);
                          }}
                          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Approve Application
                        </button>
                      )}
                      {/* Reject button if not already rejected */}
                      {selectedApplication.status !== 'rejected' && (
                        <button
                          onClick={async () => {
                            await handleStatusUpdate(selectedApplication.id, 'rejected');
                            setShowModal(false);
                          }}
                          className="mt-4 ml-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                          Reject Application
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-start min-w-[8rem]">
                      {selectedApplication.passport && (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${selectedApplication.passport}`}
                          alt="Passport"
                          className="w-32 h-32 object-cover rounded border shadow mb-2"
                        />
                      )}
                    </div>
                  </div>
                  {/* Add more fields as needed */}
                </div>
              ) : (
                <div className="text-center text-gray-500">No application details found.</div>
              )}
            </div>
          </div>
        )}
        {/* End Modal */}
      </div>

    </div>
  );
};

export default AdminApplications; 