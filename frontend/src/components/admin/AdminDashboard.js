import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  LineElement,
  PointElement,
  Tooltip, 
  Legend,
  Filler 
} from 'chart.js';

import PermissionGuard from '../PermissionGuard';
import { useStaffAuth } from '../../contexts/StaffAuthContext';

import EnhancedNotifications from '../common/EnhancedNotifications';

Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  LineElement,
  PointElement,
  Tooltip, 
  Legend,
  Filler
);

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
  const [systemStatus, setSystemStatus] = useState({
    database: 'online',
    api: 'online',
    storage: 'online',
    lastCheck: new Date()
  });
  const [animatedStats, setAnimatedStats] = useState({});

  useEffect(() => {
    fetchDashboardStats();
    checkSystemStatus();
    api.get('/admin/settings').then(res => {
      setSettings(res.data);
    });
    api.get('/admin/recent-activity').then(res => {
      if (res.data && res.data.data) setRecentActivity(res.data.data);
    });
  }, []);

  // Animate stats counting up
  useEffect(() => {
    if (stats && !loading) {
      Object.keys(stats).forEach(key => {
        const targetValue = stats[key];
        const duration = 1000; // 1 second
        const steps = 60;
        const increment = targetValue / steps;
        let currentValue = 0;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          currentValue += increment;
          
          if (step >= steps) {
            currentValue = targetValue;
            clearInterval(timer);
          }

          setAnimatedStats(prev => ({
            ...prev,
            [key]: Math.floor(currentValue)
          }));
        }, duration / steps);

        return () => clearInterval(timer);
      });
    }
  }, [stats, loading]);

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

  const checkSystemStatus = async () => {
    try {
      // Check API status
      await api.get('/api/health');
      setSystemStatus(prev => ({ ...prev, api: 'online', lastCheck: new Date() }));
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, api: 'offline', lastCheck: new Date() }));
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTrendIndicator = (key) => {
    // Mock trend data - replace with real data from your API
    const trends = {
      totalApplications: { value: 12, direction: 'up' },
      pendingApplications: { value: 5, direction: 'down' },
      approvedApplications: { value: 8, direction: 'up' },
      totalRevenue: { value: 15, direction: 'up' },
      totalApplicants: { value: 3, direction: 'up' },
      admittedStudents: { value: 10, direction: 'up' },
      totalDepartments: { value: 2, direction: 'up' },
      totalFaculties: { value: 1, direction: 'up' },
      totalStaff: { value: 4, direction: 'up' }
    };

    const trend = trends[key];
    if (!trend) return null;

    if (trend.direction === 'up') {
      return (
        <div className="flex items-center text-green-100 text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>+{trend.value}%</span>
        </div>
      );
    } else if (trend.direction === 'down') {
      return (
        <div className="flex items-center text-red-100 text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          <span>-{trend.value}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-100 text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
          <span>0%</span>
        </div>
      );
    }
  };

  // Enhanced revenue breakdown data
  const revenueData = {
    labels: ['Form Purchase', 'Admission Fee', 'Other Fees'],
    datasets: [
      {
        label: 'Revenue (NGN)',
        data: [
          stats.totalRevenue * 0.6, 
          stats.totalRevenue * 0.35, 
          stats.totalRevenue * 0.05
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const pieData = {
    labels: ['Form Purchase', 'Admission Fee', 'Other Fees'],
    datasets: [
      {
        data: [
          stats.totalRevenue * 0.6, 
          stats.totalRevenue * 0.35, 
          stats.totalRevenue * 0.05
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // New: Application trends data
  const applicationTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Applications',
        data: [65, 78, 90, 85, 95, 110],
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: '600'
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatAmount(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {staff?.name || 'Administrator'}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Here's what's happening with your admission system today
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              {/* System Status Indicators */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                  <div className={`w-3 h-3 rounded-full ${systemStatus.database === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">Database</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                  <div className={`w-3 h-3 rounded-full ${systemStatus.api === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">API</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                  <div className={`w-3 h-3 rounded-full ${systemStatus.storage === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">Storage</span>
                </div>
              </div>
              
              {/* Enhanced Notifications */}
              <EnhancedNotifications />
            </div>
          </div>
        </div>



        {/* Statistics Cards - Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {hasPermission(['view-applications', 'manage-admissions']) && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Applications</p>
                    <p className="text-3xl font-bold">{formatNumber(animatedStats.totalApplications || 0)}</p>
                    {getTrendIndicator('totalApplications')}
                  </div>
                  <div className="p-3 rounded-full bg-blue-400 bg-opacity-30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-blue-100 text-sm">
                  <span className="mr-2">📈</span>
                  <span>Active applications</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${Math.min((animatedStats.totalApplications || 0) / (stats.totalApplications || 1) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasPermission(['view-applications', 'manage-admissions']) && (
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Pending Applications</p>
                    <p className="text-3xl font-bold">{formatNumber(animatedStats.pendingApplications || 0)}</p>
                    {getTrendIndicator('pendingApplications')}
                  </div>
                  <div className="p-3 rounded-full bg-yellow-400 bg-opacity-30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-yellow-100 text-sm">
                  <span className="mr-2">⏳</span>
                  <span>Awaiting review</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-yellow-400 bg-opacity-30 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${Math.min((animatedStats.pendingApplications || 0) / (stats.pendingApplications || 1) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasPermission(['view-applications', 'manage-admissions']) && (
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Admitted Students</p>
                    <p className="text-3xl font-bold">{formatNumber(animatedStats.admittedStudents || 0)}</p>
                    {getTrendIndicator('admittedStudents')}
                  </div>
                  <div className="p-3 rounded-full bg-green-400 bg-opacity-30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-green-100 text-sm">
                  <span className="mr-2">🎓</span>
                  <span>Successfully admitted</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-green-400 bg-opacity-30 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${Math.min((animatedStats.admittedStudents || 0) / (stats.admittedStudents || 1) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasPermission(['view-applications', 'manage-admissions']) && (
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold">{formatAmount(animatedStats.totalRevenue || 0)}</p>
                    {getTrendIndicator('totalRevenue')}
                  </div>
                  <div className="p-3 rounded-full bg-purple-400 bg-opacity-30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-purple-100 text-sm">
                  <span className="mr-2">💰</span>
                  <span>Total earnings</span>
                </div>
              </div>
            </div>
          )}

          {hasPermission(['manage-departments']) && (
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Departments</p>
                    <p className="text-3xl font-bold">{formatNumber(animatedStats.totalDepartments || 0)}</p>
                    {getTrendIndicator('totalDepartments')}
                  </div>
                  <div className="p-3 rounded-full bg-indigo-400 bg-opacity-30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-indigo-100 text-sm">
                  <span className="mr-2">🏢</span>
                  <span>Academic units</span>
                </div>
              </div>
            </div>
          )}

          {hasPermission(['manage-departments']) && (
            <div className="bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100 text-sm font-medium">Faculties</p>
                    <p className="text-3xl font-bold">{formatNumber(animatedStats.totalFaculties || 0)}</p>
                    {getTrendIndicator('totalFaculties')}
                  </div>
                  <div className="p-3 rounded-full bg-violet-400 bg-opacity-30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-violet-100 text-sm">
                  <span className="mr-2">📚</span>
                  <span>Academic divisions</span>
                </div>
              </div>
            </div>
          )}

          {hasPermission(['manage-users']) && (
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">Staff Members</p>
                    <p className="text-3xl font-bold">{formatNumber(animatedStats.totalStaff || 0)}</p>
                    {getTrendIndicator('totalStaff')}
                  </div>
                  <div className="p-3 rounded-full bg-teal-400 bg-opacity-30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-teal-100 text-sm">
                  <span className="mr-2">👥</span>
                  <span>Administrative staff</span>
                </div>
              </div>
            </div>
          )}

          {hasPermission(['manage-users']) && (
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Total Applicants</p>
                    <p className="text-3xl font-bold">{formatNumber(animatedStats.totalApplicants || 0)}</p>
                    {getTrendIndicator('totalApplicants')}
                  </div>
                  <div className="p-3 rounded-full bg-emerald-400 bg-opacity-30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-emerald-100 text-sm">
                  <span className="mr-2">🎯</span>
                  <span>Registered users</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions - Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {hasPermission(['view-applications', 'manage-admissions']) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-blue-500">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Manage Applications</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Review, approve, or reject admission applications from students.
              </p>
              <button
                onClick={() => navigate('/admin/applications')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                View Applications
              </button>
            </div>
          )}

          {hasPermission(['manage-payments', 'view-payments']) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-green-500">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Payment Reports</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View payment history, generate reports, and track revenue.
              </p>
              <button
                onClick={() => navigate('/admin/payments')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                View Payments
              </button>
            </div>
          )}

          {hasPermission(['manage-departments']) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-indigo-500">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Departments</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage academic departments, add new departments, and update existing ones.
              </p>
              <button
                onClick={() => navigate('/admin/departments')}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Manage Departments
              </button>
            </div>
          )}

          {hasPermission(['manage-departments']) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-purple-500">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Programs</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage academic programs, set fees, and configure program details.
              </p>
              <button
                onClick={() => navigate('/admin/programs')}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Manage Programs
              </button>
            </div>
          )}

          {hasPermission(['manage-admissions']) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-orange-500">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Admission Sessions</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage admission sessions, set form sale periods, and view session statistics.
              </p>
              <button
                onClick={() => navigate('/admin/admission-sessions')}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Manage Sessions
              </button>
            </div>
          )}

          {hasPermission(['manage-users']) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-emerald-500">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Manage Applicants</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View and manage applicant accounts, applications, and payment status.
              </p>
              <button
                onClick={() => navigate('/admin/applicants')}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                View Applicants
              </button>
            </div>
          )}

          {hasPermission(['manage-users']) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-teal-500">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-teal-100 text-teal-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">HR Management</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage staff members, roles, permissions, and view employee statistics.
              </p>
              <button
                onClick={() => navigate('/admin/hr-management')}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Manage Staff
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Revenue Breakdown
            </h3>
            <div className="h-80">
              <Bar data={revenueData} options={chartOptions} />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🥧</span>
              Payment Distribution
            </h3>
            <div className="h-80">
              <Pie data={pieData} options={pieChartOptions} />
            </div>
          </div>
        </div>

        {/* New: Application Trends Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Application Trends (Last 6 Months)
          </h3>
          <div className="h-80">
            <Line data={applicationTrendsData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activity Section - Enhanced */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="mr-3">🕒</span>
              Recent Activity
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {recentActivity.length} activities
            </span>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No recent activity to display</p>
              <p className="text-gray-400 text-sm">Activities will appear here as they happen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold text-sm">
                      {activity.type?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      by {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 