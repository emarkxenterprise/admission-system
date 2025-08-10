import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState({
        school_name: '',
        form_amount: '',
        currency: 'NGN',
        paystack_public_key: '',
        paystack_secret_key: '',
        school_address: '',
        school_phone: '',
        school_email: '',
        school_website: '',
        school_motto: '',
        school_established_year: '',
        school_type: 'university',
        school_accreditation: '',
        registrar_name: '',
        registrar_title: '',
    });
    const [files, setFiles] = useState({
        print_logo: null,
        admin_logo: null,
    });
    const [previews, setPreviews] = useState({
        print_logo: '',
        admin_logo: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/settings');
            const settings = response.data;
            
            setFormData({
                school_name: settings.school_name || '',
                form_amount: settings.form_amount || '',
                currency: settings.currency || 'NGN',
                paystack_public_key: settings.paystack_public_key || '',
                paystack_secret_key: settings.paystack_secret_key || '',
                school_address: settings.school_address || '',
                school_phone: settings.school_phone || '',
                school_email: settings.school_email || '',
                school_website: settings.school_website || '',
                school_motto: settings.school_motto || '',
                school_established_year: settings.school_established_year || '',
                school_type: settings.school_type || 'university',
                school_accreditation: settings.school_accreditation || '',
                registrar_name: settings.registrar_name || '',
                registrar_title: settings.registrar_title || '',
            });

            // Set previews for existing logos
            if (settings.print_logo) {
                setPreviews(prev => ({ ...prev, print_logo: `/storage/${settings.print_logo}` }));
            }
            if (settings.admin_logo) {
                setPreviews(prev => ({ ...prev, admin_logo: `/storage/${settings.admin_logo}` }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files: fileList } = e.target;
        const file = fileList[0];
        
        if (file) {
            setFiles(prev => ({ ...prev, [name]: file }));
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews(prev => ({ ...prev, [name]: e.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSaveStatus('');

        try {
            const formDataToSend = new FormData();
            
            // Add form fields
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });
            
            // Add files if selected
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    formDataToSend.append(key, files[key]);
                }
            });

            await api.post('/admin/settings', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSaveStatus('success');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setSaveStatus('error');
            }
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (fileType) => {
        setFiles(prev => ({ ...prev, [fileType]: null }));
        setPreviews(prev => ({ ...prev, [fileType]: '' }));
    };

    const renderGeneralSettings = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Information */}
            <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">School Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            School Name *
                        </label>
                        <input
                            type="text"
                            name="school_name"
                            value={formData.school_name}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.school_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter school name"
                        />
                        {errors.school_name && (
                            <p className="text-red-500 text-sm mt-1">{errors.school_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            School Type
                        </label>
                        <select
                            name="school_type"
                            value={formData.school_type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="university">University</option>
                            <option value="polytechnic">Polytechnic</option>
                            <option value="college">College</option>
                            <option value="institute">Institute</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            School Motto
                        </label>
                        <input
                            type="text"
                            name="school_motto"
                            value={formData.school_motto}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter school motto"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Established Year
                        </label>
                        <input
                            type="number"
                            name="school_established_year"
                            value={formData.school_established_year}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 1990"
                            min="1900"
                            max="2030"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            School Address *
                        </label>
                        <textarea
                            name="school_address"
                            value={formData.school_address}
                            onChange={handleInputChange}
                            rows="3"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.school_address ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter complete school address"
                        />
                        {errors.school_address && (
                            <p className="text-red-500 text-sm mt-1">{errors.school_address}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            name="school_phone"
                            value={formData.school_phone}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.school_phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="+234 123 456 7890"
                        />
                        {errors.school_phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.school_phone}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="school_email"
                            value={formData.school_email}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.school_email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="info@school.edu.ng"
                        />
                        {errors.school_email && (
                            <p className="text-red-500 text-sm mt-1">{errors.school_email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website
                        </label>
                        <input
                            type="url"
                            name="school_website"
                            value={formData.school_website}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://www.school.edu.ng"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Accreditation
                        </label>
                        <input
                            type="text"
                            name="school_accreditation"
                            value={formData.school_accreditation}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., NUC, NBTE"
                        />
                    </div>
                </div>
            </div>

            {/* Registrar Information */}
            <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Registrar Name
                        </label>
                        <input
                            type="text"
                            name="registrar_name"
                            value={formData.registrar_name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter registrar's full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Registrar Title
                        </label>
                        <input
                            type="text"
                            name="registrar_title"
                            value={formData.registrar_title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Registrar, Deputy Registrar"
                        />
                    </div>
                </div>
            </div>

            {/* Payment Information */}
            <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Form Amount *
                        </label>
                        <input
                            type="number"
                            name="form_amount"
                            value={formData.form_amount}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.form_amount ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                        {errors.form_amount && (
                            <p className="text-red-500 text-sm mt-1">{errors.form_amount}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency *
                        </label>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="NGN">NGN - Nigerian Naira</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Logo Uploads */}
            <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Logo Uploads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Print Logo
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            {previews.print_logo ? (
                                <div className="relative">
                                    <img
                                        src={previews.print_logo}
                                        alt="Print logo preview"
                                        className="mx-auto max-h-32 object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile('print_logo')}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-1 text-sm text-gray-600">Click to upload print logo</p>
                                </div>
                            )}
                            <input
                                type="file"
                                name="print_logo"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                                id="print_logo"
                            />
                            <label htmlFor="print_logo" className="mt-2 cursor-pointer text-blue-600 hover:text-blue-500">
                                Choose file
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Logo
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            {previews.admin_logo ? (
                                <div className="relative">
                                    <img
                                        src={previews.admin_logo}
                                        alt="Admin logo preview"
                                        className="mx-auto max-h-32 object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile('admin_logo')}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-1 text-sm text-gray-600">Click to upload admin logo</p>
                                </div>
                            )}
                            <input
                                type="file"
                                name="admin_logo"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                                id="admin_logo"
                            />
                            <label htmlFor="admin_logo" className="mt-2 cursor-pointer text-blue-600 hover:text-blue-500">
                                Choose file
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Settings */}
            <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Paystack Public Key *
                        </label>
                        <input
                            type="text"
                            name="paystack_public_key"
                            value={formData.paystack_public_key}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.paystack_public_key ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="pk_test_..."
                        />
                        {errors.paystack_public_key && (
                            <p className="text-red-500 text-sm mt-1">{errors.paystack_public_key}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Paystack Secret Key *
                        </label>
                        <input
                            type="password"
                            name="paystack_secret_key"
                            value={formData.paystack_secret_key}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.paystack_secret_key ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="sk_test_..."
                        />
                        {errors.paystack_secret_key && (
                            <p className="text-red-500 text-sm mt-1">{errors.paystack_secret_key}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-6 border-t">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </form>
    );

    const renderAdmissionLetterSettings = () => (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Admission Letter Settings
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>Configure settings for admission letter generation and formatting. This feature is coming soon.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Letter Format Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Letter Header
                        </label>
                        <textarea
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the header text for admission letters..."
                            disabled
                        />
                        <p className="text-sm text-gray-500 mt-1">This will appear at the top of all admission letters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Letter Footer
                        </label>
                        <textarea
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the footer text for admission letters..."
                            disabled
                        />
                        <p className="text-sm text-gray-500 mt-1">This will appear at the bottom of all admission letters</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Letter Template
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                                <option>Standard Template</option>
                                <option>Custom Template 1</option>
                                <option>Custom Template 2</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Letter Format
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                                <option>A4 Portrait</option>
                                <option>A4 Landscape</option>
                                <option>Letter Size</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        disabled
                        className="px-6 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
                    >
                        Save Letter Settings (Coming Soon)
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">School Settings</h1>
                        {saveStatus === 'success' && (
                            <div className="text-green-600 font-medium">Settings saved successfully!</div>
                        )}
                        {saveStatus === 'error' && (
                            <div className="text-red-600 font-medium">Error saving settings. Please try again.</div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'general'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                General Settings
                            </button>
                            <button
                                onClick={() => setActiveTab('admission-letter')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'admission-letter'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Admission Letter Settings
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    {loading && !formData.school_name ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div>
                            {activeTab === 'general' && renderGeneralSettings()}
                            {activeTab === 'admission-letter' && renderAdmissionLetterSettings()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings; 