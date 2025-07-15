// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const onSubmit = async (data: any) => {
    try {
      setError('');
      const response = await api.post('/auth/login', data);
      login(response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>
          <p className="text-center text-gray-500 mb-6">Log in to your account</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email Address</label>
              <input
                id="email"
                type="email"
                {...register('email', { required: true })}
                className="w-full px-4 py-2 border text-gray-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field with Toggle */}
            <div className="relative">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: true })}
                className="w-full px-4 py-2 border text-gray-500  border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 012.458 8.2C3.732 4.143 7.523 1 12 1s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
            >
              Login
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition duration-150"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}