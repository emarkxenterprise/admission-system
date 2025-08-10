import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { sendResetLinkEmail } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      const res = await sendResetLinkEmail(email);
      setSuccess(res.data.message || 'If your email exists in our system, you will receive a password reset link shortly.');
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    }
  };

  return (
    <AuthLayout instructions={null}>
      <div className="w-full">
        <h2 className="mb-6 text-2xl font-bold text-primary-700 text-center">Forgot Password</h2>
        {success && (
          <div className="bg-green-100 text-green-800 p-4 rounded text-center mb-4">
            {success}
          </div>
        )}
        {submitted ? null : (
          <form className="space-y-6 w-full" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                placeholder="Enter your email address"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Send Reset Link
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Back to login
          </Link>
          <br />
          {/* For testing: link to reset password page (normally from email) */}
          <Link to="/reset-password?token=sampletoken&email=test@example.com" className="text-primary-600 hover:text-primary-500">
            Reset password (test link)
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword; 