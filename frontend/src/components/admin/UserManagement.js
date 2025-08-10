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
import { Textarea } from './layouts/ui/textarea';
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
import { Badge } from './layouts/ui/badge';
import { useToast } from './layouts/ui/use-toast';
import api from '../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [applicationsModalOpen, setApplicationsModalOpen] = useState(false);
    const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [admissionSessions, setAdmissionSessions] = useState([]);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
        fetchAdmissionSessions();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null); // Clear any previous errors
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (selectedStatus) params.append('status', selectedStatus);
            if (selectedSession) params.append('session_id', selectedSession);

            const response = await api.get(`/admin/applicants?${params}`);
            console.log('API Response:', response.data); // Debug log
            
            // Handle the simplified response structure
            const applicantsData = response.data?.data || [];
            console.log('Raw applicants data:', applicantsData);
            console.log('Response structure:', response.data);
            
            // Ensure we have an array of users
            const usersArray = Array.isArray(applicantsData) ? applicantsData : [];
            console.log('Processed users array:', usersArray);
            setUsers(usersArray);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]); // Set empty array on error
            setError(error.message || 'Failed to fetch applicants');
            toast({
                title: "Error",
                description: "Failed to fetch applicants",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAdmissionSessions = async () => {
        try {
            const response = await api.get('/admin/admission-sessions');
            setAdmissionSessions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching admission sessions:', error);
        }
    };

    const handleSearch = () => {
        fetchUsers();
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedSession('');
        fetchUsers();
    };

    const handleViewApplications = (user) => {
        setSelectedUser(user);
        setApplicationsModalOpen(true);
    };

    const handleViewPayments = (user) => {
        setSelectedUser(user);
        setPaymentsModalOpen(true);
    };

    const handleExportData = () => {
        if (!Array.isArray(users) || users.length === 0) {
            toast({
                title: "No Data",
                description: "No applicants to export",
                variant: "destructive",
            });
            return;
        }

        // Create CSV data
        const csvData = [
            ['Name', 'Email', 'Phone', 'Status', 'Applications', 'Payments', 'Joined Date'],
            ...users.map(user => [
                user.name || `${user.first_name} ${user.last_name}` || 'N/A',
                user.email || 'N/A',
                user.phone || 'N/A',
                user.status || 'active',
                user.applications?.length || 0,
                user.payments?.length || 0,
                formatDate(user.created_at)
            ])
        ];

        // Convert to CSV string
        const csvString = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        
        // Create and download file
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applicants_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
            title: "Export Successful",
            description: `Exported ${users.length} applicants to CSV`,
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { variant: "default", text: "Active" },
            inactive: { variant: "secondary", text: "Inactive" },
            suspended: { variant: "destructive", text: "Suspended" }
        };
        
        const config = statusConfig[status] || { variant: "default", text: status };
        return <Badge variant={config.variant}>{config.text}</Badge>;
    };

    const getApplicationStatusBadge = (application) => {
        if (!application) return <Badge variant="secondary">No Application</Badge>;
        
        if (application.form_paid && application.status === 'admitted') {
            return <Badge variant="default">Admitted</Badge>;
        } else if (application.form_paid) {
            return <Badge variant="default">Applied</Badge>;
        } else {
            return <Badge variant="secondary">Pending Payment</Badge>;
        }
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

    return (
        <div className="space-y-6">
                    <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Applicants</h1>
            <Button onClick={fetchUsers} disabled={loading} variant="outline" size="sm">
                {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
        </div>

            {/* Filters */}
            <Card>
                            <CardHeader>
                <CardTitle>Search & Filters</CardTitle>
            </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="search">Search Applicants</Label>
                            <Input
                                id="search"
                                placeholder="Search by name, email, or application number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="status">Applicant Status</Label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="session">Admission Session</Label>
                            <select
                                value={selectedSession}
                                onChange={(e) => setSelectedSession(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Sessions</option>
                                {admissionSessions.map(session => (
                                    <option key={session.id} value={session.id.toString()}>
                                        {session.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <Button onClick={handleSearch} className="flex-1">
                                Search
                            </Button>
                            <Button onClick={handleClearFilters} variant="outline">
                                Clear
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

                        {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Applicants ({Array.isArray(users) ? users.length : 0})</CardTitle>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleExportData()}
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                                                    <TableRow>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Application</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payments</TableHead>
                            <TableHead>Admissions</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(users) && users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                                                                    <div>
                                                <div className="font-medium">
                                                    {user.name || `${user.first_name} ${user.last_name}`}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            {user.applications && user.applications.length > 0 ? (
                                                user.applications.map((app, index) => (
                                                    <div key={app.id} className="mb-1">
                                                        <div className="text-sm font-medium">
                                                            {app.application_number}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {app.admission_session?.name}
                                                        </div>
                                                        {getApplicationStatusBadge(app)}
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-gray-500 text-sm">No applications</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(user.status || 'active')}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="text-sm">
                                                Total: {user.payments?.length || 0}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {user.payments?.filter(p => p.status === 'successful').length || 0} successful
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ₦{user.payments?.reduce((sum, p) => sum + (p.status === 'successful' ? parseFloat(p.amount) : 0), 0).toLocaleString() || '0'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="text-sm">
                                                Total: {user.admissions?.length || 0}
                                            </div>
                                            {user.admissions && user.admissions.length > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    {user.admissions.filter(a => a.status === 'accepted' || a.acceptance_fee_paid).length} accepted
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {formatDate(user.created_at)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setViewModalOpen(true);
                                                }}
                                                className="w-10 h-10 p-0"
                                                title="View Details"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Button>
                                            
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setEditModalOpen(true);
                                                }}
                                                className="w-10 h-10 p-0"
                                                title="Edit Status"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Button>
                                            
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleViewApplications(user)}
                                                className="w-10 h-10 p-0"
                                                title="View Applications"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </Button>
                                            
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleViewPayments(user)}
                                                className="w-10 h-10 p-0"
                                                title="View Payments"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {error && (
                        <div className="text-center py-8 text-red-500">
                            <p>Error: {error}</p>
                            <Button onClick={fetchUsers} variant="outline" className="mt-2">
                                Retry
                            </Button>
                        </div>
                    )}
                    
                    {!error && (!Array.isArray(users) || users.length === 0) && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            No applicants found
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Details Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Applicant Details - {selectedUser?.name || `${selectedUser?.first_name} ${selectedUser?.last_name}`}</DialogTitle>
                    </DialogHeader>
                    {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setViewModalOpen(false)} />}
                </DialogContent>
            </Dialog>

            {/* Edit Status Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Applicant Status</DialogTitle>
                    </DialogHeader>
                    {selectedUser && <UpdateStatusModal user={selectedUser} onUpdate={() => {
                        fetchUsers();
                        setEditModalOpen(false);
                    }} />}
                </DialogContent>
            </Dialog>

            {/* Applications Modal */}
            <Dialog open={applicationsModalOpen} onOpenChange={setApplicationsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Applications - {selectedUser?.name || `${selectedUser?.first_name} ${selectedUser?.last_name}`}</DialogTitle>
                    </DialogHeader>
                    {selectedUser && <ApplicationsModal user={selectedUser} onClose={() => setApplicationsModalOpen(false)} />}
                </DialogContent>
            </Dialog>

            {/* Payments Modal */}
            <Dialog open={paymentsModalOpen} onOpenChange={setPaymentsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Payments - {selectedUser?.name || `${selectedUser?.first_name} ${selectedUser?.last_name}`}</DialogTitle>
                    </DialogHeader>
                    {selectedUser && <PaymentsModal user={selectedUser} onClose={() => setPaymentsModalOpen(false)} />}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const UserDetailsModal = ({ user, onClose }) => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'applications', label: 'Applications' },
        { id: 'payments', label: 'Payments' },
        { id: 'admissions', label: 'Admissions' }
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            successful: { variant: "default", text: "Successful" },
            pending: { variant: "secondary", text: "Pending" },
            failed: { variant: "destructive", text: "Failed" }
        };
        
        const config = statusConfig[status] || { variant: "default", text: status };
        return <Badge variant={config.variant}>{config.text}</Badge>;
    };

    return (
        <div className="space-y-4">
            {/* Header with Close Button */}
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-semibold">Applicant Information</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${
                            activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-4">
                {activeTab === 'profile' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Name</label>
                                <p className="text-sm text-gray-900">{user.name || `${user.first_name} ${user.last_name}`}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <p className="text-sm text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Phone</label>
                                <p className="text-sm text-gray-900">{user.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Joined</label>
                                <p className="text-sm text-gray-900">{formatDate(user.created_at)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="space-y-4">
                        {user.applications && user.applications.length > 0 ? (
                            user.applications.map((app) => (
                                <div key={app.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">{app.application_number}</h4>
                                            <p className="text-sm text-gray-600">{app.admission_session?.name}</p>
                                            <p className="text-sm text-gray-600">{app.department?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={app.form_paid ? "default" : "secondary"}>
                                                {app.form_paid ? "Paid" : "Unpaid"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        Applied: {formatDate(app.created_at)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No applications found</p>
                        )}
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="space-y-4">
                        {user.payments && user.payments.length > 0 ? (
                            user.payments.map((payment) => (
                                <div key={payment.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">{payment.reference}</h4>
                                            <p className="text-sm text-gray-600">{payment.type.replace('_', ' ')}</p>
                                            <p className="text-sm text-gray-600">{formatDate(payment.created_at)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{formatCurrency(payment.amount)}</div>
                                            {getPaymentStatusBadge(payment.status)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No payments found</p>
                        )}
                    </div>
                )}

                {activeTab === 'admissions' && (
                    <div className="space-y-4">
                        {user.admissions && user.admissions.length > 0 ? (
                            user.admissions.map((admission) => (
                                <div key={admission.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">{admission.department?.name}</h4>
                                            <p className="text-sm text-gray-600">{admission.admission_session?.name}</p>
                                            <p className="text-sm text-gray-600">Fee: {formatCurrency(admission.acceptance_fee_amount)}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={admission.status === 'accepted' || admission.acceptance_fee_paid ? "default" : "secondary"}>
                                                {admission.status === 'accepted' || admission.acceptance_fee_paid ? "Accepted" : admission.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        Offered: {formatDate(admission.offer_date)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No admissions found</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Update Status Modal Component
const UpdateStatusModal = ({ user, onUpdate }) => {
    const [status, setStatus] = useState(user?.status || 'active');
    const [notes, setNotes] = useState(user?.admin_notes || '');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await api.put(`/admin/applicants/${user.id}/status`, {
                status,
                notes
            });
            
            toast({
                title: "Success",
                description: "Applicant status updated successfully",
            });
            
            onUpdate(); // Refresh the list and close modal
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: "Error",
                description: "Failed to update applicant status",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="status">Status</Label>
                <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>
            
            <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Add any notes about this applicant..."
                />
            </div>
            
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onUpdate()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Status'}
                </Button>
            </div>
        </form>
    );
};

// Applications Modal Component
const ApplicationsModal = ({ user, onClose }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const getApplicationStatusBadge = (application) => {
        if (!application) return <Badge variant="secondary">No Application</Badge>;
        
        if (application.form_paid && application.status === 'admitted') {
            return <Badge variant="default">Admitted</Badge>;
        } else if (application.form_paid) {
            return <Badge variant="default">Applied</Badge>;
        } else {
            return <Badge variant="secondary">Pending Payment</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with Close Button */}
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-semibold">Applications</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Button>
            </div>

            {user.applications && user.applications.length > 0 ? (
                <div className="space-y-4">
                    {user.applications.map((app) => (
                        <div key={app.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-medium text-lg">{app.application_number}</h4>
                                        {getApplicationStatusBadge(app)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Department:</span> {app.department?.name || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Session:</span> {app.admission_session?.name || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Applied:</span> {formatDate(app.created_at)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Status:</span> {app.status || 'N/A'}
                                        </div>
                                    </div>
                                    {app.admin_notes && (
                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                            <span className="font-medium text-yellow-800">Admin Notes:</span>
                                            <p className="text-yellow-700 text-sm">{app.admin_notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No applications found for this applicant</p>
                </div>
            )}
        </div>
    );
};

// Payments Modal Component
const PaymentsModal = ({ user, onClose }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            successful: { variant: "default", text: "Successful" },
            pending: { variant: "secondary", text: "Pending" },
            failed: { variant: "destructive", text: "Failed" }
        };
        
        const config = statusConfig[status] || { variant: "default", text: status };
        return <Badge variant={config.variant}>{config.text}</Badge>;
    };

    return (
        <div className="space-y-4">
            {/* Header with Close Button */}
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-semibold">Payments</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Button>
            </div>

            {user.payments && user.payments.length > 0 ? (
                <div className="space-y-4">
                    {user.payments.map((payment) => (
                        <div key={payment.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-medium text-lg">{payment.reference}</h4>
                                        {getPaymentStatusBadge(payment.status)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Type:</span> {payment.type.replace('_', ' ')}
                                        </div>
                                        <div>
                                            <span className="font-medium">Amount:</span> {formatCurrency(payment.amount)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Date:</span> {formatDate(payment.created_at)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Paystack Ref:</span> {payment.paystack_reference || 'N/A'}
                                        </div>
                                    </div>
                                    {payment.description && (
                                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                            <span className="font-medium text-blue-800">Description:</span>
                                            <p className="text-blue-700 text-sm">{payment.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Summary */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Payment Summary</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Total Payments:</span> {user.payments.length}
                            </div>
                            <div>
                                <span className="font-medium">Successful:</span> {user.payments.filter(p => p.status === 'successful').length}
                            </div>
                            <div>
                                <span className="font-medium">Total Amount:</span> {formatCurrency(user.payments.filter(p => p.status === 'successful').reduce((sum, p) => sum + parseFloat(p.amount), 0))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <p>No payments found for this applicant</p>
                </div>
            )}
        </div>
    );
};

export default UserManagement; 