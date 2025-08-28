import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStaffAuth } from '../contexts/StaffAuthContext';
import { useSettings } from '../contexts/SettingsContext';

const Navbar = () => {
  const { user, logout: logoutUser, hasRole: hasUserRole, hasAnyPermission: hasUserPermission, loading: userLoading } = useAuth();
  const { staff, logout: logoutStaff, hasRole: hasStaffRole, hasAnyPermission: hasStaffPermission, loading: staffLoading } = useStaffAuth();
  const { settings } = useSettings();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const handleStaffLogout = async () => {
    await logoutStaff();
    navigate('/admin/login');
  };

  const handleProfileClick = () => {
    setUserDropdownOpen(false);
    if (staff) {
      navigate('/admin/profile');
    } else {
      navigate('/profile');
    }
  };

  const getUserDisplayName = () => {
    if (staff) return staff.name || staff.email || 'Staff';
    if (user) return user.name || user.email || 'User';
    return '';
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Don't render navbar if still loading or no active session
  if (userLoading || staffLoading || (!user && !staff)) {
    return null;
  }

  // Staff/Admin Navigation
  if (staff) {
                   const adminNavigation = [
        { name: 'Dashboard', href: '/admin', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
        { name: 'Applications', href: '/admin/applications', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permission: ['manage-admissions', 'view-applications'] },
        { name: 'Payment Reports', href: '/admin/payments', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', permission: ['manage-payments', 'view-payments'] },
        { name: 'Departments', href: '/admin/departments', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', permission: ['manage-departments'] },
        { name: 'Faculties', href: '/admin/faculties', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', permission: ['view-faculties', 'manage-faculties'] },
        { name: 'Admission Sessions', href: '/admin/admission-sessions', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', permission: ['manage-admissions'] },
        { name: 'Admission Lists', href: '/admin/admission-offers', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', permission: ['manage-admissions'] },
        { name: 'Applicants', href: '/admin/applicants', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', role: 'super-admin' },
        { name: 'HR Management', href: '/admin/hr-management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', role: 'super-admin' },
        { name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', permission: ['manage-settings'] },
      ];

    return (
      <>
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 shadow-lg transition-all duration-300 ease-in-out flex flex-col ${sidebarExpanded ? 'w-64' : 'w-16'}`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-blue-600">
            <div className="flex items-center">
              {sidebarExpanded ? (
                <img
                  src="/12.png"
                  alt="Admin Logo"
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <img
                  src="/12.png"
                  alt="Admin Logo"
                  className="h-8 w-8 object-contain"
                />
              )}
            </div>
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarExpanded ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4">
            <div className="space-y-1">
                                                                                                                       {adminNavigation.map((item) => {
                  // Check permissions/roles for items
                  if (item.permission && !hasStaffPermission(item.permission) && !hasStaffRole('super-admin')) {
                    return null;
                  }
                  if (item.role) {
                    // Handle both single role string and array of roles
                    const roles = Array.isArray(item.role) ? item.role : [item.role];
                    if (!roles.some(role => hasStaffRole(role))) {
                      return null;
                    }
                  }

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-blue-100 hover:bg-blue-600 hover:text-white transition-all duration-200"
                    title={!sidebarExpanded ? item.name : ''}
                  >
                    <svg
                      className={`${sidebarExpanded ? 'mr-3' : 'mx-auto'} h-5 w-5 text-blue-200 group-hover:text-white transition-colors`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {sidebarExpanded && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Info and Logout */}
          <div className="p-4 border-t border-blue-600 mt-auto">
            {sidebarExpanded ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {getUserInitial()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-100">{staff ? getUserDisplayName() : getUserDisplayName()}</p>
                    <p className="text-xs text-blue-200">{staff ? staff?.email : user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={staff ? handleStaffLogout : handleUserLogout}
                  className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
                  title="Logout"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center mb-1">
                  <span className="text-sm font-medium text-white">
                    {getUserInitial()}
                  </span>
                </div>
                <button
                  onClick={staff ? handleStaffLogout : handleUserLogout}
                  className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
                  title="Logout"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Top Header */}
        <header className="fixed top-0 right-0 left-16 z-40 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 shadow-lg transition-all duration-300 ease-in-out" style={{ left: sidebarExpanded ? '16rem' : '4rem' }}>
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-2 text-lg font-medium text-white">Admin Portal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-100">Welcome back, {getUserDisplayName()}</span>
              
              {/* User Avatar Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {getUserInitial()}
                    </span>
                  </div>
                  <svg 
                    className={`h-4 w-4 text-white transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{staff ? staff?.email : user?.email}</p>
                    </div>
                    
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Management
                    </button>
                    
                    {staff && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/admin/settings');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        </svg>
                        System Settings
                      </button>
                    )}
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={staff ? handleStaffLogout : handleUserLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      </>
    );
  }

  // Applicant/User Navigation
  const applicantNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    { name: 'Apply', href: '/apply', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Admission Status', href: '/admission-offers', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Payments', href: '/payments', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 shadow-lg transition-all duration-300 ease-in-out flex flex-col ${sidebarExpanded ? 'w-64' : 'w-16'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-blue-600">
          <div className="flex items-center">
            {sidebarExpanded && (
              <span className="text-lg font-semibold text-white">Admission Portal</span>
            )}
          </div>
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarExpanded ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4">
          <div className="space-y-1">
            {applicantNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-blue-100 hover:bg-blue-600 hover:text-white transition-all duration-200"
                title={!sidebarExpanded ? item.name : ''}
              >
                <svg
                  className={`${sidebarExpanded ? 'mr-3' : 'mx-auto'} h-5 w-5 text-blue-200 group-hover:text-white transition-colors`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {sidebarExpanded && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-blue-600 mt-auto">
          {sidebarExpanded ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getUserInitial()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-100">{getUserDisplayName()}</p>
                  <p className="text-xs text-blue-200">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleUserLogout}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
                title="Logout"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center mb-1">
                <span className="text-sm font-medium text-white">
                  {getUserInitial()}
                </span>
              </div>
              <button
                onClick={handleUserLogout}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
                title="Logout"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Header */}
      <header className="fixed top-0 right-0 left-16 z-40 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 shadow-lg transition-all duration-300 ease-in-out" style={{ left: sidebarExpanded ? '16rem' : '4rem' }}>
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="ml-2 text-lg font-medium text-white">Admission Portal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-blue-100">Welcome back, {getUserDisplayName()}</span>
            
            {/* User Avatar Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getUserInitial()}
                  </span>
                </div>
                <svg 
                  className={`h-4 w-4 text-white transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Management
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={handleUserLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar; 