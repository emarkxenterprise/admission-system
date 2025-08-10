import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

import PermissionGuard from '../PermissionGuard';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { staff, permissions, roles, hasAnyPermission } = useStaffAuth();
  
  // Simple permission check function
  const hasPermission = (requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return hasAnyPermission(requiredPermissions);
  };
  
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    admittedStudents: 0,
    totalPayments: 0,
    totalRevenue: 0,
    totalDepartments: 0,
    totalFaculties: 0,
    totalStaff: 0,
    totalApplicants: 0,
    activeApplicants: 0,
    inactiveApplicants: 0,
    suspendedApplicants: 0,
    applicantsWithApplications: 0,
    applicantsWithPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    api.get('/admin/settings').then(res => {
      setSettings(res.data);
    });
    api.get('/admin/recent-activity').then(res => {
      if (res.data && res.data.data) setRecentActivity(res.data.data);
    });
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      const data = response.data;
      setStats({
        totalApplications: data.total_applications || 0,
        pendingApplications: data.pending_applications || 0,
        approvedApplications: data.approved_applications || 0,
        admittedStudents: data.admitted_students || 0,
        totalPayments: data.total_payments || 0,
        totalRevenue: data.total_revenue || 0,
        totalDepartments: data.total_departments || 0,
        totalFaculties: data.total_faculties || 0,
        totalStaff: data.total_staff || 0,
        totalApplicants: data.total_applicants || 0,
        activeApplicants: data.active_applicants || 0,
        inactiveApplicants: data.inactive_applicants || 0,
        suspendedApplicants: data.suspended_applicants || 0,
        applicantsWithApplications: data.applicants_with_applications || 0,
        applicantsWithPayments: data.applicants_with_payments || 0,
      });
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Dummy revenue breakdown data (replace with real data if available)
  const revenueData = {
    labels: ['Form Purchase', 'Admission Fee'],
    datasets: [
      {
        label: 'Revenue (NGN)',
        data: [stats.totalRevenue * 0.6, stats.totalRevenue * 0.4], // Example split
        backgroundColor: ['#6366f1', '#10b981'],
        borderWidth: 1,
      },
    ],
  };
  const pieData = {
    labels: ['Form Purchase', 'Admission Fee'],
    datasets: [
      {
        data: [stats.totalRevenue * 0.6, stats.totalRevenue * 0.4],
        backgroundColor: ['#6366f1', '#10b981'],
        borderWidth: 1,
      },
    ],
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




          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {hasPermission(['view-applications', 'manage-admissions']) && (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Applications</p>
                    <p className="text-2xl font-semibold text-blue-900">{stats.totalApplications}</p>
                  </div>
                </div>
              </div>
            )}

            {hasPermission(['view-applications', 'manage-admissions']) && (
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-600">Pending Applications</p>
                    <p className="text-2xl font-semibold text-yellow-900">{stats.pendingApplications}</p>
                  </div>
                </div>
              </div>
            )}

            {hasPermission(['view-applications', 'manage-admissions']) && (
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Admitted Students</p>
                    <p className="text-2xl font-semibold text-green-900">{stats.admittedStudents}</p>
                  </div>
                </div>
              </div>
            )}

            {hasPermission(['view-applications', 'manage-admissions']) && (
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-purple-900">{formatAmount(stats.totalRevenue)}</p>
                  </div>
                </div>
              </div>
            )}

            {hasPermission(['manage-departments']) && (
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-600">Total Departments</p>
                    <p className="text-2xl font-semibold text-indigo-900">{stats.totalDepartments}</p>
                  </div>
                </div>
              </div>
            )}

            {hasPermission(['manage-departments']) && (
              <div className="bg-violet-50 p-6 rounded-lg border border-violet-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-violet-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-violet-600">Total Faculties</p>
                    <p className="text-2xl font-semibold text-violet-900">{stats.totalFaculties}</p>
                  </div>
                </div>
              </div>
            )}

            {hasPermission(['manage-users']) && (
              <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-teal-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-teal-600">Total Staff</p>
                    <p className="text-2xl font-semibold text-teal-900">{stats.totalStaff}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Applicant Statistics */}
            {hasPermission(['manage-users']) && (
              <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-emerald-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-emerald-600">Total Applicants</p>
                    <p className="text-2xl font-semibold text-emerald-900">{stats.totalApplicants}</p>
                  </div>
                </div>
              </div>
            )}

            {hasPermission(['manage-users']) && (
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Active Applicants</p>
                    <p className="text-2xl font-semibold text-green-900">{stats.activeApplicants}</p>
                  </div>
                </div>
              </div>
            )}

            {hasPermission(['manage-users']) && (
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">With Applications</p>
                    <p className="text-2xl font-semibold text-orange-900">{stats.applicantsWithApplications}</p>
                  </div>
                </div>
              </div>
            )}

            {hasPermission(['manage-users']) && (
              <div className="bg-cyan-50 p-6 rounded-lg border border-cyan-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-cyan-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-cyan-600">With Payments</p>
                    <p className="text-2xl font-semibold text-cyan-900">{stats.applicantsWithPayments}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {hasPermission(['view-applications', 'manage-admissions']) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Manage Applications</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Review, approve, or reject admission applications from students.
                </p>
                <button
                  onClick={() => navigate('/admin/applications')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  View Applications
                </button>
              </div>
            )}

            {hasPermission(['manage-payments', 'view-payments']) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Payment Reports</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  View payment history, generate reports, and track revenue.
                </p>
                <button
                  onClick={() => navigate('/admin/payments')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  View Payments
                </button>
              </div>
            )}

            {hasPermission(['manage-departments']) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Departments</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Manage academic departments, add new departments, and update existing ones.
                </p>
                <button
                  onClick={() => navigate('/admin/departments')}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                >
                  Manage Departments
                </button>
              </div>
            )}

            {hasPermission(['manage-departments']) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Programs</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Manage academic programs, set fees, and configure program details.
                </p>
                <button
                  onClick={() => navigate('/admin/programs')}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  Manage Programs
                </button>
              </div>
            )}

            {hasPermission(['manage-admissions']) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Admission Sessions</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Manage admission sessions, set form sale periods, and view session statistics.
                </p>
                <button
                  onClick={() => navigate('/admin/admission-sessions')}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
                >
                  Manage Sessions
                </button>
              </div>
            )}

            {hasPermission(['manage-users']) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Manage Applicants</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  View and manage applicant accounts, applications, and payment status.
                </p>
                <button
                  onClick={() => navigate('/admin/applicants')}
                  className="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
                >
                  View Applicants
                </button>
              </div>
            )}

            {hasPermission(['manage-users']) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-teal-100 text-teal-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">HR Management</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Manage staff members, roles, permissions, and view employee statistics.
                </p>
                <button
                  onClick={() => navigate('/admin/hr-management')}
                  className="w-full bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors"
                >
                  Manage Staff
                </button>
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Breakdown</h3>
              <div className="h-64">
                <Bar data={revenueData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Distribution</h3>
              <div className="h-64">
                <Pie data={pieData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
              <span className="text-sm text-gray-500">
                Showing {recentActivity.length} activities
              </span>
            </div>
            {recentActivity.length === 0 ? (
              <div className="text-gray-500">No recent activity.</div>
            ) : (
              <ul className="divide-y divide-gray-200 bg-gray-50 rounded-lg">
                {recentActivity.map((activity, idx) => (
                  <li key={idx} className="px-4 py-3 flex items-center">
                    <span className="inline-block w-24 text-xs font-semibold uppercase mr-4 text-gray-500">
                      {activity.type}
                    </span>
                    <span className="flex-1 text-gray-800">
                      {activity.description}
                    </span>
                    <span className="ml-4 text-gray-500 text-xs">
                      {activity.user}
                    </span>
                    <span className="ml-4 text-gray-400 text-xs">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 