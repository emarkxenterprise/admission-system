import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { resetPassword } from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(res.data.message || 'Password reset successful!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout instructions={null}>
      <div className="w-full">
        <h2 className="mb-6 text-2xl font-bold text-primary-700 text-center">Reset Password</h2>
        {success ? (
          <div className="bg-green-100 text-green-800 p-4 rounded text-center mb-4">{success}</div>
        ) : (
          <form className="space-y-6 w-full" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={e => setPasswordConfirmation(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                placeholder="Confirm new password"
              />
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Back to login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword; 