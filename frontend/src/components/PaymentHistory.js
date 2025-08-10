import React, { useState, useEffect, useRef } from 'react';

import { toast } from 'react-toastify';
import api from '../services/api';
import jsPDF from 'jspdf';

import { useSettings } from '../contexts/SettingsContext';
import ExportOptions from './ExportOptions';

const PaymentReceiptModal = ({ payment, onClose }) => {
  const receiptRef = useRef();
  const { settings } = useSettings();

  if (!payment) return null;

  const handlePrint = () => {
    const printContents = receiptRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Payment Receipt</title>');
    printWindow.document.write('<style>body{font-family:sans-serif;} .receipt-modal{max-width:500px;margin:auto;} .font-medium{font-weight:600;} .mb-2{margin-bottom:0.5rem;} .text-xl{font-size:1.25rem;} .font-bold{font-weight:700;} .mb-4{margin-bottom:1rem;} </style>');
    printWindow.document.write('</head><body >');
    printWindow.document.write('<div class="receipt-modal">' + printContents + '</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set font styles
    pdf.setFont('helvetica');
    
    // Header with institution branding
    pdf.setFillColor(59, 130, 246); // Blue background
    pdf.rect(0, 0, pageWidth, 30, 'F'); // Back to original height
    
    // Institution name - dynamic from settings
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const schoolName = settings?.school_name || 'Admission Portal';
    
    // Add logo if available - positioned to the left of institution name
    if (settings?.print_logo) {
      try {
        const logoUrl = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${settings.print_logo}`;
        const logoResponse = await fetch(logoUrl);
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logoBlob);
        });
        
        // Add logo to the left of institution name
        pdf.addImage(logoBase64, 'PNG', 20, 5, 20, 20); // 20x20mm logo on the left
        // Position institution name to the right of logo
        pdf.text(schoolName.toUpperCase(), 50, 15, { align: 'left' });
      } catch (error) {
        console.error('Error loading logo:', error);
        // If logo fails, center the institution name
        pdf.text(schoolName.toUpperCase(), pageWidth / 2, 15, { align: 'center' });
      }
    } else {
      // No logo, center the institution name
      pdf.text(schoolName.toUpperCase(), pageWidth / 2, 15, { align: 'center' });
    }
    
    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Official Payment Receipt', pageWidth / 2, 22, { align: 'center' });
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Receipt title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAYMENT RECEIPT', pageWidth / 2, 35, { align: 'center' });
    
    // Receipt number and date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Receipt No: ${payment.reference}`, 20, 45);
    pdf.text(`Date: ${payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : new Date(payment.created_at).toLocaleDateString()}`, pageWidth - 20, 45, { align: 'right' });
    
    // Divider line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 50, pageWidth - 20, 50);
    
    // Payment details section
    let yPosition = 65;
    
    // Payment type
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Type:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(payment.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 60, yPosition);
    yPosition += 8;
    
    // Amount
    pdf.setFont('helvetica', 'bold');
    pdf.text('Amount:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`₦${payment.amount?.toLocaleString()}`, 60, yPosition);
    yPosition += 8;
    
    // Status
    pdf.setFont('helvetica', 'bold');
    pdf.text('Status:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    const status = payment.status.charAt(0).toUpperCase() + payment.status.slice(1);
    pdf.text(status, 60, yPosition);
    yPosition += 8;
    
    // Transaction reference
    if (payment.paystack_reference) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transaction Ref:', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(payment.paystack_reference, 60, yPosition);
      yPosition += 8;
    }
    
    // Department
    if (payment.admission?.department?.name) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Department:', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(payment.admission.department.name, 60, yPosition);
      yPosition += 8;
    }
    
    // Session
    if (payment.admission?.admission_session?.name) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Session:', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(payment.admission.admission_session.name, 60, yPosition);
      yPosition += 8;
    }
    
    // Payment method
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Method:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(payment.paystack_reference ? 'Paystack Online Payment' : 'Manual/Other', 60, yPosition);
    yPosition += 8;
    
    // Date
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Date:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(payment.paid_at ? new Date(payment.paid_at).toLocaleString() : new Date(payment.created_at).toLocaleString(), 60, yPosition);
    
    // Divider line
    yPosition += 15;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    
    // Footer section
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`This is an official receipt from ${schoolName}.`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    pdf.text('Please keep this receipt for your records.', pageWidth / 2, yPosition, { align: 'center' });
    
    // Contact information
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text('For inquiries, contact:', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    pdf.text('Email: admissions@portaluniversity.edu.ng', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    pdf.text('Phone: +234-XXX-XXX-XXXX', pageWidth / 2, yPosition, { align: 'center' });
    
    // Watermark - Color based on payment status
    const isPaid = payment.status === 'successful' || payment.status === 'paid';
    if (isPaid) {
      pdf.setTextColor(0, 128, 0); // Green color for paid
    } else {
      pdf.setTextColor(255, 0, 0); // Red color for unpaid
    }
    pdf.setFontSize(60);
    pdf.setFont('helvetica', 'bold');
    const watermarkText = isPaid ? 'PAID' : 'UNPAID';
    pdf.text(watermarkText, pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
    
    // Save the PDF
    pdf.save(`payment-receipt-${payment.reference}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg max-w-md w-full p-6 relative" ref={receiptRef}>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Payment Receipt</h2>
        <div className="mb-2"><span className="font-medium">Type:</span> {payment.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
        <div className="mb-2"><span className="font-medium">Amount:</span> ₦{payment.amount?.toLocaleString()}</div>
        <div className="mb-2"><span className="font-medium">Status:</span> {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</div>
        <div className="mb-2"><span className="font-medium">Reference:</span> {payment.reference}</div>
        <div className="mb-2"><span className="font-medium">Transaction Ref:</span> {payment.paystack_reference || '-'}</div>
        <div className="mb-2"><span className="font-medium">Department:</span> {payment.admission?.department?.name || '-'}</div>
        <div className="mb-2"><span className="font-medium">Session:</span> {payment.admission?.admission_session?.name || '-'}</div>
        <div className="mb-2"><span className="font-medium">Method:</span> {payment.paystack_reference ? 'Paystack' : 'Manual/Other'}</div>
        <div className="mb-2"><span className="font-medium">Date:</span> {payment.paid_at ? new Date(payment.paid_at).toLocaleString() : new Date(payment.created_at).toLocaleString()}</div>
        <div className="flex space-x-4 mt-6">
          <button
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            onClick={handlePrint}
          >
            Print
          </button>
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('all');
  
  // Table reference for export
  const tableRef = useRef(null);

  useEffect(() => {
    fetchPayments();
    fetchSessions();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments/history');
      const paymentsData = response.data.data?.payments || response.data.payments || [];
      setPayments(paymentsData);
    } catch (error) {
      console.error('Payment history fetch error:', error);
      toast.error('Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      const sessionData = response.data.data?.sessions || response.data.sessions || [];
      setSessions(sessionData);
    } catch (error) {
      // ignore
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'successful':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'form_purchase':
        return 'Application Form Fee';
      case 'admission_fee':
        return 'Admission Fee';
      case 'acceptance_fee':
        return 'Acceptance Fee';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const filteredPayments = selectedSession === 'all'
    ? payments
    : payments.filter(p => p.admission?.admission_session?.id === selectedSession);

  // Define columns for export
  const exportColumns = [
    { key: 'type', header: 'Payment Type' },
    { key: 'amount', header: 'Amount' },
    { key: 'status', header: 'Status' },
    { key: 'reference', header: 'Reference' },
    { key: 'transaction_ref', header: 'Transaction Ref' },
    { key: 'department', header: 'Department' },
    { key: 'session', header: 'Session' },
    { key: 'method', header: 'Payment Method' },
    { key: 'date', header: 'Payment Date' }
  ];

  // Prepare data for export
  const exportData = filteredPayments.map(payment => ({
    type: getTypeLabel(payment.type),
    amount: `₦${payment.amount?.toLocaleString()}`,
    status: payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
    reference: payment.reference || 'N/A',
    transaction_ref: payment.paystack_reference || 'N/A',
    department: payment.admission?.department?.name || 'N/A',
    session: payment.admission?.admission_session?.name || 'N/A',
    method: payment.paystack_reference ? 'Paystack' : 'Manual/Other',
    date: payment.paid_at ? new Date(payment.paid_at).toLocaleString() : new Date(payment.created_at).toLocaleString()
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Payment History</h1>
          <div className="flex items-center space-x-4">
            <div>
              <label className="mr-2 font-medium">Session:</label>
              <select
                className="border rounded px-2 py-1"
                value={selectedSession}
                onChange={e => setSelectedSession(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              >
                <option value="all">All Sessions</option>
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>{session.name}</option>
                ))}
              </select>
            </div>
            <ExportOptions
              data={exportData}
              filename="payment-history"
              tableRef={tableRef}
              columns={exportColumns}
              title="Payment History Report"
            />
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              No payment history
            </h3>
            <p className="text-gray-500">
              You haven't made any payments yet for this session.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md" ref={tableRef}>
            <ul className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <li key={payment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getTypeLabel(payment.type)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.admission?.department?.name} • {payment.admission?.admission_session?.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-medium text-gray-900">
                          ₦{payment.amount?.toLocaleString()}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                        <button
                          className="ml-2 px-3 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          View Receipt
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-medium">Reference:</span>
                          <span className="ml-1">{payment.reference}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <div>
                          {payment.paid_at ? (
                            <span>Paid on {new Date(payment.paid_at).toLocaleDateString()}</span>
                          ) : (
                            <span>Created on {new Date(payment.created_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <PaymentReceiptModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      </div>
    </div>
  );
};

export default PaymentHistory; 