'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        body: JSON.stringify({ email, password, requireRole: 'ADMIN' }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Access denied. Valid Admin account required.');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('A network error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-900 text-slate-100">
      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6">
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

        {error && (
          <div className="p-3.5 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              aria-label="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              className="w-full pl-10 pr-3 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              aria-label="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              className="w-full pl-10 pr-3 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-md transition active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

