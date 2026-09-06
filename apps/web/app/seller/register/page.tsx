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
  const [city, setCity] = useState('Sululta');
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
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-8 shadow-md text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Registration Under Review
            </span>
            <h2 className="text-2xl font-black text-gray-900">
              Awaiting Admin Approval
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Thank you, <strong className="text-gray-900">{fullName}</strong>. To protect our livestock marketplace community and ensure authentic sellers, all new registrations require administrator approval before login.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Next Steps:</span>
            </div>
            <ul className="space-y-1 text-gray-600 list-disc list-inside">
              <li>Platform administrators will verify your details.</li>
              <li>Once approved, your account will be activated immediately.</li>
              <li>You can then log in using your email and password to post livestock.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/seller/login"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow-md transition"
            >
              Go to Seller Login
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-xs">
            <UserPlus className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
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

          {/* Region & City */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                aria-label="Region"
                className="w-full px-3.5 py-3 bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition shadow-xs"
              >
                <option value="Oromia">Oromia</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Amhara">Amhara</option>
                <option value="Sidama">Sidama</option>
                <option value="Somali">Somali</option>
                <option value="Tigray">Tigray</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                autoComplete="off"
                aria-label="City or Town"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City or Town (ከተማ)"
                className="w-full px-3.5 py-3 bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition shadow-xs"
              />
            </div>
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

          {/* Admin Approval Notice Badge */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Admin Approval Required:</strong> Your seller account will be verified and approved by an administrator before you can publish animal listings.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-bold rounded-2xl text-sm shadow-md shadow-green-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Submitting Registration...' : 'Register for Seller Approval'}</span>
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
