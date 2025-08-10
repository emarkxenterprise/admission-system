import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import ExportOptions from '../ExportOptions';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AdmissionSessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [activeSessionCount, setActiveSessionCount] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    academic_year: '',
    start_date: '',
    end_date: '',
    form_price: '',
    admission_fee: '',
    status: 'inactive',
    description: ''
  });

  // Table reference for export
  const tableRef = useRef(null);

  // Define columns for export
  const exportColumns = [
    { key: 'name', header: 'Session Name' },
    { key: 'academic_year', header: 'Academic Year' },
    { key: 'duration', header: 'Duration' },
    { key: 'form_price', header: 'Form Price' },
    { key: 'admission_fee', header: 'Admission Fee' },
    { key: 'status', header: 'Status' },
    { key: 'created_at', header: 'Created Date' }
  ];



  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/admin/admission-sessions');
      const sessionsData = response.data.data || [];
      setSessions(sessionsData);
      
      // Count active sessions
      const activeCount = sessionsData.filter(session => session.status === 'active').length;
      setActiveSessionCount(activeCount);
    } catch (error) {
      toast.error('Failed to load admission sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionStats = async (sessionId) => {
    try {
      const response = await api.get(`/admin/admission-sessions/${sessionId}/stats`);
      console.log('Session stats received:', response.data);
      setSessionStats(response.data);
    } catch (error) {
      console.error('Error fetching session stats:', error);
      toast.error('Failed to load session statistics');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSession) {
        await api.put(`/admin/admission-sessions/${editingSession.id}`, formData);
        toast.success('Admission session updated successfully');
        if (formData.status === 'active') {
          toast.info('Other sessions have been automatically deactivated.');
        }
      } else {
        await api.post('/admin/admission-sessions', formData);
        toast.success('Admission session created successfully');
        if (formData.status === 'active') {
          toast.info('Other sessions have been automatically deactivated.');
        }
      }
      
      setShowModal(false);
      setEditingSession(null);
      resetForm();
      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      if (error.response?.data?.message) {
        // Handle specific error message for active session conflict
        toast.error(error.response.data.message);
        
        // If there's an active session info, show additional details
        if (error.response.data.active_session) {
          const activeSession = error.response.data.active_session;
          toast.info(`Currently active session: ${activeSession.name} (${activeSession.academic_year})`);
        }
      } else if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach(error => {
          toast.error(error[0]);
        });
      } else {
        toast.error('Failed to save admission session');
      }
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      academic_year: session.academic_year,
      start_date: session.start_date,
      end_date: session.end_date,
      form_price: session.form_price,
      admission_fee: session.admission_fee,
      status: session.status,
      description: session.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admission session?')) {
      return;
    }

    try {
      await api.delete(`/admin/admission-sessions/${id}`);
      toast.success('Admission session deleted successfully');
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete admission session');
      }
    }
  };

  const handleViewStats = (session) => {
    setSelectedSession(session);
    fetchSessionStats(session.id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      academic_year: '',
      start_date: '',
      end_date: '',
      form_price: '',
      admission_fee: '',
      status: 'inactive',
      description: ''
    });
  };

  const openModal = () => {
    setEditingSession(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSession(null);
    resetForm();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Error';
    }
  };

  // Prepare data for export (moved here after function definitions)
  const exportData = sessions.map(session => ({
    name: session.name || 'N/A',
    academic_year: session.academic_year || 'N/A',
    duration: `${formatDate(session.start_date)} - ${formatDate(session.end_date)}`,
    form_price: formatAmount(session.form_price),
    admission_fee: formatAmount(session.admission_fee),
    status: session.status.charAt(0).toUpperCase() + session.status.slice(1),
    created_at: session.created_at ? new Date(session.created_at).toLocaleDateString() : 'N/A'
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

    return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md p-6">
          {/* Info Alert */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Important Notice
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Only one admission session can be active at a time. When you activate a new session, any previously active session will be automatically deactivated to maintain system integrity.</p>
                  <p className="mt-1 font-medium">
                    Currently active sessions: {activeSessionCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center mb-8">
            <button
              onClick={openModal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Session
            </button>
          </div>

          {/* Export Options */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {sessions.length} session(s) found
            </div>
            <ExportOptions
              data={exportData}
              filename="admission-sessions"
              tableRef={tableRef}
              columns={exportColumns}
              title="Admission Sessions Report"
            />
          </div>

          <div className="overflow-x-auto" ref={tableRef}>
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Form Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {session.name}
                        {session.status === 'active' && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{session.academic_year}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(session.start_date)} - {formatDate(session.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatAmount(session.form_price)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                        {session.status === 'active' ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Active
                          </>
                        ) : (
                          session.status.charAt(0).toUpperCase() + session.status.slice(1)
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleViewStats(session)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Stats
                      </button>
                      <button
                        onClick={() => handleEdit(session)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sessions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No admission sessions found. Create your first session to get started.</p>
            </div>
          )}

          {/* Session Statistics */}
          {selectedSession && sessionStats && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Statistics for {selectedSession.name} ({sessionStats.session_academic_year})
              </h2>
              
              {/* Session Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Duration:</span>
                    <span className="text-blue-600 ml-2">
                      {sessionStats.session_start_date && sessionStats.session_end_date 
                        ? `${formatDate(sessionStats.session_start_date)} - ${formatDate(sessionStats.session_end_date)}`
                        : `N/A (Start: ${sessionStats.session_start_date}, End: ${sessionStats.session_end_date})`
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Form Price:</span>
                    <span className="text-blue-600 ml-2">{formatAmount(sessionStats.session_form_price)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Status:</span>
                    <span className="text-blue-600 ml-2">
                      {sessionStats.session_status ? sessionStats.session_status.charAt(0).toUpperCase() + sessionStats.session_status.slice(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Application Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm font-medium text-gray-500">Total Applications</div>
                  <div className="text-2xl font-bold text-blue-600">{sessionStats.total_applications}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm font-medium text-gray-500">Pending</div>
                  <div className="text-2xl font-bold text-yellow-600">{sessionStats.pending_applications}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm font-medium text-gray-500">Approved</div>
                  <div className="text-2xl font-bold text-green-600">{sessionStats.approved_applications}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm font-medium text-gray-500">Rejected</div>
                  <div className="text-2xl font-bold text-red-600">{sessionStats.rejected_applications}</div>
                </div>
              </div>

              {/* Payment Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm font-medium text-gray-500">Form Payments</div>
                  <div className="text-2xl font-bold text-indigo-600">{sessionStats.form_payments}</div>
                  <div className="text-sm text-gray-500">{formatAmount(sessionStats.form_revenue)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm font-medium text-gray-500">Admission Fee Payments</div>
                  <div className="text-2xl font-bold text-purple-600">{sessionStats.admission_fee_payments}</div>
                  <div className="text-sm text-gray-500">{formatAmount(sessionStats.admission_fee_revenue)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm font-medium text-gray-500">Acceptance Fee Payments</div>
                  <div className="text-2xl font-bold text-cyan-600">{sessionStats.acceptance_fee_payments}</div>
                  <div className="text-sm text-gray-500">{formatAmount(sessionStats.acceptance_fee_revenue)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                  <div className="text-2xl font-bold text-emerald-600">{formatAmount(sessionStats.total_revenue)}</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status Distribution</h3>
                  <div className="h-64">
                    <Bar 
                      data={{
                        labels: ['Draft', 'Pending', 'Approved', 'Rejected'],
                        datasets: [{
                          label: 'Applications',
                          data: [
                            sessionStats.draft_applications || 0,
                            sessionStats.pending_applications,
                            sessionStats.approved_applications,
                            sessionStats.rejected_applications
                          ],
                          backgroundColor: ['#6b7280', '#fbbf24', '#10b981', '#ef4444']
                        }]
                      }}
                      options={{ 
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Distribution</h3>
                  <div className="h-64">
                    <Pie 
                      data={{
                        labels: ['Form Purchase', 'Admission Fee', 'Acceptance Fee'],
                        datasets: [{
                          data: [
                            sessionStats.form_payments,
                            sessionStats.admission_fee_payments,
                            sessionStats.acceptance_fee_payments
                          ],
                          backgroundColor: ['#6366f1', '#10b981', '#06b6d4']
                        }]
                      }}
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                </div>
              </div>

              {/* Faculty Statistics */}
              {sessionStats.faculty_stats && sessionStats.faculty_stats.length > 0 && (
                <div className="bg-white p-4 rounded-lg border mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Faculty-wise Applications</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rejected</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sessionStats.faculty_stats.map((faculty, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{faculty.faculty_name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{faculty.total_applications}</td>
                            <td className="px-4 py-2 text-sm text-yellow-600">{faculty.pending_applications}</td>
                            <td className="px-4 py-2 text-sm text-green-600">{faculty.approved_applications}</td>
                            <td className="px-4 py-2 text-sm text-red-600">{faculty.rejected_applications}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Department Statistics */}
              {sessionStats.department_stats && sessionStats.department_stats.length > 0 && (
                <div className="bg-white p-4 rounded-lg border mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Department-wise Applications</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rejected</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sessionStats.department_stats.map((dept, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{dept.department_name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{dept.total_applications}</td>
                            <td className="px-4 py-2 text-sm text-yellow-600">{dept.pending_applications}</td>
                            <td className="px-4 py-2 text-sm text-green-600">{dept.approved_applications}</td>
                            <td className="px-4 py-2 text-sm text-red-600">{dept.rejected_applications}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Monthly Trends */}
              {sessionStats.monthly_trends && sessionStats.monthly_trends.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Application Trends</h3>
                  <div className="h-64">
                    <Bar 
                      data={{
                        labels: sessionStats.monthly_trends.map(trend => trend.month_name),
                        datasets: [{
                          label: 'Applications',
                          data: sessionStats.monthly_trends.map(trend => trend.applications_count),
                          backgroundColor: '#3b82f6'
                        }]
                      }}
                      options={{ 
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingSession ? 'Edit Admission Session' : 'Add New Admission Session'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Session Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      value={formData.academic_year}
                      onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                      placeholder="e.g., 2024/2025"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Form Price (NGN) *
                      </label>
                      <input
                        type="number"
                        value={formData.form_price}
                        onChange={(e) => setFormData({...formData, form_price: e.target.value})}
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Admission Fee (NGN) *
                      </label>
                      <input
                        type="number"
                        value={formData.admission_fee}
                        onChange={(e) => setFormData({...formData, admission_fee: e.target.value})}
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="inactive">Inactive</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      {editingSession ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default AdmissionSessionManagement; 