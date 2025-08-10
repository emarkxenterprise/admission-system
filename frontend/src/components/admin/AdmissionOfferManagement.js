import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from './layouts/ui/card';
import { Button } from './layouts/ui/button';
import { Input } from './layouts/ui/input';
import { Label } from './layouts/ui/label';

import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from './layouts/ui/table';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from './layouts/ui/dialog';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from './layouts/ui/alert-dialog';
import { Badge } from './layouts/ui/badge';
import { Textarea } from './layouts/ui/textarea';
import { useToast } from './layouts/ui/use-toast';
import api from '../../services/api';

const AdmissionOfferManagement = () => {
    const [admissionSessions, setAdmissionSessions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [admissionOffers, setAdmissionOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [uploadData, setUploadData] = useState({
        admission_session_id: '',
        department_id: '',
        acceptance_fee_amount: '',
        acceptance_deadline_days: '30',
        admitted_students: []
    });
    const [csvData, setCsvData] = useState('');
    const [editingOffer, setEditingOffer] = useState(null);
    const { toast } = useToast();
    const [useDefaultAcceptanceFee, setUseDefaultAcceptanceFee] = useState(false);
    const [defaultAcceptanceFee, setDefaultAcceptanceFee] = useState('');
    const [warnings, setWarnings] = useState([]);

    useEffect(() => {
        fetchAdmissionSessions();
        fetchDepartments();
        fetchAdmissionOffers();
        // Fetch default acceptance fee
        api.get('/admin/settings/acceptance-fee').then(res => {
            if (res.data && res.data.acceptance_fee) {
                setDefaultAcceptanceFee(res.data.acceptance_fee.toString());
            }
        });
    }, []);

    useEffect(() => {
        if (useDefaultAcceptanceFee && defaultAcceptanceFee) {
            setUploadData(prev => ({ ...prev, acceptance_fee_amount: defaultAcceptanceFee }));
        }
    }, [useDefaultAcceptanceFee, defaultAcceptanceFee]);

    const fetchAdmissionSessions = async () => {
        try {
            const response = await api.get('/admin/admission-sessions');
            const sessions = response.data.data || [];
            setAdmissionSessions(sessions);
        } catch (error) {
            console.error('Error fetching admission sessions:', error);
            toast({
                title: "Error",
                description: "Failed to fetch admission sessions",
                variant: "destructive",
            });
            
            // Fallback data for testing
            console.log('Using fallback admission sessions data');
            setAdmissionSessions([
                { id: 1, name: '2024/2025 Academic Year' },
                { id: 2, name: '2023/2024 Academic Year' }
            ]);
        }
    };

    const fetchDepartments = async () => {
        try {
            console.log('Fetching departments...');
            const response = await api.get('/admin/departments');
            console.log('Departments response:', response.data);
            const depts = response.data.data || [];
            console.log('Setting departments:', depts);
            setDepartments(depts);
        } catch (error) {
            console.error('Error fetching departments:', error);
            toast({
                title: "Error",
                description: "Failed to fetch departments",
                variant: "destructive",
            });
            
            // Fallback data for testing
            console.log('Using fallback departments data');
            setDepartments([
                { id: 1, name: 'Computer Science' },
                { id: 2, name: 'Electrical Engineering' },
                { id: 3, name: 'Mechanical Engineering' },
                { id: 4, name: 'Business Administration' }
            ]);
        }
    };

    const fetchAdmissionOffers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedSession) params.append('session_id', selectedSession);
            if (selectedDepartment) params.append('department_id', selectedDepartment);
            if (selectedStatus) params.append('status', selectedStatus);

            const response = await api.get(`/admin/admission-offers?${params}`);
            setAdmissionOffers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching admission offers:', error);
            toast({
                title: "Error",
                description: "Failed to fetch admission offers",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCsvUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csv = e.target.result;
                setCsvData(csv);
                parseCsvData(csv);
            };
            reader.readAsText(file);
        }
    };

    const parseCsvData = (csv) => {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const students = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const student = {};
                headers.forEach((header, index) => {
                    student[header] = values[index] || '';
                });
                students.push(student);
            }
        }

        setUploadData(prev => ({
            ...prev,
            admitted_students: students
        }));
    };

    const handleManualAdd = () => {
        console.log('Adding new student...');
        console.log('Current students before adding:', uploadData.admitted_students);
        setUploadData(prev => {
            const newStudents = [
                ...prev.admitted_students,
                { email: '', application_number: '' }
            ];
            console.log('Updated students array:', newStudents);
            console.log('New state will be:', {
                ...prev,
                admitted_students: newStudents
            });
            return {
                ...prev,
                admitted_students: newStudents
            };
        });
    };

    const handleStudentChange = (index, field, value) => {
        console.log(`Updating student ${index}, field: ${field}, value: ${value}`);
        console.log('Current students before update:', uploadData.admitted_students);
        setUploadData(prev => {
            const updatedStudents = prev.admitted_students.map((student, i) => 
                i === index ? { ...student, [field]: value } : student
            );
            console.log('Updated students array:', updatedStudents);
            console.log('New state will be:', {
                ...prev,
                admitted_students: updatedStudents
            });
            return {
                ...prev,
                admitted_students: updatedStudents
            };
        });
    };

    const handleRemoveStudent = (index) => {
        setUploadData(prev => ({
            ...prev,
            admitted_students: prev.admitted_students.filter((_, i) => i !== index)
        }));
    };

    const handleUpload = async () => {
        console.log('Upload button clicked!');
        console.log('Upload data:', uploadData);
        
        if (!uploadData.admission_session_id || !uploadData.department_id || !uploadData.acceptance_fee_amount) {
            console.log('Validation failed: Missing required fields');
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        console.log('Checking students array:', uploadData.admitted_students);
        console.log('Students array length:', uploadData.admitted_students.length);
        console.log('Students array type:', typeof uploadData.admitted_students);
        console.log('Students array is array:', Array.isArray(uploadData.admitted_students));
        
        if (!uploadData.admitted_students || uploadData.admitted_students.length === 0) {
            console.log('Validation failed: No students added');
            console.log('uploadData.admitted_students is:', uploadData.admitted_students);
            toast({
                title: "Validation Error",
                description: "Please add at least one student",
                variant: "destructive",
            });
            return;
        }
        
        // Check if students have valid data
        const validStudents = uploadData.admitted_students.filter(student => 
            student.application_number && student.application_number.trim()
        );
        
        console.log('Valid students:', validStudents);
        console.log('Valid students count:', validStudents.length);
        
        if (validStudents.length === 0) {
            console.log('Validation failed: No valid students (missing application number)');
            toast({
                title: "Validation Error",
                description: "Please ensure all students have valid application number",
                variant: "destructive",
            });
            return;
        }

        console.log('Starting upload process...');
        setUploadLoading(true);
        try {
            console.log('Sending API request to /admin/admission-offers/upload');
            const response = await api.post('/admin/admission-offers/upload', uploadData);
            console.log('API response received:', response.data);
            
            toast({
                title: "Success",
                description: `Successfully created ${response.data.data.created_offers.length} admission offers with acceptance fee of ₦${uploadData.acceptance_fee_amount.toLocaleString()}`,
            });

            if (response.data.data.errors.length > 0) {
                toast({
                    title: "Some Errors",
                    description: `${response.data.data.errors.length} students could not be processed. Check the console for details.`,
                    variant: "destructive",
                });
                console.log('Upload errors:', response.data.data.errors);
            }

            if (response.data.data.warnings && response.data.data.warnings.length > 0) {
                setWarnings(response.data.data.warnings);
                toast({
                    title: "Department Mismatch Warning",
                    description: `${response.data.data.warnings.length} student(s) were admitted to a different department than they applied for. See details below.`,
                    variant: "warning",
                    duration: 10000
                });
                console.warn('Department mismatch warnings:', response.data.data.warnings);
            } else {
                setWarnings([]);
            }

            // Reset form
            setUploadData({
                admission_session_id: '',
                department_id: '',
                acceptance_fee_amount: '',
                acceptance_deadline_days: '30',
                admitted_students: []
            });
            setCsvData('');
            
            // Refresh the list
            fetchAdmissionOffers();
        } catch (error) {
            console.error('Error uploading admitted students:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to upload admitted students",
                variant: "destructive",
            });
        } finally {
            console.log('Upload process completed');
            setUploadLoading(false);
        }
    };

    const handleUpdateOffer = async (offerId, updateData) => {
        try {
            await api.put(`/admin/admission-offers/${offerId}`, updateData);
            toast({
                title: "Success",
                description: "Admission offer updated successfully",
            });
            fetchAdmissionOffers();
            setEditingOffer(null);
        } catch (error) {
            console.error('Error updating admission offer:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update admission offer",
                variant: "destructive",
            });
        }
    };

    const handleDownloadTemplate = () => {
        const csvContent = "email,application_number\n";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'admitted_students_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const getStatusBadge = (status, acceptanceFeePaid) => {
        // If acceptance fee is paid, show as accepted regardless of backend status
        if (acceptanceFeePaid) {
            return <Badge variant="default">Accepted</Badge>;
        }
        
        const statusConfig = {
            offered: { variant: "default", text: "Offered" },
            accepted: { variant: "default", text: "Accepted" },
            declined: { variant: "destructive", text: "Declined" },
            expired: { variant: "secondary", text: "Expired" }
        };
        
        const config = statusConfig[status] || { variant: "default", text: status };
        return <Badge variant={config.variant}>{config.text}</Badge>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    // Add a helper to get detailed status badges
    const getDetailedStatus = (offer) => {
        const badges = [];
        
        // Main status badge
        badges.push(
            <Badge key="main-status" variant="default" className="mr-1">
                {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
            </Badge>
        );
        
        // Acceptance fee status badge
        if (offer.acceptance_fee_paid) {
            badges.push(
                <Badge key="fee-paid" variant="default" className="mr-1">
                    Acceptance Fee Paid
                </Badge>
            );
        } else {
            badges.push(
                <Badge key="fee-unpaid" variant="secondary" className="mr-1">
                    Acceptance Fee Not Paid
                </Badge>
            );
        }
        
        // Admission acceptance status badge
        if (offer.admission_accepted || offer.acceptance_fee_paid) {
            badges.push(
                <Badge key="admission-accepted" variant="default" className="mr-1">
                    Admission Accepted
                </Badge>
            );
        } else {
            badges.push(
                <Badge key="admission-pending" variant="secondary" className="mr-1">
                    Not Yet Accepted
                </Badge>
            );
        }
        
        // Expired status badge
        if (offer.status === 'expired') {
            badges.push(
                <Badge key="expired" variant="destructive" className="mr-1">
                    Offer Expired
                </Badge>
            );
        }
        
        return badges;
    };

    return (
        <div className="space-y-6">

            {/* Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload Admitted Students</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="mb-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="useDefaultAcceptanceFee"
                            checked={useDefaultAcceptanceFee}
                            onChange={e => setUseDefaultAcceptanceFee(e.target.checked)}
                        />
                        <Label htmlFor="useDefaultAcceptanceFee">
                            Use default acceptance fee ({defaultAcceptanceFee ? `₦${Number(defaultAcceptanceFee).toLocaleString()}` : 'loading...'})
                        </Label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="session">Admission Session</Label>
                            <select
                                value={uploadData.admission_session_id}
                                onChange={(e) => {
                                    setUploadData(prev => ({ ...prev, admission_session_id: e.target.value }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select session</option>
                                {admissionSessions.length === 0 ? (
                                    <option value="" disabled>No sessions available</option>
                                ) : (
                                    admissionSessions.map(session => (
                                        <option key={session.id} value={session.id.toString()}>
                                            {session.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            {admissionSessions.length === 0 && (
                                <p className="text-sm text-red-600 mt-1">No admission sessions found</p>
                            )}
                        </div>
                        
                        <div>
                            <Label htmlFor="department">Department</Label>
                            <select
                                value={uploadData.department_id}
                                onChange={(e) => {
                                    setUploadData(prev => ({ ...prev, department_id: e.target.value }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select department</option>
                                {departments.length === 0 ? (
                                    <option value="" disabled>No departments available</option>
                                ) : (
                                    departments.map(dept => (
                                        <option key={dept.id} value={dept.id.toString()}>
                                            {dept.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            {departments.length === 0 && (
                                <p className="text-sm text-red-600 mt-1">No departments found</p>
                            )}
                        </div>
                        
                        <div>
                            <Label htmlFor="fee">Acceptance Fee (₦)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={uploadData.acceptance_fee_amount}
                                onChange={e => setUploadData(prev => ({ ...prev, acceptance_fee_amount: e.target.value }))}
                                disabled={useDefaultAcceptanceFee}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="deadline">Deadline (days)</Label>
                            <Input
                                type="number"
                                placeholder="30"
                                value={uploadData.acceptance_deadline_days}
                                onChange={(e) => setUploadData(prev => ({ ...prev, acceptance_deadline_days: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label>Upload CSV File</Label>
                            <Button 
                                onClick={handleDownloadTemplate} 
                                variant="outline" 
                                size="sm"
                            >
                                Download Template
                            </Button>
                        </div>
                        <Input
                            type="file"
                            accept=".csv"
                            onChange={handleCsvUpload}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            CSV should have columns: application_number, email (optional)
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label>Admitted Students</Label>
                            <Button onClick={handleManualAdd} variant="outline" size="sm">
                                Add Student
                            </Button>
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                            {uploadData.admitted_students.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                    No students added yet. Click "Add Student" to add students manually or upload a CSV file.
                                </div>
                            ) : (
                                uploadData.admitted_students.map((student, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <Input
                                            placeholder="Email (optional)"
                                            value={student.email}
                                            onChange={(e) => handleStudentChange(index, 'email', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Application Number"
                                            value={student.application_number}
                                            onChange={(e) => handleStudentChange(index, 'application_number', e.target.value)}
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveStudent(index)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Submit Admission Offers</h3>
                                <p className="text-sm text-gray-600">
                                    {uploadData.admitted_students.length} student(s) ready to be processed
                                </p>
                            </div>
                        </div>
                        <Button 
                            onClick={handleUpload} 
                            disabled={uploadLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                            size="lg"
                        >
                            {uploadLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                </div>
                            ) : (
                                `Upload ${uploadData.admitted_students.length} Admitted Student${uploadData.admitted_students.length !== 1 ? 's' : ''}`
                            )}
                        </Button>
                        {uploadData.admitted_students.length === 0 && (
                            <p className="text-sm text-red-600 mt-2 text-center">
                                Please add at least one student before uploading
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {warnings.length > 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-4">
                    <div className="font-bold mb-2">Department Mismatch Warnings</div>
                    <ul className="list-disc pl-5">
                        {warnings.map((w, i) => (
                            <li key={i}>{w}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Admission Offers</CardTitle>
                    <Button onClick={fetchAdmissionOffers} disabled={loading} className="ml-4" variant="outline" size="sm">
                        {loading ? 'Refreshing...' : 'Manual Refresh'}
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <select
                            value={selectedSession}
                            onChange={(e) => {
                                console.log('Filter session selected:', e.target.value);
                                setSelectedSession(e.target.value);
                            }}
                            className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Sessions</option>
                            {admissionSessions.length === 0 ? (
                                <option value="" disabled>No sessions available</option>
                            ) : (
                                admissionSessions.map(session => (
                                    <option key={session.id} value={session.id.toString()}>
                                        {session.name}
                                    </option>
                                ))
                            )}
                        </select>

                        <select
                            value={selectedDepartment}
                            onChange={(e) => {
                                console.log('Filter department selected:', e.target.value);
                                setSelectedDepartment(e.target.value);
                            }}
                            className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Departments</option>
                            {departments.length === 0 ? (
                                <option value="" disabled>No departments available</option>
                            ) : (
                                departments.map(dept => (
                                    <option key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                    </option>
                                ))
                            )}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="offered">Offered</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                            <option value="expired">Expired</option>
                        </select>

                        <Button onClick={fetchAdmissionOffers} disabled={loading}>
                            {loading ? 'Loading...' : 'Refresh'}
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Application #</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Status Details</TableHead>
                                <TableHead>Acceptance Fee</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admissionOffers.data?.map((offer) => (
                                <TableRow key={offer.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {offer.application?.full_name || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {offer.application?.email || 'N/A'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{offer.application?.application_number || 'N/A'}</TableCell>
                                    <TableCell>{offer.admission_session?.name || 'N/A'}</TableCell>
                                    <TableCell>{offer.department?.name || 'N/A'}</TableCell>
                                    <TableCell>{getStatusBadge(offer.status, offer.acceptance_fee_paid)}</TableCell>
                                    <TableCell>{getDetailedStatus(offer)}</TableCell>
                                    <TableCell>{formatCurrency(offer.acceptance_fee_amount)}</TableCell>
                                    <TableCell>{formatDate(offer.acceptance_deadline)}</TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit Admission Offer</DialogTitle>
                                                </DialogHeader>
                                                <EditOfferForm 
                                                    offer={offer} 
                                                    onUpdate={handleUpdateOffer}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {admissionOffers.data?.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            No admission offers found
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const EditOfferForm = ({ offer, onUpdate }) => {
    const [formData, setFormData] = useState({
        status: offer.status,
        acceptance_fee_amount: offer.acceptance_fee_amount,
        acceptance_deadline: offer.acceptance_deadline?.split('T')[0] || '',
        admin_notes: offer.admin_notes || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(offer.id, formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="status">Status</Label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="offered">Offered</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                    <option value="expired">Expired</option>
                </select>
            </div>

            <div>
                <Label htmlFor="fee">Acceptance Fee (₦)</Label>
                <Input
                    type="number"
                    value={formData.acceptance_fee_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptance_fee_amount: e.target.value }))}
                />
            </div>

            <div>
                <Label htmlFor="deadline">Acceptance Deadline</Label>
                <Input
                    type="date"
                    value={formData.acceptance_deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptance_deadline: e.target.value }))}
                />
            </div>

            <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                    value={formData.admin_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                    placeholder="Add any notes..."
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="submit">Update Offer</Button>
            </div>
        </form>
    );
};

export default AdmissionOfferManagement; 