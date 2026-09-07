'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillDefaultCredentials = () => {
    setEmail('admin@axummarket.et');
    setPassword('AdminSecure2026!');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          requireRole: 'ADMIN',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || 'Access denied. Valid Admin account required.'
        );
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('A network error occurred. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12 bg-slate-900 text-slate-100">
      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-700 p-5 sm:p-8 shadow-2xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            Administrator Portal
          </h1>

          <p className="text-xs text-slate-400">
            Secure administrative access for marketplace moderation and platform governance.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3.5 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-3.5"
          autoComplete="off"
        >
          {/* Email */}
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

            <input
              type="email"
              required
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              className="w-full pl-10 pr-3 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              className="w-full pl-10 pr-10 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-md transition active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span>
              {loading ? 'Authenticating...' : 'Sign In as Admin'}
            </span>

            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo / Device Helper Box */}
        <div className="pt-2 border-t border-slate-700/60 text-center space-y-2">
          <p className="text-[11px] text-slate-400">
            Default Administrator Account:
          </p>
          <button
            type="button"
            onClick={fillDefaultCredentials}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-600 text-xs text-amber-300 transition active:scale-95"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Fill Default Admin Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
}
