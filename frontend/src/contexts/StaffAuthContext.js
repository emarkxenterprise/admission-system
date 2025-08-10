import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const StaffAuthContext = createContext();

export const useStaffAuth = () => {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};

export const StaffAuthProvider = ({ children }) => {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchStaff();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff/user');
      const staffData = response.data.data?.staff || response.data;
      setStaff(staffData);
      if (staffData.roles) {
        setRoles(staffData.roles.map(role => role.name));
        const allPermissions = staffData.roles.reduce((perms, role) => {
          if (role.permissions) {
            return [...perms, ...role.permissions.map(p => p.name)];
          }
          return perms;
        }, []);
        setPermissions([...new Set(allPermissions)]);
      }
    } catch (error) {
      localStorage.removeItem('admin_token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('StaffAuthContext: Starting login process...');
      console.log('StaffAuthContext: Making API request to /staff/login');
      
      const response = await api.post('/staff/login', { email, password });
      console.log('StaffAuthContext: Raw response:', response);
      
      // Handle different response structures
      const responseData = response.data;
      let token, staffData;
      
      if (responseData.data) {
        // Standard Laravel API response structure
        token = responseData.data.token;
        staffData = responseData.data.staff;
      } else {
        // Direct response structure
        token = responseData.token;
        staffData = responseData.staff;
      }
      
      console.log('StaffAuthContext: Extracted data:', { token: !!token, staff: staffData });
      
      if (!token || !staffData) {
        throw new Error('Invalid response structure: missing token or staff data');
      }
      
      localStorage.setItem('admin_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setStaff(staffData);
      
      if (staffData.roles) {
        const roles = staffData.roles.map(role => role.name);
        setRoles(roles);
        console.log('StaffAuthContext: Set staff roles:', roles);
        
        const allPermissions = staffData.roles.reduce((perms, role) => {
          if (role.permissions) {
            return [...perms, ...role.permissions.map(p => p.name)];
          }
          return perms;
        }, []);
        const uniquePermissions = [...new Set(allPermissions)];
        setPermissions(uniquePermissions);
        console.log('StaffAuthContext: Set staff permissions:', uniquePermissions);
      }
      
      console.log('StaffAuthContext: Login completed successfully, staff state:', staffData);
      return responseData;
    } catch (error) {
      console.error('StaffAuthContext: Login error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        isNetworkError: !error.response,
        isTimeout: error.code === 'ECONNABORTED'
      });
      
      // Clear any existing token on login failure
      localStorage.removeItem('admin_token');
      delete api.defaults.headers.common['Authorization'];
      setStaff(null);
      setRoles([]);
      setPermissions([]);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/staff/logout');
    } catch (error) {
      // ignore
    } finally {
      localStorage.removeItem('admin_token');
      delete api.defaults.headers.common['Authorization'];
      setStaff(null);
      setRoles([]);
      setPermissions([]);
    }
  };

  // Permission checking methods
  const hasRole = (roleName) => roles.includes(roleName);
  const hasAnyRole = (roleNames) => roleNames.some(role => roles.includes(role));
  const hasAllRoles = (roleNames) => roleNames.every(role => roles.includes(role));
  const hasPermission = (permissionName) => permissions.includes(permissionName);
  const hasAnyPermission = (permissionNames) => permissionNames.some(permission => permissions.includes(permission));
  const hasAllPermissions = (permissionNames) => permissionNames.every(permission => permissions.includes(permission));

  const value = {
    staff,
    loading,
    roles,
    permissions,
    login,
    logout,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
}; 