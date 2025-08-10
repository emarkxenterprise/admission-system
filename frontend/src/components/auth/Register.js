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
    <p className="mt-2 text-sm text-red-600 font-semibold">FOR TECHNICAL ASSISTANCE PLEASE CALL SUPPORT ON: +2347064192898</p>
    <img src="/payment-methods.png" alt="Payment Methods" className="mt-6 mx-auto max-h-16" />
  </div>
);

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // Transform the data to match backend expectations
      const registrationData = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword
      };
      await registerUser(registrationData);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout instructions={instructions}>
      <h2 className="mb-6 text-2xl font-bold text-primary-700 text-center">Create a new account</h2>
      <form className="space-y-6 w-full" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            {...register('name', { required: 'Full name is required' })}
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900`}
            placeholder="Full Name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
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
            autoComplete="new-password"
            className={`block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900`}
            placeholder="Password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match',
            })}
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900`}
            placeholder="Confirm Password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register; 