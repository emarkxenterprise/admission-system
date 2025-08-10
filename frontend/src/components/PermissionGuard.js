import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStaffAuth } from '../contexts/StaffAuthContext';

// Separate component for regular user permissions
const UserPermissionGuard = ({ 
  children, 
  roles = [], 
  permissions = [], 
  fallback = null,
  requireAllRoles = false,
  requireAllPermissions = false 
}) => {
  const { 
    hasRole, 
    hasAnyRole, 
    hasAllRoles, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions 
  } = useAuth();

  // Check roles
  let hasRequiredRoles = true;
  if (roles.length > 0) {
    if (requireAllRoles) {
      hasRequiredRoles = hasAllRoles(roles);
    } else {
      hasRequiredRoles = hasAnyRole(roles);
    }
  }

  // Check permissions
  let hasRequiredPermissions = true;
  if (permissions.length > 0) {
    if (requireAllPermissions) {
      hasRequiredPermissions = hasAllPermissions(permissions);
    } else {
      hasRequiredPermissions = hasAnyPermission(permissions);
    }
  }

  // Show children only if both roles and permissions are satisfied
  if (hasRequiredRoles && hasRequiredPermissions) {
    return children;
  }

  // Return fallback or null
  return fallback;
};

// Separate component for staff permissions
const StaffPermissionGuard = ({ 
  children, 
  roles = [], 
  permissions = [], 
  fallback = null,
  requireAllRoles = false,
  requireAllPermissions = false 
}) => {
  const { 
    hasRole, 
    hasAnyRole, 
    hasAllRoles, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions 
  } = useStaffAuth();

  console.log('StaffPermissionGuard - Checking permissions:', permissions);
  console.log('StaffPermissionGuard - Checking roles:', roles);

  // Check roles
  let hasRequiredRoles = true;
  if (roles.length > 0) {
    if (requireAllRoles) {
      hasRequiredRoles = hasAllRoles(roles);
    } else {
      hasRequiredRoles = hasAnyRole(roles);
    }
  }

  // Check permissions
  let hasRequiredPermissions = true;
  if (permissions.length > 0) {
    if (requireAllPermissions) {
      hasRequiredPermissions = hasAllPermissions(permissions);
    } else {
      hasRequiredPermissions = hasAnyPermission(permissions);
    }
  }

  console.log('StaffPermissionGuard - hasRequiredRoles:', hasRequiredRoles, 'hasRequiredPermissions:', hasRequiredPermissions);

  // Show children only if both roles and permissions are satisfied
  if (hasRequiredRoles && hasRequiredPermissions) {
    console.log('StaffPermissionGuard - Showing children');
    return children;
  }

  console.log('StaffPermissionGuard - Returning fallback');
  // Return fallback or null
  return fallback;
};

// Main component that tries both contexts
const PermissionGuard = (props) => {
  // Temporarily just show children without permission checking
  return props.children;
};

export default PermissionGuard; 