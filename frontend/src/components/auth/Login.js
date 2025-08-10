import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from './AuthLayout';

// Universal error message helper
function getErrorMessage(error, fallback = 'An error occurred') {
  let message =
    error?.response?.data?.message ||
    error?.message ||
    fallback;
  if (typeof message !== 'string') {
    if (Array.isArray(message)) {
      message = message.join(' ');
    } else if (typeof message === 'object' && message !== null) {
      message = Object.values(message).flat().join(' ');
    } else {
      message = JSON.stringify(message);
    }
  }
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    message += ': ' + Object.values(errors).flat().join(' ');
  }
  return message;
}

const instructions = (
  <div>
    <h2 className="text-xl font-bold mb-2 text-primary-700">Admission Process</h2>
    <ol className="list-decimal ml-5 text-gray-700 space-y-2">
      <li>Create an account or log in if you already have one.</li>
      <li>Fill out the online application form with accurate details.</li>
      <li>Upload all required documents.</li>
      <li>Pay the application and acceptance fees.</li>
      <li>Track your application status on your dashboard.</li>
      <li>Wait for admission decision and further instructions.</li>
    </ol>
    <p className="mt-4 text-sm text-gray-500">For support, contact admissions@nana.edu.ng</p>
  </div>
);

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Login component: Attempting login with:', data.email);
      const result = await login(data.email, data.password);
      console.log('Login component: Login successful:', result);
      toast.success('Login successful!');
      
      // Force a small delay to ensure state updates are processed
      setTimeout(() => {
        console.log('Login component: Navigating to dashboard...');
        navigate('/dashboard', { replace: true });
      }, 200);
    } catch (error) {
      console.error('Login component: Login error:', error);
      toast.error(getErrorMessage(error, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout instructions={instructions}>
      <h2 className="mb-6 text-2xl font-bold text-primary-700 text-center">Sign in to your account</h2>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900`}
            placeholder="Email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={`block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900`}
            placeholder="Password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 text-sm font-medium">Forgot password?</Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Create a new account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login; 