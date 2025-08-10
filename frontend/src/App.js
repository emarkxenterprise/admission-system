import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StaffAuthProvider, useStaffAuth } from './contexts/StaffAuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AdminLogin from './components/auth/AdminLogin';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ApplicationForm from './components/ApplicationForm';
import ApplicationDetails from './components/ApplicationDetails';
import PaymentHistory from './components/PaymentHistory';
import AdminApplications from './components/admin/AdminApplications';
import AdminPayments from './components/admin/AdminPayments';
import DepartmentManagement from './components/admin/DepartmentManagement';
import ProgramManagement from './components/admin/ProgramManagement';
import AdmissionSessionManagement from './components/admin/AdmissionSessionManagement';
import AdmissionOfferManagement from './components/admin/AdmissionOfferManagement';
import Navbar from './components/Navbar';
import HRManagement from './components/admin/HRManagement';
import AdmissionOffers from './components/AdmissionOffers';
import AcceptanceFeePayment from './components/AcceptanceFeePayment';
import AdmissionLetter from './components/AdmissionLetter';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentVerification from './components/PaymentVerification';
import UserManagement from './components/admin/UserManagement';
import FacultyManagement from './components/admin/FacultyManagement';
import Settings from './components/admin/Settings';
import DefaultLayout from './components/admin/layouts/DefaultLayout';


// Applicant route protection
const PrivateRoute = ({ children, requiredRoles = [], requiredPermissions = [] }) => {
  const { user, loading, hasAnyRole, hasAnyPermission } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Staff/admin route protection
const StaffPrivateRoute = ({ children, requiredRoles = [], requiredPermissions = [] }) => {
  const { staff, loading, hasAnyRole, hasAnyPermission } = useStaffAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!staff) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/admin" replace />;
  }
  
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

// Applicant layout wrapper
const ApplicantLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 pl-16 transition-all duration-300 ease-in-out">
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes future={{ v7_relativeSplatPath: true }}>
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Applicant routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<PrivateRoute><ApplicantLayout><Dashboard /></ApplicantLayout></PrivateRoute>} />
      <Route path="/apply" element={<PrivateRoute><ApplicantLayout><ApplicationForm /></ApplicantLayout></PrivateRoute>} />
      <Route path="/application/:id" element={<PrivateRoute><ApplicantLayout><ApplicationDetails /></ApplicantLayout></PrivateRoute>} />
      <Route path="/application/:id/edit" element={<PrivateRoute><ApplicantLayout><ApplicationForm editMode /></ApplicantLayout></PrivateRoute>} />
      <Route path="/payments" element={<PrivateRoute><ApplicantLayout><PaymentHistory /></ApplicantLayout></PrivateRoute>} />
      <Route path="/admission-offers" element={<PrivateRoute><ApplicantLayout><AdmissionOffers /></ApplicantLayout></PrivateRoute>} />
      <Route path="/payment/acceptance-fee/:offerId" element={<PrivateRoute><ApplicantLayout><AcceptanceFeePayment /></ApplicantLayout></PrivateRoute>} />
      <Route path="/admission-letter/:offerId" element={<PrivateRoute><ApplicantLayout><AdmissionLetter /></ApplicantLayout></PrivateRoute>} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/verify-payment" element={<PrivateRoute><ApplicantLayout><PaymentVerification /></ApplicantLayout></PrivateRoute>} />
      <Route path="/payment-history" element={<PrivateRoute><ApplicantLayout><PaymentHistory /></ApplicantLayout></PrivateRoute>} />

      {/* Staff/Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<StaffPrivateRoute><DefaultLayout><AdminDashboard /></DefaultLayout></StaffPrivateRoute>} />
      <Route path="/admin/applications" element={<StaffPrivateRoute requiredPermissions={['manage-admissions', 'view-applications']}><DefaultLayout><AdminApplications /></DefaultLayout></StaffPrivateRoute>} />
      <Route path="/admin/payments" element={<StaffPrivateRoute requiredPermissions={['manage-payments', 'view-payments']}><DefaultLayout><AdminPayments /></DefaultLayout></StaffPrivateRoute>} />
      <Route path="/admin/departments" element={<StaffPrivateRoute requiredPermissions={['manage-departments']}><DefaultLayout><DepartmentManagement /></DefaultLayout></StaffPrivateRoute>} />
      <Route path="/admin/programs" element={<StaffPrivateRoute requiredPermissions={['manage-departments']}><DefaultLayout><ProgramManagement /></DefaultLayout></StaffPrivateRoute>} />
      <Route path="/admin/faculties" element={<StaffPrivateRoute requiredPermissions={['view-faculties', 'manage-faculties']}><DefaultLayout><FacultyManagement /></DefaultLayout></StaffPrivateRoute>} />
      <Route path="/admin/admission-sessions" element={<StaffPrivateRoute requiredPermissions={['manage-admissions']}><DefaultLayout><AdmissionSessionManagement /></DefaultLayout></StaffPrivateRoute>} />
      <Route path="/admin/admission-offers" element={<StaffPrivateRoute requiredPermissions={['manage-admissions']}><DefaultLayout><AdmissionOfferManagement /></DefaultLayout></StaffPrivateRoute>} />
      <Route path="/admin/hr-management" element={<StaffPrivateRoute requiredRoles={['super-admin']}><DefaultLayout><HRManagement /></DefaultLayout></StaffPrivateRoute>} />
      <Route path="/admin/applicants" element={<StaffPrivateRoute requiredRoles={['super-admin']}><DefaultLayout><UserManagement /></DefaultLayout></StaffPrivateRoute>} />
      <Route path="/admin/settings" element={<StaffPrivateRoute requiredPermissions={['manage-settings']}><DefaultLayout><Settings /></DefaultLayout></StaffPrivateRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <StaffAuthProvider>
      <AuthProvider>
        <SettingsProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <AppRoutes />
              <ToastContainer position="top-right" />
            </div>
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </StaffAuthProvider>
  );
}

export default App; 