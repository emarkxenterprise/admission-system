import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../../services/api';
import ExportOptions from '../ExportOptions';

// Custom hooks for better organization
const useHRData = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [adminsRes, rolesRes, auditRes] = await Promise.all([
        api.get('/hr/admins'),
        api.get('/hr/roles'),
        api.get('/hr/audit-log')
      ]);
      
      setAdmins(adminsRes.data);
      setRoles(rolesRes.data);
      setAuditLog(auditRes.data);
    } catch (err) {
      console.error('Error fetching HR data:', err);
      setError('Failed to fetch data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  return { admins, setAdmins, roles, setRoles, auditLog, setAuditLog, loading, error, fetchData };
};

const useMessage = () => {
  const [message, setMessage] = useState('');
  
  const showMessage = useCallback((text, type = 'success') => {
    setMessage(text);
    setTimeout(() => setMessage(''), 5000);
  }, []);

  return { message, showMessage };
};

// Form components for better organization
const CreateAdminForm = ({ roles, onSubmit, loading }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', email: '', password: '', role: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-green-100 rounded-full mr-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Create New Admin</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter admin name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            value={formData.email} 
            onChange={e => setFormData({ ...formData, email: e.target.value })} 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter email address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            value={formData.password} 
            onChange={e => setFormData({ ...formData, password: e.target.value })} 
            required 
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter password (min 6 characters)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select 
            value={formData.role} 
            onChange={e => setFormData({ ...formData, role: e.target.value })} 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select role</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            'Create Admin'
          )}
        </button>
      </form>
    </div>
  );
};

const AssignRoleForm = ({ admins, roles, onSubmit, loading }) => {
  const [formData, setFormData] = useState({ user_id: '', role: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ user_id: '', role: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-full mr-3">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Assign Role</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admin User</label>
          <select 
            value={formData.user_id} 
            onChange={e => setFormData({ ...formData, user_id: e.target.value })} 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select user</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select 
            value={formData.role} 
            onChange={e => setFormData({ ...formData, role: e.target.value })} 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select role</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Assigning...' : 'Assign Role'}
        </button>
      </form>
    </div>
  );
};

const CreateRoleForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-teal-100 rounded-full mr-3">
          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Create New Role</h3>
      </div>
      
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            required 
            placeholder="e.g., department-head"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <input 
            type="text" 
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
            placeholder="e.g., Department Head with limited permissions"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminsTable = ({ admins, onEdit, onToggleActive, onRemoveRole, searchTerm, onSearchChange }) => {
  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchTerm}
            onChange={onSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAdmins.map(admin => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">{admin.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-2">
                    {admin.roles.map(role => (
                      <span key={role.name} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {role.name}
                        <button
                          className="ml-1 text-blue-600 hover:text-blue-800"
                          onClick={() => onRemoveRole(admin.id, role.name)}
                          title={`Remove ${role.name} role`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    admin.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onEdit(admin)} 
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onToggleActive(admin.id)} 
                      className={`px-3 py-1 rounded-md transition-colors ${
                        admin.active 
                          ? 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100' 
                          : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {admin.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RolesList = ({ roles, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-100 rounded-full mr-3">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Current Roles</h3>
        </div>
      </div>
      
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => (
          <div key={role.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{role.name}</h4>
                <p className="text-sm text-gray-500">{role.description || 'No description'}</p>
              </div>
              <button
                onClick={() => onDelete(role.id)}
                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                title="Delete role"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AuditLogTable = ({ auditLog }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-purple-100 rounded-full mr-3">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h4 className="text-xl font-semibold text-gray-900">Role Change Audit Log</h4>
      </div>
      
      <div className="overflow-x-auto max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLog.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.staff_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {JSON.parse(log.roles).join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RolePermissionManagement = ({ roles, permissions, rolePermissions, expandedRoles, onToggleExpansion, onPermissionChange, onSavePermissions, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-orange-100 rounded-full mr-3">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Role & Permission Management</h3>
      </div>
      
      <div className="space-y-4">
        {roles.map(role => (
          <div key={role.id} className="border border-gray-200 rounded-lg">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => onToggleExpansion(role.id)}
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{role.name}</h4>
                  <p className="text-sm text-gray-500">{role.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {rolePermissions[role.id] ? rolePermissions[role.id].length : 0} permissions
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedRoles.has(role.id) ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {expandedRoles.has(role.id) && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Permissions</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions.map(permission => {
                      const isChecked = rolePermissions[role.id]?.some(p => p.name === permission.name) || false;
                      return (
                        <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => onPermissionChange(role.id, permission.name, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{permission.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => onSavePermissions(role.id)}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Permissions'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main component
const HRManagement = () => {
  const { admins, setAdmins, roles, setRoles, auditLog, setAuditLog, loading, error, fetchData } = useHRData();
  const { message, showMessage } = useMessage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // New state for permissions management
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [expandedRoles, setExpandedRoles] = useState(new Set());
  const [permissionLoading, setPermissionLoading] = useState(false);
  
  // Table reference for export
  const tableRef = useRef(null);
  
  // Define columns for export
  const exportColumns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'roles', header: 'Roles' },
    { key: 'status', header: 'Status' },
    { key: 'created_at', header: 'Created Date' }
  ];
  
  // Prepare data for export
  const exportData = admins.map(admin => ({
    name: admin.name || 'N/A',
    email: admin.email || 'N/A',
    roles: admin.roles?.map(role => role.name).join(', ') || 'N/A',
    status: admin.active ? 'Active' : 'Inactive',
    created_at: admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'
  }));

  useEffect(() => {
    fetchData();
    fetchPermissions();
  }, [fetchData]);

  // Fetch all permissions
  const fetchPermissions = async () => {
    try {
      const res = await api.get('/hr/permissions');
      setPermissions(res.data);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      showMessage('Failed to fetch permissions: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  // Fetch permissions for a specific role
  const fetchRolePermissions = async (roleId) => {
    try {
      const res = await api.get(`/hr/roles/${roleId}/permissions`);
      setRolePermissions(prev => ({
        ...prev,
        [roleId]: res.data
      }));
    } catch (err) {
      console.error('Error fetching role permissions:', err);
      showMessage('Failed to fetch role permissions: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  // Toggle role expansion
  const toggleRoleExpansion = (roleId) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
      // Fetch permissions when expanding
      if (!rolePermissions[roleId]) {
        fetchRolePermissions(roleId);
      }
    }
    setExpandedRoles(newExpanded);
  };

  // Update permissions for a role
  const updateRolePermissions = async (roleId, selectedPermissions) => {
    setPermissionLoading(true);
    try {
      await api.post(`/hr/roles/${roleId}/permissions`, {
        permissions: selectedPermissions
      });
      showMessage('Permissions updated successfully!');
      // Refresh role permissions
      fetchRolePermissions(roleId);
    } catch (err) {
      console.error('Error updating role permissions:', err);
      showMessage('Failed to update permissions: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setPermissionLoading(false);
    }
  };

  // Handle permission checkbox change
  const handlePermissionChange = (roleId, permissionName, checked) => {
    const currentPermissions = rolePermissions[roleId] || [];
    let newPermissions;
    
    if (checked) {
      newPermissions = [...currentPermissions, permissionName];
    } else {
      newPermissions = currentPermissions.filter(p => p !== permissionName);
    }
    
    setRolePermissions(prev => ({
      ...prev,
      [roleId]: newPermissions
    }));
  };

  // Save permissions for a role
  const saveRolePermissions = (roleId) => {
    const currentPermissions = rolePermissions[roleId] || [];
    updateRolePermissions(roleId, currentPermissions);
  };

  // API handlers
  const handleCreateAdmin = async (formData) => {
    setFormLoading(true);
    try {
      await api.post('/hr/create-admin', formData);
      showMessage('Admin created successfully!');
      fetchData();
    } catch (err) {
      console.error('Error creating admin:', err);
      showMessage('Failed to create admin: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAssignRole = async (formData) => {
    setFormLoading(true);
    try {
      await api.post('/hr/assign-role', formData);
      showMessage('Role assigned successfully!');
      fetchData();
    } catch (err) {
      console.error('Error assigning role:', err);
      showMessage('Failed to assign role: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateRole = async (formData) => {
    setFormLoading(true);
    try {
      await api.post('/hr/create-role', formData);
      showMessage('Role created successfully!');
      fetchData();
    } catch (err) {
      console.error('Error creating role:', err);
      showMessage('Failed to create role: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveRole = async (userId, role) => {
    if (!window.confirm(`Are you sure you want to remove the "${role}" role from this admin?`)) {
      return;
    }
    
    try {
      await api.post('/hr/remove-role', { user_id: userId, role });
      showMessage('Role removed successfully!');
      fetchData();
    } catch (err) {
      console.error('Error removing role:', err);
      showMessage('Failed to remove role: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      // Prepare payload
      const payload = {
        name: editingAdmin.name,
        email: editingAdmin.email,
        active: editingAdmin.active,
      };
      if (editingAdmin.password) payload.password = editingAdmin.password;
      // Use the selected role from the dropdown, or fallback to the first role
      if (editingAdmin.role) {
        payload.role = editingAdmin.role;
      } else if (editingAdmin.roles && editingAdmin.roles[0]) {
        payload.role = editingAdmin.roles[0].name;
      }
      await api.put(`/hr/edit-admin/${editingAdmin.id}`, payload);
      showMessage('Admin updated successfully!');
      setEditingAdmin(null);
      fetchData();
    } catch (err) {
      console.error('Error updating admin:', err);
      showMessage('Failed to update admin: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await api.post(`/hr/toggle-active/${userId}`);
      fetchData();
    } catch (err) {
      console.error('Error toggling admin status:', err);
      showMessage('Failed to toggle admin status: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/hr/delete-role/${roleId}`);
      showMessage('Role deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Error deleting role:', err);
      showMessage('Failed to delete role: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg font-medium text-gray-900">Loading HR Management...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">HR Management</h1>
                <p className="text-gray-600">Manage admin users, roles, and permissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAuditLog(!showAuditLog)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{showAuditLog ? 'Hide' : 'Show'} Audit Log</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-400 text-red-700">
            {error}
          </div>
        )}

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CreateAdminForm 
            roles={roles} 
            onSubmit={handleCreateAdmin} 
            loading={formLoading} 
          />
          <AssignRoleForm 
            admins={admins} 
            roles={roles} 
            onSubmit={handleAssignRole} 
            loading={formLoading} 
          />
        </div>

        {/* Create Role Form */}
        <div className="mb-6">
          <CreateRoleForm 
            onSubmit={handleCreateRole} 
            loading={formLoading} 
          />
        </div>

        {/* Roles List */}
        <div className="mb-6">
          <RolesList 
            roles={roles} 
            onDelete={handleDeleteRole} 
          />
        </div>

        {/* Role & Permission Management */}
        <div className="mb-6">
          <RolePermissionManagement
            roles={roles}
            permissions={permissions}
            rolePermissions={rolePermissions}
            expandedRoles={expandedRoles}
            onToggleExpansion={toggleRoleExpansion}
            onPermissionChange={handlePermissionChange}
            onSavePermissions={saveRolePermissions}
            loading={permissionLoading}
          />
        </div>

        {/* Admins Table */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-full mr-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Current Admins & Roles</h3>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {admins.length} admin(s) found
                </div>
                <ExportOptions
                  data={exportData}
                  filename="admins"
                  tableRef={tableRef}
                  columns={exportColumns}
                  title="Admins Report"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto" ref={tableRef}>
              <AdminsTable 
                admins={admins}
                onEdit={setEditingAdmin}
                onToggleActive={handleToggleActive}
                onRemoveRole={handleRemoveRole}
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Audit Log */}
        {showAuditLog && (
          <div className="mb-6">
            <AuditLogTable auditLog={auditLog} />
          </div>
        )}

        {/* Edit Admin Modal */}
        {editingAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 rounded-full mr-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Edit Admin</h3>
              </div>
              
              <form onSubmit={handleEditAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    value={editingAdmin.name} 
                    onChange={e => setEditingAdmin({ ...editingAdmin, name: e.target.value })} 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={editingAdmin.email} 
                    onChange={e => setEditingAdmin({ ...editingAdmin, email: e.target.value })} 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
                  <input 
                    type="password" 
                    value={editingAdmin.password || ''} 
                    onChange={e => setEditingAdmin({ ...editingAdmin, password: e.target.value })} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Active status toggle */}
                <div className="flex items-center">
                  <input
                    id="active-toggle"
                    type="checkbox"
                    checked={!!editingAdmin.active}
                    onChange={e => setEditingAdmin({ ...editingAdmin, active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="active-toggle" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>

                {/* Role dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editingAdmin.roles && editingAdmin.roles[0] ? editingAdmin.roles[0].name : ''}
                    onChange={e => setEditingAdmin({ ...editingAdmin, role: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    type="submit" 
                    disabled={formLoading} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {formLoading ? 'Updating...' : 'Update Admin'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingAdmin(null)} 
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRManagement; 