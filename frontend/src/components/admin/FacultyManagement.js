import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import api from '../../services/api';
import ExportOptions from '../ExportOptions';

const FacultyManagement = () => {
  const navigate = useNavigate();
  const { hasAnyPermission } = useStaffAuth();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true
  });

  // Table reference for export
  const tableRef = useRef(null);

  // Define columns for export
  const exportColumns = [
    { key: 'name', header: 'Faculty Name' },
    { key: 'code', header: 'Faculty Code' },
    { key: 'description', header: 'Description' },
    { key: 'departments_count', header: 'Departments' },
    { key: 'status', header: 'Status' },
    { key: 'created_at', header: 'Created Date' }
  ];

  // Prepare data for export
  const exportData = faculties.map(faculty => ({
    name: faculty.name || 'N/A',
    code: faculty.code || 'N/A',
    description: faculty.description || 'N/A',
    departments_count: faculty.departments ? faculty.departments.length : 0,
    status: faculty.is_active ? 'Active' : 'Inactive',
    created_at: faculty.created_at ? new Date(faculty.created_at).toLocaleDateString() : 'N/A'
  }));

  useEffect(() => {
    // Check permissions on component mount
    if (!hasAnyPermission(['view-faculties', 'manage-faculties'])) {
      toast.error('You do not have permission to access Faculty Management');
      navigate('/admin');
      return;
    }
    
    fetchFaculties();
  }, [hasAnyPermission, navigate]);

  const fetchFaculties = async () => {
    try {
      const response = await api.get('/admin/faculties');
      setFaculties(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load faculties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check manage permission before creating/updating
    if (!hasAnyPermission(['manage-faculties'])) {
      toast.error('You do not have permission to manage faculties');
      return;
    }
    
    try {
      if (editingFaculty) {
        await api.put(`/admin/faculties/${editingFaculty.id}`, formData);
        toast.success('Faculty updated successfully');
      } else {
        await api.post('/admin/faculties', formData);
        toast.success('Faculty created successfully');
      }
      
      setShowModal(false);
      setEditingFaculty(null);
      resetForm();
      fetchFaculties();
    } catch (error) {
      toast.error('Failed to save faculty');
    }
  };

  const handleEdit = (faculty) => {
    // Check manage permission before editing
    if (!hasAnyPermission(['manage-faculties'])) {
      toast.error('You do not have permission to edit faculties');
      return;
    }
    
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      code: faculty.code,
      description: faculty.description || '',
      is_active: faculty.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    // Check manage permission before deleting
    if (!hasAnyPermission(['manage-faculties'])) {
      toast.error('You do not have permission to delete faculties');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this faculty?')) {
      return;
    }

    try {
      await api.delete(`/admin/faculties/${id}`);
      toast.success('Faculty deleted successfully');
      fetchFaculties();
    } catch (error) {
      toast.error('Failed to delete faculty');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      is_active: true
    });
  };

  const openModal = () => {
    // Check manage permission before opening create modal
    if (!hasAnyPermission(['manage-faculties'])) {
      toast.error('You do not have permission to create faculties');
      return;
    }
    
    setEditingFaculty(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFaculty(null);
    resetForm();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-end items-center mb-6">
            <div className="flex gap-2">
              <ExportOptions 
                data={exportData}
                columns={exportColumns}
                filename="faculties"
                tableRef={tableRef}
              />
              {/* Only show Add button if user has manage permission */}
              {hasAnyPermission(['manage-faculties']) && (
                <button
                  onClick={openModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Faculty
                </button>
              )}
            </div>
          </div>

          {/* Faculty Table */}
          <div className="overflow-x-auto" ref={tableRef}>
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  {/* Only show Actions column if user has manage permission */}
                  {hasAnyPermission(['manage-faculties']) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {faculties.map((faculty) => (
                  <tr key={faculty.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{faculty.name}</div>
                      {faculty.description && (
                        <div className="text-sm text-gray-500">{faculty.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{faculty.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {faculty.departments ? faculty.departments.length : 0} departments
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        faculty.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {faculty.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* Only show Actions if user has manage permission */}
                    {hasAnyPermission(['manage-faculties']) && (
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(faculty)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(faculty.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Faculty Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Faculty Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  maxLength="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {editingFaculty ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement; 