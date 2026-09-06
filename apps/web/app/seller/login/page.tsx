'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SellerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      if (data.user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/seller/dashboard');
      }
      router.refresh();
    } catch {
      setError('Network error. Please check connection and try again.');
      setLoading(false);
    }
  };

  const isPendingApproval = error.toLowerCase().includes('awaiting administrator approval');

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-7 shadow-lg shadow-gray-200/50 space-y-5">
        {/* Header Header */}
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-2xl bg-green-100/80 text-green-700 flex items-center justify-center mx-auto text-xl shadow-xs">
            🔐
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Seller Dashboard Login
          </h1>
          <p className="text-xs text-gray-500">
            Sign in to manage your livestock listings and mark animals as sold.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
              isPendingApproval
                ? 'bg-amber-50 border border-amber-300 text-amber-900'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {isPendingApproval ? (
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <strong className="block font-bold">
                {isPendingApproval ? 'Approval Pending' : 'Authentication Error'}
              </strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Minimalist Pure-Placeholder Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          {/* Email Address Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              autoComplete="email"
              aria-label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition shadow-xs"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-11 py-3 bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-bold rounded-2xl text-sm shadow-md shadow-green-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="border-t border-gray-100 pt-3.5 text-center text-xs text-gray-500">
          Don&rsquo;t have a seller account yet?{' '}
          <Link href="/seller/register" className="font-bold text-green-700 hover:underline">
            Register for Approval
          </Link>
        </div>
      </div>
    </div>
  );
}
