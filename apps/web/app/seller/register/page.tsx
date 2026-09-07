'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  Check,
  MapPin,
} from 'lucide-react';

export default function SellerRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [region, setRegion] = useState('Oromia');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          confirmPassword,
          region,
          city,
          area,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit registration.');
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-5 sm:p-8 shadow-md text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">
              Registration Successful!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Welcome, <strong className="text-gray-900">{fullName}</strong>. Your account has been created and you can now log in to start selling.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/seller/login"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow-md transition"
            >
              Go to Seller Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12">
      <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6 overflow-hidden">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-xs">
            <UserPlus className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Register as a Livestock Seller
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Publish your animals and connect directly with thousands of buyers across Ethiopia.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5" autoComplete="off">
          {/* Full Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              autoComplete="off"
              aria-label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name / ሙሉ ስም"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition shadow-xs"
            />
          </div>

          {/* Email Address */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              autoComplete="off"
              aria-label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition shadow-xs"
            />
          </div>

          {/* Phone Number */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              required
              autoComplete="off"
              aria-label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number / ስልክ ቁጥር (+251...)"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition shadow-xs"
            />
          </div>

          {/* Region Selection (Touch-friendly responsive grid that stays 100% inside mobile bounds) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black text-gray-700 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span>Select Region / ክልል *</span>
              </span>
              <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                {region}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-full">
              {['Oromia', 'Addis Ababa', 'Amhara', 'Sidama', 'Somali', 'Tigray'].map((r) => {
                const isSelected = region === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(r)}
                    className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer active:scale-95 text-left ${
                      isSelected
                        ? 'bg-green-50 border-green-600 text-green-900 shadow-xs ring-1 ring-green-600/30'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="truncate">{r}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-green-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* City or Town Input */}
          <div className="relative">
            <input
              type="text"
              required
              autoComplete="off"
              aria-label="City or Town"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City or Town / ከተማ (e.g. Sululta, Bishoftu, Hawassa)"
              className="w-full px-3.5 py-3 bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition shadow-xs"
            />
          </div>

          {/* Area / Kebele */}
          <div className="relative">
            <input
              type="text"
              autoComplete="off"
              aria-label="Area or Kebele"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Area / Kebele / ሰፈር (Optional)"
              className="w-full px-3.5 py-3 bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition shadow-xs"
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
              minLength={6}
              autoComplete="new-password"
              aria-label="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create Password (min 6 chars)"
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

          {/* Confirm Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              aria-label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-11 py-3 bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* No Admin Approval Notice needed */}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-bold rounded-2xl text-sm shadow-md shadow-green-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Creating Account...' : 'Create Seller Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-500">
          Already have an approved account?{' '}
          <Link href="/seller/login" className="font-bold text-green-700 hover:underline">
            Log in to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
