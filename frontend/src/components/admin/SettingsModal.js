import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const SettingsModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        school_name: '',
        school_motto: '',
        school_address: '',
        school_phone: '',
        school_email: '',
        registrar_name: '',
        registrar_title: '',
        form_amount: '',
        currency: 'NGN',
        paystack_public_key: '',
        paystack_secret_key: '',
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

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/settings');
            const settings = response.data;
            
            setFormData({
                school_name: settings.school_name || '',
                school_motto: settings.school_motto || '',
                school_address: settings.school_address || '',
                school_phone: settings.school_phone || '',
                school_email: settings.school_email || '',
                registrar_name: settings.registrar_name || '',
                registrar_title: settings.registrar_title || '',
                form_amount: settings.form_amount || '',
                currency: settings.currency || 'NGN',
                paystack_public_key: settings.paystack_public_key || '',
                paystack_secret_key: settings.paystack_secret_key || '',
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

            alert('Settings updated successfully!');
            onClose();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Error updating settings. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (fileType) => {
        setFiles(prev => ({ ...prev, [fileType]: null }));
        setPreviews(prev => ({ ...prev, [fileType]: '' }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">School Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {loading && !formData.school_name ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* School Information */}
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
                                    School Motto
                                </label>
                                <input
                                    type="text"
                                    name="school_motto"
                                    value={formData.school_motto}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.school_motto ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Excellence in Education"
                                />
                                {errors.school_motto && (
                                    <p className="text-red-500 text-sm mt-1">{errors.school_motto}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Address
                                </label>
                                <textarea
                                    name="school_address"
                                    value={formData.school_address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.school_address ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="University Address, City, State"
                                />
                                {errors.school_address && (
                                    <p className="text-red-500 text-sm mt-1">{errors.school_address}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Phone
                                </label>
                                <input
                                    type="text"
                                    name="school_phone"
                                    value={formData.school_phone}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.school_phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="+234 XXX XXX XXXX"
                                />
                                {errors.school_phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.school_phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Email
                                </label>
                                <input
                                    type="email"
                                    name="school_email"
                                    value={formData.school_email}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.school_email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="info@university.edu.ng"
                                />
                                {errors.school_email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.school_email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Registrar Name
                                </label>
                                <input
                                    type="text"
                                    name="registrar_name"
                                    value={formData.registrar_name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.registrar_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Registrar"
                                />
                                {errors.registrar_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.registrar_name}</p>
                                )}
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
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.registrar_title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Registrar"
                                />
                                {errors.registrar_title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.registrar_title}</p>
                                )}
                            </div>

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

                        {/* Logo Uploads */}
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

                        {/* Payment Settings */}
                        <div className="border-t pt-6">
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
                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SettingsModal; 