import React from 'react';
import { Link } from 'react-router-dom';
import { useStaffAuth } from '../../../contexts/StaffAuthContext';

const MinimalLayout = ({ children }) => {
  const { hasAnyPermission } = useStaffAuth();
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-48 bg-white border-r flex flex-col py-6 px-2">
        <div className="mb-8 text-xl font-bold text-primary-600 text-center">Admin Portal</div>
        <nav className="flex flex-col gap-2">
          <Link to="/admin" className="py-2 px-3 rounded hover:bg-primary-50 hover:text-primary-700">Dashboard</Link>
          <Link to="/admin/applications" className="py-2 px-3 rounded hover:bg-primary-50 hover:text-primary-700">Applications</Link>
          <Link to="/admin/payments" className="py-2 px-3 rounded hover:bg-primary-50 hover:text-primary-700">Payments</Link>
          <Link to="/admin/hr-management" className="py-2 px-3 rounded hover:bg-primary-50 hover:text-primary-700">HR Management</Link>
          <Link to="/admin/departments" className="py-2 px-3 rounded hover:bg-primary-50 hover:text-primary-700">Departments</Link>
          {/* Faculties link - permission check */}
          {hasAnyPermission(['view-faculties', 'manage-faculties']) && (
            <Link to="/admin/faculties" className="py-2 px-3 rounded hover:bg-primary-50 hover:text-primary-700">Faculties</Link>
          )}
          <Link to="/admin/settings" className="py-2 px-3 rounded hover:bg-primary-50 hover:text-primary-700">Settings</Link>
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
          <div className="font-semibold text-lg text-gray-800">Admin Portal</div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">Logout</button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default MinimalLayout; 