import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      console.log('Fetching user data...');
      const response = await api.get('/user');
      const userData = response.data.data?.user || response.data;
      console.log('User data received:', userData);
      setUser(userData);
      
      // Extract roles and permissions from user data
      if (userData.roles) {
        const roles = userData.roles.map(role => role.name);
        setUserRoles(roles);
        console.log('User roles:', roles);
        
        // Collect all permissions from all roles
        const allPermissions = userData.roles.reduce((permissions, role) => {
          if (role.permissions) {
            return [...permissions, ...role.permissions.map(p => p.name)];
          }
          return permissions;
        }, []);
        const uniquePermissions = [...new Set(allPermissions)]; // Remove duplicates
        setUserPermissions(uniquePermissions);
        console.log('User permissions:', uniquePermissions);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setUserRoles([]);
      setUserPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login process...');
      console.log('AuthContext: Making API request to /login');
      
      const response = await api.post('/login', { email, password });
      console.log('AuthContext: Raw response:', response);
      
      // Handle different response structures
      const responseData = response.data;
      let token, user;
      
      if (responseData.data) {
        // Standard Laravel API response structure
        token = responseData.data.token;
        user = responseData.data.user;
      } else {
        // Direct response structure
        token = responseData.token;
        user = responseData.user;
      }
      
      console.log('AuthContext: Extracted data:', { token: !!token, user });
      
      if (!token || !user) {
        throw new Error('Invalid response structure: missing token or user data');
      }
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      // Extract roles and permissions
      if (user.roles) {
        const roles = user.roles.map(role => role.name);
        setUserRoles(roles);
        console.log('AuthContext: Set user roles:', roles);
        
        const allPermissions = user.roles.reduce((permissions, role) => {
          if (role.permissions) {
            return [...permissions, ...role.permissions.map(p => p.name)];
          }
          return permissions;
        }, []);
        const uniquePermissions = [...new Set(allPermissions)];
        setUserPermissions(uniquePermissions);
        console.log('AuthContext: Set user permissions:', uniquePermissions);
      }
      
      console.log('AuthContext: Login completed successfully, user state:', user);
      return responseData;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      // Clear any existing token on login failure
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setUserRoles([]);
      setUserPermissions([]);
      throw error; // Re-throw the error so the component can handle it
    }
  };

  const register = async (userData) => {
    const response = await api.post('/register', userData);
    const { token, user } = response.data.data;
    
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    
    // Extract roles and permissions
    if (user.roles) {
      setUserRoles(user.roles.map(role => role.name));
      const allPermissions = user.roles.reduce((permissions, role) => {
        if (role.permissions) {
          return [...permissions, ...role.permissions.map(p => p.name)];
        }
        return permissions;
      }, []);
      setUserPermissions([...new Set(allPermissions)]);
    }
    
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', getErrorMessage(error));
    } finally {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setUserRoles([]);
      setUserPermissions([]);
    }
  };

  // Permission checking methods
  const hasRole = (roleName) => {
    return userRoles.includes(roleName);
  };

  const hasAnyRole = (roleNames) => {
    return roleNames.some(role => userRoles.includes(role));
  };

  const hasAllRoles = (roleNames) => {
    return roleNames.every(role => userRoles.includes(role));
  };

  const hasPermission = (permissionName) => {
    return userPermissions.includes(permissionName);
  };

  const hasAnyPermission = (permissionNames) => {
    return permissionNames.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissionNames) => {
    return permissionNames.every(permission => userPermissions.includes(permission));
  };

  const value = {
    user,
    loading,
    userRoles,
    userPermissions,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

function getErrorMessage(error, fallback = 'An error occurred') {
  let message =
    error?.response?.data?.message ||
    error?.message ||
    fallback;
  if (typeof message !== 'string') {
    if (Array.isArray(message)) {
      message = message.join(' ');
    } else if (typeof message === 'object' && message !== null) {
      message = Object.values(message).flat().join(' ');
    } else {
      message = JSON.stringify(message);
    }
  }
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    message += ': ' + Object.values(errors).flat().join(' ');
  }
  return message;
} 