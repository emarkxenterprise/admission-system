import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ExportOptions from '../ExportOptions';

const AdminPayments = () => {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });

  // Define columns for export
  const exportColumns = [
    { key: 'reference', header: 'Reference' },
    { key: 'email', header: 'Email' },
    { key: 'amount', header: 'Amount' },
    { key: 'type', header: 'Payment Type' },
    { key: 'status', header: 'Status' },
    { key: 'description', header: 'Description' },
    { key: 'payment_date', header: 'Payment Date' }
  ];



  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/admin/payments?${params}`);
      
      // Handle paginated response structure
      const responseData = response.data;
      if (responseData && responseData.data && Array.isArray(responseData.data.data)) {
        // Paginated response
        setPayments(responseData.data.data);
      } else if (Array.isArray(responseData.data)) {
        // Direct array response
        setPayments(responseData.data);
      } else if (Array.isArray(responseData)) {
        // Direct array response without wrapper
        setPayments(responseData);
      } else {
        console.error('Unexpected response structure:', responseData);
        setPayments([]);
      }
    } catch (error) {
      toast.error('Failed to load payments');
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'successful': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'form_purchase': return 'bg-blue-100 text-blue-800';
      case 'admission_fee': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Prepare data for export (moved here after function definitions)
  const exportData = payments.map(payment => ({
    reference: payment.reference || 'N/A',
    email: payment.email || 'N/A',
    amount: formatAmount(payment.amount),
    type: payment.type === 'form_purchase' ? 'Form Purchase' : 
          payment.type === 'admission_fee' ? 'Admission Fee' : payment.type,
    status: payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
    description: payment.description || 'N/A',
    payment_date: new Date(payment.created_at).toLocaleDateString()
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

    return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md p-6">


          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="successful">Successful</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="form_purchase">Form Purchase</option>
                  <option value="admission_fee">Admission Fee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by reference or email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Filter
                </button>
              </div>
            </form>
          </div>

          {/* Payment Statistics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(Array.isArray(payments) ? payments.filter(p => p.status === 'successful').reduce((sum, p) => sum + parseFloat(p.amount), 0) : 0)}
              </div>
              <div className="text-sm text-green-600">Total Revenue</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(payments) ? payments.filter(p => p.status === 'successful').length : 0}
              </div>
              <div className="text-sm text-blue-600">Successful Payments</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {Array.isArray(payments) ? payments.filter(p => p.status === 'pending').length : 0}
              </div>
              <div className="text-sm text-yellow-600">Pending Payments</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Array.isArray(payments) ? payments.filter(p => p.status === 'failed').length : 0}
              </div>
              <div className="text-sm text-red-600">Failed Payments</div>
            </div>
          </div>

          {/* Export Options */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {payments.length} payment(s) found
            </div>
            <ExportOptions
              data={exportData}
              filename="payments"
              tableRef={tableRef}
              columns={exportColumns}
              title="Payments Report"
            />
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto" ref={tableRef}>
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(payments) && payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.user ? `${payment.user.first_name || ''} ${payment.user.last_name || ''}`.trim() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.user?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(payment.type)}`}>
                        {payment.type === 'form_purchase' ? 'Form Purchase' : 'Admission Fee'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {payment.reference}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!Array.isArray(payments) || payments.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500">No payments found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
  );
};

export default AdminPayments; 