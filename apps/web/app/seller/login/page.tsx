'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Clock } from 'lucide-react';

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
        setError(data.error || 'Invalid credentials.');
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
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const isPendingApproval = error.toLowerCase().includes('awaiting administrator approval');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto text-2xl">
            🔐
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Seller Dashboard Login
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Sign in to manage your livestock listings and mark animals as sold.
          </p>
        </div>

        {error && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 ${
              isPendingApproval
                ? 'bg-amber-50 border border-amber-300 text-amber-900'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {isPendingApproval ? (
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <strong className="block font-bold">
                {isPendingApproval ? 'Approval in Progress' : 'Sign In Error'}
              </strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hayiluu@axummarket.et"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                aria-label={showPassword ? 'Blind/Hide password' : 'See/Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow-md transition active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">Demo Approved Seller Credentials:</p>
          <p>Email: <span className="font-mono bg-white px-1 py-0.5 rounded border">hayiluu@axummarket.et</span></p>
          <p>Password: <span className="font-mono bg-white px-1 py-0.5 rounded border">MarketPass123!</span></p>
        </div>

        <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-500">
          Don&rsquo;t have a seller account yet?{' '}
          <Link href="/seller/register" className="font-bold text-green-700 hover:underline">
            Register for Approval
          </Link>
        </div>
      </div>
    </div>
  );
}
