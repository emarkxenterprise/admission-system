import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../services/api';

// Universal error message helper
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

const ApplicationForm = ({ editMode = false }) => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formFee, setFormFee] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [selectedDepartmentIndex, setSelectedDepartmentIndex] = useState(-1);
  const [isApplicationPeriodActive, setIsApplicationPeriodActive] = useState(true);
  const [academicBackgrounds, setAcademicBackgrounds] = useState([
    { school_name: '', qualification: '', graduation_year: '', cgpa: '', certificate_file: null }
  ]);
  const [jambRegistrationNumber, setJambRegistrationNumber] = useState('');
  const [jambYear, setJambYear] = useState('');
  const [jambScore, setJambScore] = useState('');
  const [isFirstChoice, setIsFirstChoice] = useState(false);
  const departmentDropdownRef = useRef(null);
  const formValuesRef = useRef({});
  const navigate = useNavigate();
  const { id } = useParams();

  // Functions to handle academic backgrounds
  const addAcademicBackground = () => {
    setAcademicBackgrounds([
      ...academicBackgrounds,
      { school_name: '', qualification: '', graduation_year: '', cgpa: '', certificate_file: null }
    ]);
  };

  const removeAcademicBackground = (index) => {
    if (academicBackgrounds.length > 1) {
      const newBackgrounds = academicBackgrounds.filter((_, i) => i !== index);
      setAcademicBackgrounds(newBackgrounds);
    }
  };

  const updateAcademicBackground = (index, field, value) => {
    const newBackgrounds = [...academicBackgrounds];
    newBackgrounds[index][field] = value;
    setAcademicBackgrounds(newBackgrounds);
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      admission_session_id: '',
      department_id: '',
      program_id: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      email: '',
      nationality: '',
      state_of_origin: '',
      local_government: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      previous_school: '',
      previous_qualification: '',
      graduation_year: '',
      cgpa: '',
      transcript: null,
      certificate: null,
      id_card: null,
      passport: null,
    }
  });

  const steps = [
    { id: 1, title: 'Academic Information', description: 'Select session and department' },
    { id: 2, title: 'Personal & Contact Information', description: 'Personal details, contact info, and emergency contact' },
    { id: 3, title: 'Academic Background', description: 'Previous education details' },
    { id: 4, title: 'Documents Upload', description: 'Upload required documents' },
  ];

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/applications/${id}`);
      const app = response.data.data.application;
      const editableFields = [
        'admission_session_id', 'department_id', 'first_name', 'last_name', 'middle_name',
        'date_of_birth', 'gender', 'nationality', 'state_of_origin', 'local_government',
        'address', 'phone', 'email', 'emergency_contact_name', 'emergency_contact_phone',
        'emergency_contact_relationship', 'previous_school', 'previous_qualification',
        'graduation_year', 'cgpa'
      ];
      const editableData = {};
      editableFields.forEach((key) => {
        if (app[key] !== null && app[key] !== undefined) {
          editableData[key] = app[key];
        }
      });
      reset(editableData);
      
             // Set department search field for editing
       if (app.department) {
         const facultyName = app.department.faculty ? app.department.faculty.name : '';
         setDepartmentSearch(`${app.department.name} (${app.department.code})${facultyName ? ` - ${facultyName}` : ''}`);
       }

       // Set JAMB information for editing
       setJambRegistrationNumber(app.jamb_registration_number || '');
       setJambYear(app.jamb_year || '');
       setJambScore(app.jamb_score || '');
       setIsFirstChoice(app.is_first_choice || false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load application for editing'));
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchFormData();
    if (editMode && id) {
      fetchApplication();
    }
  }, [editMode, id, fetchApplication]);

  const fetchFormData = async () => {
    try {
      const [sessionsResponse, departmentsResponse] = await Promise.all([
        api.get('/sessions'),
        api.get('/departments'),
      ]);

      // Add safety checks for the response data
      const sessionsData = sessionsResponse?.data?.data?.sessions || [];
      const departmentsData = departmentsResponse?.data?.data?.departments || [];
      const facultiesData = departmentsResponse?.data?.data?.faculties || [];

      setSessions(sessionsData);
      setDepartments(departmentsData);
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error(getErrorMessage(error, 'Failed to load form data'));
      // Set empty arrays as fallback to prevent undefined errors
      setSessions([]);
      setDepartments([]);
    }
  };

  const fetchPrograms = async (departmentId) => {
    try {
      const response = await api.get(`/departments/${departmentId}/programs`);
      setPrograms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setPrograms([]);
    }
  };

  const fetchProgramFormFee = async (programId) => {
    try {
      const response = await api.get(`/programs/${programId}/form-fee`);
      setFormFee(response.data.data.form_fee);
      setSelectedProgram(response.data.data.program);
      setIsApplicationPeriodActive(response.data.data.program.application_period_active !== false);
    } catch (error) {
      console.error('Error fetching program form fee:', error);
      setFormFee(0);
      setIsApplicationPeriodActive(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      const editableFields = [
        'admission_session_id', 'department_id', 'program_id', 'first_name', 'last_name', 'middle_name',
        'date_of_birth', 'gender', 'nationality', 'state_of_origin', 'local_government',
        'address', 'phone', 'email', 'emergency_contact_name', 'emergency_contact_phone',
        'emergency_contact_relationship', 'previous_school', 'previous_qualification',
        'graduation_year', 'cgpa'
      ];
      editableFields.forEach((key) => {
        if (data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

             // Handle academic backgrounds
       academicBackgrounds.forEach((background, index) => {
         formData.append(`academic_backgrounds[${index}][school_name]`, background.school_name || '');
         formData.append(`academic_backgrounds[${index}][qualification]`, background.qualification || '');
         formData.append(`academic_backgrounds[${index}][graduation_year]`, background.graduation_year || '');
         formData.append(`academic_backgrounds[${index}][cgpa]`, background.cgpa || '');
         
         // Handle certificate file uploads
         if (background.certificate_file && background.certificate_file instanceof File) {
           formData.append(`academic_backgrounds[${index}][certificate_file]`, background.certificate_file);
         }
       });

       // Handle JAMB information
               formData.append('jamb_registration_number', jambRegistrationNumber);
        formData.append('jamb_year', jambYear);
        formData.append('jamb_score', jambScore);
        formData.append('is_first_choice', isFirstChoice ? 1 : 0);

      ['transcript', 'certificate', 'id_card', 'passport'].forEach((fileKey) => {
        if (data[fileKey] instanceof FileList && data[fileKey].length > 0) {
          formData.append(fileKey, data[fileKey][0]);
        }
      });
      if (editMode && id) {
        // Use PUT method directly for editing
        await api.put(`/applications/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Application updated successfully!');
      } else {
        await api.post('/applications', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Application submitted successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to submit application'));
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async (e) => {
    // Prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    let isValid = true;
    
    // For step 3 (Academic Background), validate academic backgrounds array
    if (currentStep === 3) {
      // Validate academic backgrounds
      let hasValidAcademic = false;
      for (const background of academicBackgrounds) {
        if (background.school_name && background.qualification && background.graduation_year) {
          hasValidAcademic = true;
          break;
        }
      }
      
      if (!hasValidAcademic) {
        toast.error('Please fill in at least one complete academic background (school name, qualification, and graduation year).');
        isValid = false;
      }
    } else {
      // For other steps, use regular validation
      const fieldsToValidate = getFieldsForStep(currentStep);
      isValid = await trigger(fieldsToValidate);
    }
    
    if (isValid) {
      // Check if application period is active for step 1 (program selection)
      if (currentStep === 1 && !isApplicationPeriodActive) {
        toast.error('Applications for this program are currently closed. Please select a different program or try again later.');
        return;
      }
      
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else if (currentStep !== 3) {
      toast.error('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Watch form values to ensure they persist
  const watchedValues = watch();
  
  // Store form values in ref to maintain them across steps
  useEffect(() => {
    formValuesRef.current = watchedValues;
  }, [watchedValues]);

  // Filter departments based on search query
  useEffect(() => {
    if (!departments.length && !faculties.length) return;

    let allDepartments = [];
    
    // If faculties exist, flatten departments from all faculties
    if (faculties.length > 0) {
      faculties.forEach(faculty => {
        if (faculty.departments && faculty.departments.length > 0) {
          faculty.departments.forEach(dept => {
            allDepartments.push({
              ...dept,
              faculty_name: faculty.name
            });
          });
        }
      });
    } else if (departments.length > 0) {
      // If no faculties, use departments directly
      allDepartments = departments.map(dept => ({
        ...dept,
        faculty_name: dept.faculty?.name || 'General'
      }));
    }

    // Filter departments based on search query
    if (departmentSearch.trim() === '') {
      setFilteredDepartments(allDepartments);
    } else {
      const searchLower = departmentSearch.toLowerCase();
      const filtered = allDepartments.filter(dept => 
        dept.name.toLowerCase().includes(searchLower) ||
        dept.code.toLowerCase().includes(searchLower) ||
        (dept.faculty_name && dept.faculty_name.toLowerCase().includes(searchLower))
      );
      setFilteredDepartments(filtered);
    }
  }, [departmentSearch, departments, faculties]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
        setSelectedDepartmentIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle department selection
  const handleDepartmentSelect = (department) => {
    setValue('department_id', department.id);
    setDepartmentSearch(`${department.name} (${department.code})${department.faculty_name ? ` - ${department.faculty_name}` : ''}`);
    setShowDepartmentDropdown(false);
    setSelectedDepartmentIndex(-1);
    // Fetch programs for selected department
    fetchPrograms(department.id);
    // Reset program selection
    setValue('program_id', '');
    setSelectedProgram(null);
    setFormFee(0);
    setIsApplicationPeriodActive(true); // Reset active status
  };

  // Handle department search input change
  const handleDepartmentSearchChange = (e) => {
    const value = e.target.value;
    setDepartmentSearch(value);
    setShowDepartmentDropdown(true);
    setSelectedDepartmentIndex(-1);
    
    // Clear department_id if search is cleared
    if (!value.trim()) {
      setValue('department_id', '');
    }
  };

  // Handle keyboard navigation
  const handleDepartmentKeyDown = (e) => {
    if (!showDepartmentDropdown || filteredDepartments.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedDepartmentIndex(prev => 
          prev < filteredDepartments.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedDepartmentIndex(prev => 
          prev > 0 ? prev - 1 : filteredDepartments.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedDepartmentIndex >= 0 && selectedDepartmentIndex < filteredDepartments.length) {
          handleDepartmentSelect(filteredDepartments[selectedDepartmentIndex]);
        }
        break;
      case 'Escape':
        setShowDepartmentDropdown(false);
        setSelectedDepartmentIndex(-1);
        break;
      default:
        break;
    }
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1:
        return ['admission_session_id', 'department_id', 'program_id'];
      case 2:
        return ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone', 'email', 'nationality', 'state_of_origin', 'local_government', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
      case 3:
        return ['previous_school', 'previous_qualification', 'graduation_year'];
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admission Session
                </label>
                <select
                  {...register('admission_session_id', { required: 'Please select a session' })}
                  className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm appearance-none bg-white ${
                    errors.admission_session_id 
                      ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                  }`}
                >
                  <option value="">Select Session</option>
                  {sessions && sessions.length > 0 ? sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name}
                    </option>
                  )) : (
                    <option value="" disabled>No sessions available</option>
                  )}
                </select>
                {errors.admission_session_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.admission_session_id.message}</p>
                )}
              </div>

              <div className="relative" ref={departmentDropdownRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department/Course
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={departmentSearch}
                    onChange={handleDepartmentSearchChange}
                    onKeyDown={handleDepartmentKeyDown}
                    onFocus={() => setShowDepartmentDropdown(true)}
                    placeholder="Search for department or course..."
                    className={`mt-1 block w-full pl-10 pr-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.department_id 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <input
                  type="hidden"
                  {...register('department_id', { required: 'Please select a department' })}
                />
                
                {/* Searchable Dropdown */}
                {showDepartmentDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dept, index) => (
                        <div
                          key={dept.id}
                          onClick={() => handleDepartmentSelect(dept)}
                          className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            index === selectedDepartmentIndex 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{dept.name} ({dept.code})</div>
                          {dept.faculty_name && (
                            <div className="text-sm text-gray-600">{dept.faculty_name}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        {departmentSearch.trim() 
                          ? 'No departments found matching your search' 
                          : departments.length === 0 && faculties.length === 0
                            ? 'No departments available'
                            : 'Type to search departments...'
                        }
                      </div>
                    )}
                  </div>
                )}
                
                {errors.department_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Program
                </label>
                <select
                  {...register('program_id', { required: 'Please select a program' })}
                  onChange={(e) => {
                    const programId = e.target.value;
                    if (programId) {
                      fetchProgramFormFee(programId);
                    } else {
                      setSelectedProgram(null);
                      setFormFee(0);
                      setIsApplicationPeriodActive(true);
                    }
                  }}
                  className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm appearance-none bg-white ${
                    errors.program_id 
                      ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                  }`}
                >
                  <option value="">Select Program</option>
                  {programs.map((program) => (
                    <option 
                      key={program.id} 
                      value={program.id}
                      disabled={!program.application_period_active}
                    >
                      {program.name} ({program.type_label}) - {program.application_period_active ? 'Open' : 'Closed'}
                    </option>
                  ))}
                </select>
                {errors.program_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.program_id.message}</p>
                )}
                {selectedProgram && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <div className="font-medium">Program Details:</div>
                      <div>Duration: {selectedProgram.duration_years} years ({selectedProgram.duration_semesters} semesters)</div>
                      <div>Form Fee: ₦{formFee.toLocaleString()}</div>
                      {selectedProgram.tuition_fee && (
                        <div>Tuition Fee: ₦{parseFloat(selectedProgram.tuition_fee).toLocaleString()}</div>
                      )}
                      {selectedProgram.acceptance_fee && (
                        <div>Acceptance Fee: ₦{parseFloat(selectedProgram.acceptance_fee).toLocaleString()}</div>
                      )}
                      <div className={`mt-2 font-medium ${isApplicationPeriodActive ? 'text-green-600' : 'text-red-600'}`}>
                        {isApplicationPeriodActive ? (
                          <span>✓ {selectedProgram.application_period_status || 'Application Period Active'}</span>
                        ) : (
                          <span>✗ {selectedProgram.application_period_status || 'Application Period Closed'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    {...register('first_name', { required: 'First name is required' })}
                    type="text"
                    placeholder="Enter your first name"
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.first_name 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                  <input
                    {...register('middle_name')}
                    type="text"
                    placeholder="Enter your middle name (optional)"
                    className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300 focus:bg-white sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    {...register('last_name', { required: 'Last name is required' })}
                    type="text"
                    placeholder="Enter your last name"
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.last_name 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    {...register('date_of_birth', { required: 'Date of birth is required' })}
                    type="date"
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.date_of_birth 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  {errors.date_of_birth && (
                    <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    {...register('gender', { required: 'Please select gender' })}
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm appearance-none bg-white ${
                      errors.gender 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    {...register('phone', { required: 'Phone number is required' })}
                    type="tel"
                    placeholder="Enter your phone number"
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.phone 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    placeholder="Enter your email address"
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.email 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nationality</label>
                  <input
                    {...register('nationality', { required: 'Nationality is required' })}
                    type="text"
                    placeholder="Enter your nationality"
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.nationality 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  {errors.nationality && (
                    <p className="mt-1 text-sm text-red-600">{errors.nationality.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State of Origin</label>
                  <input
                    {...register('state_of_origin', { required: 'State of origin is required' })}
                    type="text"
                    placeholder="Enter your state of origin"
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.state_of_origin 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  {errors.state_of_origin && (
                    <p className="mt-1 text-sm text-red-600">{errors.state_of_origin.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Local Government</label>
                  <input
                    {...register('local_government', { required: 'Local government is required' })}
                    type="text"
                    placeholder="Enter your local government"
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.local_government 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  {errors.local_government && (
                    <p className="mt-1 text-sm text-red-600">{errors.local_government.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  {...register('address', { required: 'Address is required' })}
                  rows={3}
                  placeholder="Enter your complete address"
                  className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm resize-none ${
                    errors.address 
                      ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Emergency Contact (Next of Kin)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    {...register('emergency_contact_name', { required: 'Contact name is required' })}
                    type="text"
                    placeholder="Enter emergency contact name"
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.emergency_contact_name 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  {errors.emergency_contact_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    {...register('emergency_contact_phone', { required: 'Contact phone is required' })}
                    type="tel"
                    placeholder="Enter emergency contact phone"
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.emergency_contact_phone 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  {errors.emergency_contact_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship</label>
                  <input
                    {...register('emergency_contact_relationship', { required: 'Relationship is required' })}
                    type="text"
                    placeholder="e.g., Father, Mother, Guardian"
                    className={`mt-1 block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm ${
                      errors.emergency_contact_relationship 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 hover:border-gray-300 focus:bg-white'
                    }`}
                  />
                  {errors.emergency_contact_relationship && (
                    <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_relationship.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

             case 3:
         return (
           <div className="bg-white shadow rounded-lg p-6">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Academic Background</h2>
               <button
                 type="button"
                 onClick={addAcademicBackground}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 Add More Academic Info
               </button>
             </div>

             {/* JAMB Information Section */}
             <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
               <h3 className="text-lg font-semibold text-blue-900 mb-4">JAMB Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">JAMB Registration Number</label>
                   <input
                     type="text"
                     value={jambRegistrationNumber}
                     onChange={(e) => setJambRegistrationNumber(e.target.value)}
                     placeholder="Enter JAMB registration number"
                     className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300 focus:bg-white sm:text-sm"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700">JAMB Year</label>
                   <input
                     type="number"
                     value={jambYear}
                     onChange={(e) => setJambYear(e.target.value)}
                     placeholder="e.g., 2024"
                     min="2000"
                     max={new Date().getFullYear() + 1}
                     className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300 focus:bg-white sm:text-sm"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700">JAMB Score</label>
                   <input
                     type="number"
                     value={jambScore}
                     onChange={(e) => setJambScore(e.target.value)}
                     placeholder="Enter JAMB score"
                     min="0"
                     max="400"
                     className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300 focus:bg-white sm:text-sm"
                   />
                 </div>

                 <div className="flex items-center">
                   <div className="flex items-center h-12">
                     <input
                       type="checkbox"
                       id="isFirstChoice"
                       checked={isFirstChoice}
                       onChange={(e) => setIsFirstChoice(e.target.checked)}
                       className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                     />
                     <label htmlFor="isFirstChoice" className="ml-2 block text-sm font-medium text-gray-700">
                       This school is my first choice
                     </label>
                   </div>
                 </div>
               </div>
             </div>
            
            {academicBackgrounds.map((background, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Academic Record {index + 1}
                  </h3>
                  {academicBackgrounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAcademicBackground(index)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">School Name</label>
                    <input
                      type="text"
                      value={background.school_name}
                      onChange={(e) => updateAcademicBackground(index, 'school_name', e.target.value)}
                      placeholder="Enter school name"
                      className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300 focus:bg-white sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Qualification</label>
                    <input
                      type="text"
                      value={background.qualification}
                      onChange={(e) => updateAcademicBackground(index, 'qualification', e.target.value)}
                      placeholder="e.g., WAEC, NECO, GCE, BSc, MSc"
                      className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300 focus:bg-white sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                    <input
                      type="number"
                      value={background.graduation_year}
                      onChange={(e) => updateAcademicBackground(index, 'graduation_year', e.target.value)}
                      placeholder="Enter graduation year"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300 focus:bg-white sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">CGPA/Grade (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={background.cgpa}
                      onChange={(e) => updateAcademicBackground(index, 'cgpa', e.target.value)}
                      placeholder="Enter CGPA or grade"
                      min="0"
                      max="5"
                      className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300 focus:bg-white sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Certificate Upload (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => updateAcademicBackground(index, 'certificate_file', e.target.files[0])}
                    className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Upload certificate for this qualification (PDF, JPG, PNG)</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Upload Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">State of Origin Certificate (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  {...register('transcript')}
                  className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Certificate of Birth (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  {...register('certificate')}
                  className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ID Card (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  {...register('id_card')}
                  className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Passport Photograph</label>
              <input
                type="file"
                accept="image/*"
                {...register('passport')}
                className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admission Application</h1>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-lg font-medium text-gray-900">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-sm text-gray-500">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          onKeyDown={(e) => {
            if (e.key === 'Enter' && currentStep < steps.length) {
              e.preventDefault();
              nextStep(e);
            }
          }}
          className="space-y-8"
        >

          
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentStep === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={(e) => nextStep(e)}
                  disabled={currentStep === 1 && !isApplicationPeriodActive}
                  className={`px-6 py-2 rounded-md text-sm font-medium ${
                    currentStep === 1 && !isApplicationPeriodActive
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm; 