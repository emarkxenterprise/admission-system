import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ExportOptions from '../ExportOptions';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    type: 'undergraduate',
    duration_years: 4,
    duration_semesters: 8,
    tuition_fee: '',
    acceptance_fee: '',
    use_default_form_fee: true,
    form_fee: '',
    department_id: '',
    is_active: true,
    application_start_date: '',
    application_end_date: ''
  });

  // Table reference for export
  const tableRef = useRef(null);

  // Define columns for export
  const exportColumns = [
    { key: 'name', header: 'Program Name' },
    { key: 'code', header: 'Program Code' },
    { key: 'type', header: 'Program Type' },
    { key: 'department', header: 'Department' },
    { key: 'faculty', header: 'Faculty' },
    { key: 'duration', header: 'Duration' },
    { key: 'tuition_fee', header: 'Tuition Fee' },
    { key: 'acceptance_fee', header: 'Acceptance Fee' },
    { key: 'form_fee', header: 'Form Fee' },
    { key: 'status', header: 'Status' },
    { key: 'created_at', header: 'Created Date' }
  ];

  // Prepare data for export
  const exportData = programs.map(program => ({
    name: program.name || 'N/A',
    code: program.code || 'N/A',
    type: program.type_label || 'N/A',
    department: program.department ? program.department.name : 'N/A',
    faculty: program.department && program.department.faculty ? program.department.faculty.name : 'N/A',
    duration: `${program.duration_years} years (${program.duration_semesters} semesters)`,
    tuition_fee: program.tuition_fee ? `₦${parseFloat(program.tuition_fee).toLocaleString()}` : 'N/A',
    acceptance_fee: program.acceptance_fee ? `₦${parseFloat(program.acceptance_fee).toLocaleString()}` : 'N/A',
    form_fee: program.use_default_form_fee ? 'Default' : (program.form_fee ? `₦${parseFloat(program.form_fee).toLocaleString()}` : 'N/A'),
    status: program.is_active ? 'Active' : 'Inactive',
    created_at: program.created_at ? new Date(program.created_at).toLocaleDateString() : 'N/A'
  }));

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/admin/programs');
      setPrograms(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/admin/departments');
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProgram) {
        await api.put(`/admin/programs/${editingProgram.id}`, formData);
        toast.success('Program updated successfully');
      } else {
        await api.post('/admin/programs', formData);
        toast.success('Program created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchPrograms();
    } catch (error) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach(errors => {
          errors.forEach(error => toast.error(error));
        });
      } else {
        toast.error(editingProgram ? 'Failed to update program' : 'Failed to create program');
      }
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      code: program.code,
      description: program.description || '',
      type: program.type,
      duration_years: program.duration_years,
      duration_semesters: program.duration_semesters,
      tuition_fee: program.tuition_fee || '',
      acceptance_fee: program.acceptance_fee || '',
      use_default_form_fee: program.use_default_form_fee,
      form_fee: program.form_fee || '',
      department_id: program.department_id,
      is_active: program.is_active,
      application_start_date: program.application_start_date || '',
      application_end_date: program.application_end_date || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await api.delete(`/admin/programs/${id}`);
        toast.success('Program deleted successfully');
        fetchPrograms();
      } catch (error) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Failed to delete program');
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      type: 'undergraduate',
      duration_years: 4,
      duration_semesters: 8,
      tuition_fee: '',
      acceptance_fee: '',
      use_default_form_fee: true,
      form_fee: '',
      department_id: '',
      is_active: true,
      application_start_date: '',
      application_end_date: ''
    });
    setEditingProgram(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'undergraduate': return 'bg-blue-100 text-blue-800';
      case 'postgraduate': return 'bg-purple-100 text-purple-800';
      case 'national_diploma': return 'bg-green-100 text-green-800';
      case 'higher_national_diploma': return 'bg-yellow-100 text-yellow-800';
      case 'certificate': return 'bg-gray-100 text-gray-800';
      case 'diploma': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex justify-end items-center mb-6">
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Program
          </button>
        </div>

        {/* Export Options */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-sm text-gray-600">
            {programs.length} program(s) found
          </div>
          <ExportOptions
            data={exportData}
            filename="programs"
            tableRef={tableRef}
            columns={exportColumns}
            title="Programs Report"
          />
        </div>

        {/* Programs Table */}
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fees
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form Fee
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application Period
                </th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {program.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {program.code}
                      </div>
                      {/* Mobile-only info */}
                      <div className="md:hidden mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeColor(program.type)}`}>
                            {program.type_label}
                          </span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${program.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {program.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {program.department?.name || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeColor(program.type)}`}>
                      {program.type_label}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {program.department?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {program.department?.faculty?.name || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="hidden xl:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {program.duration_years} years ({program.duration_semesters} semesters)
                  </td>
                  <td className="hidden xl:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>Tuition: {formatCurrency(program.tuition_fee)}</div>
                      <div>Acceptance: {formatCurrency(program.acceptance_fee)}</div>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {program.use_default_form_fee ? (
                      <span className="text-blue-600 font-medium">Default</span>
                    ) : (
                      formatCurrency(program.form_fee)
                    )}
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {program.application_start_date && program.application_end_date ? (
                      `${new Date(program.application_start_date).toLocaleDateString()} - ${new Date(program.application_end_date).toLocaleDateString()}`
                    ) : (
                      'Anytime'
                    )}
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${program.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {program.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(program)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {programs.length === 0 && (
          <div className="text-center py-8 px-4">
            <p className="text-gray-500">No programs found. Create your first program to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {editingProgram ? 'Edit Program' : 'Add New Program'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Program Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Program Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="national_diploma">National Diploma (ND)</option>
                    <option value="higher_national_diploma">Higher National Diploma (HND)</option>
                    <option value="certificate">Certificate</option>
                    <option value="diploma">Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Department *</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.faculty?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (Years) *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.duration_years}
                    onChange={(e) => setFormData({...formData, duration_years: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (Semesters) *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.duration_semesters}
                    onChange={(e) => setFormData({...formData, duration_semesters: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tuition Fee (₦)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tuition_fee}
                    onChange={(e) => setFormData({...formData, tuition_fee: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Acceptance Fee (₦)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.acceptance_fee}
                    onChange={(e) => setFormData({...formData, acceptance_fee: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="use_default_form_fee"
                      checked={formData.use_default_form_fee}
                      onChange={(e) => setFormData({...formData, use_default_form_fee: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="use_default_form_fee" className="ml-2 block text-sm text-gray-900">
                      Use default form fee from settings
                    </label>
                  </div>
                </div>

                {!formData.use_default_form_fee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Form Fee (₦) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.form_fee}
                      onChange={(e) => setFormData({...formData, form_fee: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required={!formData.use_default_form_fee}
                    />
                  </div>
                )}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Application Start Date</label>
                  <input
                    type="date"
                    value={formData.application_start_date}
                    onChange={(e) => setFormData({...formData, application_start_date: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty to allow applications anytime</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Application End Date</label>
                  <input
                    type="date"
                    value={formData.application_end_date}
                    onChange={(e) => setFormData({...formData, application_end_date: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty to allow applications anytime</p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingProgram ? 'Update Program' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManagement; 