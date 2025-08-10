import React, { useState } from 'react';
import { CSidebar, CSidebarNav, CNavItem, CNavTitle, CHeader, CContainer, CHeaderBrand, CButton, CSidebarToggler } from '@coreui/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStaffAuth } from '../../../contexts/StaffAuthContext';
import { useSettings } from '../../../contexts/SettingsContext';

const CoreUILayout = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { logout, hasAnyPermission } = useStaffAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex" style={{ minHeight: '100vh', width: '100%' }}>
      <CSidebar 
        visible={sidebarVisible} 
        onVisibleChange={(visible) => setSidebarVisible(visible)}
        className="vh-100 bg-dark"
        style={{ 
          minWidth: '250px', 
          maxWidth: '250px',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1030
        }}
      >
        <CHeaderBrand className="d-flex align-items-center justify-content-center py-4 border-bottom border-secondary">
          <div className="d-flex align-items-center">
            <img
              src="/12.png"
              alt="Admin Logo"
              className="me-3"
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <span className="fs-5 fw-bold text-white">
              {settings?.school_name || 'Admin Portal'}
            </span>
          </div>
        </CHeaderBrand>
        
        <CSidebarNav className="flex-column" style={{ height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
          <CNavTitle className="text-white-50 px-3 py-2">Navigation</CNavTitle>
          
          <CNavItem 
            component={Link} 
            to="/admin" 
            className={`px-3 py-2 ${isActive('/admin') ? 'bg-primary text-white' : 'text-white-50'}`}
            style={{ textDecoration: 'none' }}
          >
            <i className="fas fa-tachometer-alt me-2"></i>
            Dashboard
          </CNavItem>
          
          <CNavItem 
            component={Link} 
            to="/admin/applications" 
            className={`px-3 py-2 ${isActive('/admin/applications') ? 'bg-primary text-white' : 'text-white-50'}`}
            style={{ textDecoration: 'none' }}
          >
            <i className="fas fa-file-alt me-2"></i>
            Applications
          </CNavItem>
          
          <CNavItem 
            component={Link} 
            to="/admin/payments" 
            className={`px-3 py-2 ${isActive('/admin/payments') ? 'bg-primary text-white' : 'text-white-50'}`}
            style={{ textDecoration: 'none' }}
          >
            <i className="fas fa-credit-card me-2"></i>
            Payments
          </CNavItem>
          
          <CNavItem 
            component={Link} 
            to="/admin/hr-management" 
            className={`px-3 py-2 ${isActive('/admin/hr-management') ? 'bg-primary text-white' : 'text-white-50'}`}
            style={{ textDecoration: 'none' }}
          >
            <i className="fas fa-users me-2"></i>
            HR Management
          </CNavItem>
          
          <CNavItem 
            component={Link} 
            to="/admin/departments" 
            className={`px-3 py-2 ${isActive('/admin/departments') ? 'bg-primary text-white' : 'text-white-50'}`}
            style={{ textDecoration: 'none' }}
          >
            <i className="fas fa-building me-2"></i>
            Departments
          </CNavItem>
          
          {/* Faculties link - permission check */}
          {hasAnyPermission(['view-faculties', 'manage-faculties']) && (
            <CNavItem 
              component={Link} 
              to="/admin/faculties" 
              className={`px-3 py-2 ${isActive('/admin/faculties') ? 'bg-primary text-white' : 'text-white-50'}`}
              style={{ textDecoration: 'none' }}
            >
              <i className="fas fa-university me-2"></i>
              Faculties
            </CNavItem>
          )}
          
          <CNavItem 
            component={Link} 
            to="/admin/sessions" 
            className={`