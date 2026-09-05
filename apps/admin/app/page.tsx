'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  Users,
  UserCheck,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatPriceETB } from '@/lib/constants';

interface PendingSeller {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  region?: string | null;
  city?: string | null;
  area?: string | null;
  createdAt: string;
}

interface PendingListing {
  id: string;
  title: string;
  price: number;
  age: string;
  gender: string;
  region: string;
  city: string;
  contactPhone: string;
  createdAt: string;
  seller: { fullName: string; email: string; phone: string };
  category: { name: string };
  breed?: { name: string } | null;
  images: { imageUrl: string; imageType: string }[];
}

interface ReportItem {
  id: string;
  reason: string;
  description?: string | null;
  reporterContact?: string | null;
  status: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    price: number;
    status: string;
    seller: { fullName: string; phone: string };
  };
}

interface SellerItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  region?: string | null;
  city?: string | null;
  createdAt: string;
  _count: { listings: number };
}

export default function AdminPortalPage() {
  const [sessionUser, setSessionUser] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@axummarket.et');
  const [loginPassword, setLoginPassword] = useState('AdminSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [stats, setStats] = useState({
    totalSellers: 0,
    pendingSellersCount: 0,
    activeListings: 0,
    pendingListings: 0,
    totalReports: 0,
  });
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingListing[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [sellers, setSellers] = useState<SellerItem[]>([]);
  const [activeTab, setActiveTab] = useState<'seller_approvals' | 'moderation' | 'reports' | 'sellers'>('seller_approvals');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data?.user) {
        setSessionUser(data.user);
        loadDashboardData();
      } else {
        setSessionUser(null);
      }
    } catch {
      setSessionUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const loadDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPendingSellers(data.pendingSellers || []);
        setPendingItems(data.pendingItems || []);
        setReports(data.reports || []);
        setSellers(data.sellers || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed.');
        setLoginLoading(false);
        return;
      }

      setSessionUser(data.user);
      loadDashboardData();
    } catch {
      setLoginError('A network error occurred.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSessionUser(null);
  };

  // Seller Approval Action
  const handleSellerApproval = async (sellerId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(sellerId);
    try {
      const res = await fetch(`/api/sellers/${sellerId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const approvedSeller = pendingSellers.find((s) => s.id === sellerId);
        setPendingSellers((prev) => prev.filter((s) => s.id !== sellerId));
        setStats((prev) => ({
          ...prev,
          pendingSellersCount: Math.max(0, prev.pendingSellersCount - 1),
          totalSellers: action === 'APPROVE' ? prev.totalSellers + 1 : prev.totalSellers,
        }));
        if (approvedSeller && action === 'APPROVE') {
          setSellers((prev) => [
            {
              id: approvedSeller.id,
              fullName: approvedSeller.fullName,
              email: approvedSeller.email,
              phone: approvedSeller.phone,
              status: 'ACTIVE',
              region: approvedSeller.region,
              city: approvedSeller.city,
              createdAt: approvedSeller.createdAt,
              _count: { listings: 0 },
            },
            ...prev,
          ]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Listing Moderation Action
  const handleModerate = async (listingId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(listingId);
    try {
      const res = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, action }),
      });
      if (res.ok) {
        setPendingItems((prev) => prev.filter((item) => item.id !== listingId));
        setStats((prev) => ({
          ...prev,
          pendingListings: Math.max(0, prev.pendingListings - 1),
          activeListings: action === 'APPROVE' ? prev.activeListings + 1 : prev.activeListings,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Seller Suspension Action
  const handleSellerStatus = async (sellerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(sellerId);
    try {
      const res = await fetch(`/api/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setSellers((prev) =>
          prev.map((s) => (s.id === sellerId ? { ...s, status: nextStatus } : s))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Initializing Administrative Console...
      </div>
    );
  }

  // 1. Unauthenticated Login Screen
  if (!sessionUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-0.5 rounded-full">
              Dedicated Admin Server • Port 3001
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Administrative Portal
            </h1>
            <p className="text-xs text-slate-400">
              Isolated governance portal for seller approvals, listing moderation, and account management.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  aria-label={showPassword ? 'Blind/Hide password' : 'See/Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-md transition active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <span>{loginLoading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-200">Pre-seeded Credentials:</p>
            <p>Email: <span className="font-mono text-amber-300">admin@axummarket.et</span></p>
            <p>Password: <span className="font-mono text-amber-300">AdminSecure2026!</span></p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow">
              🛡️
            </span>
            <span className="text-xl font-black tracking-tight text-white">
              Axum<span className="text-amber-400">Market</span> Admin
            </span>
            <span className="ml-2 text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-0.5 rounded-full">
              PORT 3001
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Authenticated as: <strong className="text-slate-200">{sessionUser.fullName}</strong> ({sessionUser.email})
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <span>Public Site (3000)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-950/60 hover:bg-red-900 text-red-200 text-xs font-semibold rounded-xl border border-red-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* Pending Sellers Card */}
        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-amber-500/50 shadow-sm bg-gradient-to-br from-slate-900 to-amber-950/30">
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
            Seller Approvals
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
            {stats.pendingSellersCount}
          </div>
        </div>

        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Approved Sellers
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {stats.totalSellers}
          </div>
        </div>

        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-xs text-green-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Active Animals
          </span>
          <div className="text-2xl sm:text-3xl font-black text-green-400 mt-1">
            {stats.activeListings}
          </div>
        </div>

        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending Listings
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            {stats.pendingListings}
          </div>
        </div>

        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-xs text-red-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5" />
            Open Reports
          </span>
          <div className="text-2xl sm:text-3xl font-black text-red-400 mt-1">
            {stats.totalReports}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('seller_approvals')}
          className={`pb-3 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
            activeTab === 'seller_approvals'
              ? 'border-amber-500 text-amber-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Seller Approvals</span>
          {pendingSellers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
              {pendingSellers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
            activeTab === 'moderation'
              ? 'border-green-500 text-green-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Listing Moderation ({pendingItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
            activeTab === 'reports'
              ? 'border-red-500 text-red-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>User Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`pb-3 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
            activeTab === 'sellers'
              ? 'border-blue-500 text-blue-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Sellers Directory ({sellers.length})</span>
        </button>
      </div>

      {/* TAB 1: Seller Approvals Queue */}
      {activeTab === 'seller_approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Seller Registrations Awaiting Verification
            </h2>
            <span className="text-xs text-slate-400">
              {pendingSellers.length} pending
            </span>
          </div>

          {pendingSellers.length === 0 ? (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-12 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
              <h3 className="font-bold text-slate-200 text-base">
                No pending seller registrations
              </h3>
              <p className="text-xs text-slate-400">
                All registered sellers have been approved or reviewed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-slate-900 rounded-2xl border border-amber-500/40 p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        Pending Admin Approval
                      </span>
                      <span className="text-xs text-slate-400">
                        Registered: {new Date(seller.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white">
                      {seller.fullName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <span className="flex items-center gap-1 font-mono text-green-400">
                        <Phone className="w-3.5 h-3.5" />
                        {seller.phone}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        {seller.email}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        {seller.city}, {seller.region} {seller.area ? `(${seller.area})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleSellerApproval(seller.id, 'APPROVE')}
                      disabled={actionLoading === seller.id}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Approve Seller</span>
                    </button>
                    <button
                      onClick={() => handleSellerApproval(seller.id, 'REJECT')}
                      disabled={actionLoading === seller.id}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold text-xs rounded-xl border border-red-800 transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Listing Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          {pendingItems.length === 0 ? (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-12 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
              <h3 className="font-bold text-slate-200 text-base">
                Moderation queue is clear
              </h3>
              <p className="text-xs text-slate-400">
                All animal submissions have been moderated.
              </p>
            </div>
          ) : (
            pendingItems.map((item) => {
              const front = item.images.find((i) => i.imageType === 'FRONT') || item.images[0];
              return (
                <div
                  key={item.id}
                  className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 shrink-0">
                        {front && (
                          <Image
                            src={front.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-amber-950 text-amber-300 border border-amber-800 font-bold px-2 py-0.5 rounded-full">
                            Pending Review
                          </span>
                          <span className="text-slate-400">
                            {item.category.name} {item.breed ? `• ${item.breed.name}` : ''}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-white">{item.title}</h3>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span className="font-black text-green-400 text-sm">
                            {formatPriceETB(item.price)}
                          </span>
                          <span>•</span>
                          <span>Seller: {item.seller.fullName} ({item.seller.phone})</span>
                          <span>•</span>
                          <span>Location: {item.city}, {item.region}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleModerate(item.id, 'APPROVE')}
                        disabled={actionLoading === item.id}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Approve Listing
                      </button>
                      <button
                        onClick={() => handleModerate(item.id, 'REJECT')}
                        disabled={actionLoading === item.id}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold text-xs rounded-xl border border-red-800 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* 3 Photos Inspection strip */}
                  <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-3">
                    {item.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                        <Image src={img.imageUrl} alt={img.imageType} fill className="object-cover" />
                        <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {img.imageType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: User Reports */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden p-5 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Buyer Safety Reports
          </h2>
          {reports.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-500">
              No reports have been submitted.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-950 text-red-300 border border-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        Reason: {r.reason}
                      </span>
                      <span className="text-xs text-slate-400">
                        Listing: {r.listing.title} ({formatPriceETB(r.listing.price)})
                      </span>
                    </div>
                    {r.description && (
                      <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        &ldquo;{r.description}&rdquo;
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Seller: {r.listing.seller.fullName} ({r.listing.seller.phone}) • Reporter Contact: {r.reporterContact || 'Anonymous'}
                    </p>
                  </div>

                  <a
                    href={`http://localhost:3000/listings/${r.listing.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition shrink-0"
                  >
                    View Listing
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Sellers Directory */}
      {activeTab === 'sellers' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden p-5 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Active & Verified Livestock Sellers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-semibold">Seller</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Listings</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 font-bold text-white">{s.fullName}</td>
                    <td className="py-3 text-slate-300 font-mono">{s.phone}</td>
                    <td className="py-3 text-slate-400">
                      {s.city || 'Sululta'}, {s.region || 'Oromia'}
                    </td>
                    <td className="py-3 font-semibold text-white">
                      {s._count.listings}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          s.status === 'ACTIVE'
                            ? 'bg-green-950 text-green-300 border border-green-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleSellerStatus(s.id, s.status)}
                        disabled={actionLoading === s.id}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          s.status === 'ACTIVE'
                            ? 'bg-red-950 text-red-300 hover:bg-red-900 border border-red-800'
                            : 'bg-green-950 text-green-300 hover:bg-green-900 border border-green-800'
                        }`}
                      >
                        {s.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

