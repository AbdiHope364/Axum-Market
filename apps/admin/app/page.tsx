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
  Search,
  Plus,
  Trash2,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Edit,
  Sliders,
  Check,
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

interface InventoryListing {
  id: string;
  title: string;
  price: number;
  status: string;
  age: string;
  gender: string;
  region: string;
  city: string;
  contactPhone: string;
  createdAt: string;
  category: { id: string; name: string; icon?: string | null };
  breed?: { id: string; name: string } | null;
  seller: { id: string; fullName: string; phone: string; email: string };
  images: { id: string; imageUrl: string; imageType: string }[];
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
  role: string;
  status: string;
  region?: string | null;
  city?: string | null;
  createdAt: string;
  _count: { listings: number };
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  status: string;
  breeds: { id: string; name: string; status: string }[];
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
    soldListings: 0,
    totalReports: 0,
    totalInventoryValueETB: 0,
  });
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingListing[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [sellers, setSellers] = useState<SellerItem[]>([]);
  const [allListings, setAllListings] = useState<InventoryListing[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<
    'seller_approvals' | 'moderation' | 'all_listings' | 'categories' | 'sellers' | 'reports'
  >('seller_approvals');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [listingSearchQuery, setListingSearchQuery] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState('ALL');
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');

  // New Category & Breed Modal / Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🐄');
  const [newBreedName, setNewBreedName] = useState('');
  const [selectedCategoryIdForBreed, setSelectedCategoryIdForBreed] = useState('');
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);

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
        setAllListings(data.allListings || []);
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !selectedCategoryIdForBreed) {
          setSelectedCategoryIdForBreed(data.categories[0].id);
        }
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

  // 1. Seller Approval Action
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
              role: 'SELLER',
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

  // 2. Listing Moderation Action
  const handleListingModeration = async (listingId: string, action: 'APPROVE' | 'REJECT') => {
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
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Full Inventory Control Actions
  const handleUpdateListingStatus = async (listingId: string, newStatus: string) => {
    setActionLoading(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAllListings((prev) =>
          prev.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
        );
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing? This action cannot be undone.')) {
      return;
    }
    setActionLoading(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAllListings((prev) => prev.filter((l) => l.id !== listingId));
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // 4. Seller Directory Controls
  const handleToggleSellerStatus = async (sellerId: string, currentStatus: string) => {
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

  const handleToggleSellerRole = async (sellerId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'SELLER' : 'ADMIN';
    if (!confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) {
      return;
    }
    setActionLoading(sellerId);
    try {
      const res = await fetch(`/api/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) {
        setSellers((prev) =>
          prev.map((s) => (s.id === sellerId ? { ...s, role: nextRole } : s))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSeller = async (sellerId: string) => {
    if (!confirm('Are you sure you want to permanently delete this seller and all their livestock listings?')) {
      return;
    }
    setActionLoading(sellerId);
    try {
      const res = await fetch(`/api/sellers/${sellerId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSellers((prev) => prev.filter((s) => s.id !== sellerId));
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // 5. Category & Breed Actions
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, icon: newCategoryIcon }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) => [...prev, data.category]);
        setNewCategoryName('');
        setCategoryFormOpen(false);
      } else {
        alert(data.error || 'Failed to create category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBreed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBreedName.trim() || !selectedCategoryIdForBreed) return;
    try {
      const res = await fetch('/api/breeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: selectedCategoryIdForBreed, name: newBreedName }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === selectedCategoryIdForBreed
              ? { ...c, breeds: [...c.breeds, data.breed] }
              : c
          )
        );
        setNewBreedName('');
      } else {
        alert(data.error || 'Failed to create breed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBreed = async (breedId: string, categoryId: string) => {
    if (!confirm('Are you sure you want to delete this breed?')) return;
    try {
      const res = await fetch(`/api/breeds?id=${breedId}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryId
              ? { ...c, breeds: c.breeds.filter((b) => b.id !== breedId) }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
          <span>Authenticating Administrator...</span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // LOGIN SCREEN (with Official Admin Crest Logo)
  // ---------------------------------------------------------------------------
  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Official Admin Logo Crest */}
          <div className="text-center space-y-3">
            <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-amber-400/80 shadow-xl shadow-amber-500/10 bg-slate-950">
              <Image
                src="/admin-logo.png"
                alt="AxumMarket Administration & Governance Logo"
                fill
                sizes="96px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                AxumMarket <span className="text-amber-400">Admin Console</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Port 3001 • Platform Governance & Full Management
              </p>
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="admin@axummarket.et"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-11 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Enter Admin Console</span>
            </button>
          </form>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-[11px] text-slate-400 text-center space-y-1">
            <span className="font-bold text-slate-300">Default Administrator Credentials:</span>
            <div className="font-mono text-[10px] text-amber-300/90">
              admin@axummarket.et / AdminSecure2026!
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter listings based on search query & status filter
  const filteredInventoryListings = allListings.filter((l) => {
    if (listingStatusFilter !== 'ALL' && l.status !== listingStatusFilter) return false;
    if (listingSearchQuery.trim()) {
      const q = listingSearchQuery.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchSeller = l.seller?.fullName?.toLowerCase().includes(q);
      const matchCity = l.city?.toLowerCase().includes(q);
      const matchBreed = l.breed?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchSeller && !matchCity && !matchBreed) return false;
    }
    return true;
  });

  const filteredSellers = sellers.filter((s) => {
    if (sellerSearchQuery.trim()) {
      const q = sellerSearchQuery.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.city?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header with Admin Crest Logo */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-md bg-slate-950 shrink-0">
            <Image
              src="/admin-logo.png"
              alt="AxumMarket Admin Logo"
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white tracking-tight">
                Axum<span className="text-amber-400">Market</span>
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Full Control Panel
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Logged in as <strong className="text-slate-200">{sessionUser.fullName}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            title="Refresh dashboard data"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/80 text-red-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Pending Sellers</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{stats.pendingSellersCount}</div>
            <div className="text-[10px] text-slate-500">Awaiting approval</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Pending Animals</span>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{stats.pendingListings}</div>
            <div className="text-[10px] text-slate-500">Need 3-photo review</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Live Livestock</span>
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            </div>
            <div className="text-2xl font-black text-green-400">{stats.activeListings}</div>
            <div className="text-[10px] text-slate-500">Active on marketplace</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Total Sellers</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400">{stats.totalSellers}</div>
            <div className="text-[10px] text-slate-500">Registered users</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Reports</span>
              <Flag className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-2xl font-black text-red-400">{stats.totalReports}</div>
            <div className="text-[10px] text-slate-500">Scam/sold reports</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Market Value</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-400 truncate">
              {formatPriceETB(stats.totalInventoryValueETB)}
            </div>
            <div className="text-[10px] text-slate-500">Live inventory value</div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          {[
            {
              id: 'seller_approvals',
              label: 'Seller Approvals',
              count: stats.pendingSellersCount,
              badgeColor: 'bg-amber-500 text-slate-950',
            },
            {
              id: 'moderation',
              label: 'Listing Moderation',
              count: stats.pendingListings,
              badgeColor: 'bg-amber-500 text-slate-950',
            },
            {
              id: 'all_listings',
              label: 'All Livestock Inventory',
              count: allListings.length,
              badgeColor: 'bg-slate-700 text-slate-200',
            },
            {
              id: 'categories',
              label: 'Categories & Breeds',
              count: categories.length,
              badgeColor: 'bg-slate-700 text-slate-200',
            },
            {
              id: 'sellers',
              label: 'Sellers Directory',
              count: stats.totalSellers,
              badgeColor: 'bg-slate-700 text-slate-200',
            },
            {
              id: 'reports',
              label: 'Safety Reports',
              count: stats.totalReports,
              badgeColor: 'bg-red-500 text-white',
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-950 text-amber-400' : tab.badgeColor
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SELLER APPROVALS */}
        {activeTab === 'seller_approvals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Pending Seller Approvals ({pendingSellers.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Verify newly registered farmers and traders before they can post animals.
                </p>
              </div>
            </div>

            {pendingSellers.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                <h3 className="font-bold text-white text-base">No Pending Seller Applications</h3>
                <p className="text-xs text-slate-400">All registered sellers have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Awaiting Approval
                        </span>
                        <h3 className="text-base font-black text-white">{seller.fullName}</h3>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {seller.city}, {seller.region} {seller.area ? `(${seller.area})` : ''}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        <a href={`tel:${seller.phone}`} className="hover:underline font-bold text-green-400">
                          {seller.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{seller.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleSellerApproval(seller.id, 'APPROVE')}
                        disabled={actionLoading === seller.id}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-green-600 hover:bg-green-700 active:scale-98 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Seller</span>
                      </button>

                      <button
                        onClick={() => handleSellerApproval(seller.id, 'REJECT')}
                        disabled={actionLoading === seller.id}
                        className="py-2.5 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LISTING MODERATION */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Livestock Listings Pending Review ({pendingItems.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Verify required 3 photo angles (Front, Left, Right) and ensure appropriate pricing.
                </p>
              </div>
            </div>

            {pendingItems.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                <h3 className="font-bold text-white text-base">No Pending Listings</h3>
                <p className="text-xs text-slate-400">All submitted animals have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="p-4 space-y-3">
                      {/* Photo Angles Preview */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {item.images?.map((img, idx) => (
                          <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-800">
                            <Image
                              src={img.imageUrl}
                              alt={img.imageType}
                              fill
                              sizes="120px"
                              className="object-cover"
                            />
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                              {img.imageType}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="text-lg font-black text-green-400">
                          {formatPriceETB(item.price)}
                        </div>
                        <h3 className="font-bold text-white text-sm line-clamp-1">{item.title}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{item.category?.name}</span>
                          {item.breed && <span>• {item.breed.name}</span>}
                          <span>• {item.gender}</span>
                          <span>• Age: {item.age}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1">
                        <div className="font-bold text-slate-300">Seller: {item.seller?.fullName}</div>
                        <div className="text-slate-400">Phone: {item.contactPhone}</div>
                        <div className="text-slate-500">Location: {item.city}, {item.region}</div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => handleListingModeration(item.id, 'APPROVE')}
                        disabled={actionLoading === item.id}
                        className="flex-1 py-2 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Publish Live</span>
                      </button>

                      <button
                        onClick={() => handleListingModeration(item.id, 'REJECT')}
                        disabled={actionLoading === item.id}
                        className="py-2 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ALL LIVESTOCK INVENTORY (NEW FULL CONTROL) */}
        {activeTab === 'all_listings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Full Livestock Inventory ({filteredInventoryListings.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Search, force status updates (Sold/Active/Removed), or delete any listing.
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {['ALL', 'ACTIVE', 'SOLD', 'PENDING', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setListingStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                      listingStatusFilter === st
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={listingSearchQuery}
                onChange={(e) => setListingSearchQuery(e.target.value)}
                placeholder="Search by animal title, seller name, breed, or city..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredInventoryListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            listing.status === 'ACTIVE'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : listing.status === 'SOLD'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : listing.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {listing.status}
                        </span>
                        <div className="text-base font-black text-green-400 mt-1">
                          {formatPriceETB(listing.price)}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm line-clamp-1">{listing.title}</h4>

                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Category: <strong className="text-slate-200">{listing.category?.name}</strong> {listing.breed && `(${listing.breed.name})`}</div>
                      <div>Seller: <strong className="text-slate-200">{listing.seller?.fullName}</strong> ({listing.seller?.phone})</div>
                      <div>Location: {listing.city}, {listing.region}</div>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                    {listing.status !== 'ACTIVE' && (
                      <button
                        onClick={() => handleUpdateListingStatus(listing.id, 'ACTIVE')}
                        className="py-1.5 px-2.5 rounded-lg bg-green-700/60 hover:bg-green-700 text-green-100 font-bold text-[11px] transition"
                      >
                        Set Active
                      </button>
                    )}

                    {listing.status !== 'SOLD' && (
                      <button
                        onClick={() => handleUpdateListingStatus(listing.id, 'SOLD')}
                        className="py-1.5 px-2.5 rounded-lg bg-blue-700/60 hover:bg-blue-700 text-blue-100 font-bold text-[11px] transition"
                      >
                        Mark Sold
                      </button>
                    )}

                    {listing.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateListingStatus(listing.id, 'REJECTED')}
                        className="py-1.5 px-2.5 rounded-lg bg-amber-700/60 hover:bg-amber-700 text-amber-100 font-bold text-[11px] transition"
                      >
                        Reject
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="py-1.5 px-2.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/80 font-bold text-[11px] transition ml-auto flex items-center gap-1"
                      title="Permanently delete listing"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORIES & BREEDS TAXONOMY (NEW FULL CONTROL) */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Livestock Taxonomy & Breeds Governance
                </h2>
                <p className="text-xs text-slate-400">
                  Manage animal categories and valid Ethiopian breeds for seller listings.
                </p>
              </div>

              <button
                onClick={() => setCategoryFormOpen(!categoryFormOpen)}
                className="py-2 px-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            {/* Create Category Modal / Drawer Form */}
            {categoryFormOpen && (
              <form
                onSubmit={handleCreateCategory}
                className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3"
              >
                <h3 className="font-black text-sm text-white">Add New Livestock Category</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Category Name</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Camels (ግመሎች)"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Emoji Icon</label>
                    <input
                      type="text"
                      value={newCategoryIcon}
                      onChange={(e) => setNewCategoryIcon(e.target.value)}
                      placeholder="e.g. 🐪, 🐴, 🐔"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition"
                    >
                      Save Category
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryFormOpen(false)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Add Breed Form */}
            <form
              onSubmit={handleCreateBreed}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                + Add Breed to Category
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <select
                    value={selectedCategoryIdForBreed}
                    onChange={(e) => setSelectedCategoryIdForBreed(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon || '🐾'} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    value={newBreedName}
                    onChange={(e) => setNewBreedName(e.target.value)}
                    placeholder="New Breed Name (e.g. Fogera, Barka, Dorper)"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                >
                  Add Breed
                </button>
              </div>
            </form>

            {/* Categories & Breeds List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cat.icon || '🐾'}</span>
                      <div>
                        <h4 className="font-black text-white text-base">{cat.name}</h4>
                        <div className="text-[10px] text-slate-400">
                          Slug: <span className="font-mono text-amber-300">{cat.slug}</span> •{' '}
                          {cat._count?.listings || 0} listings
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Breeds Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Approved Breeds ({cat.breeds?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.breeds?.map((b) => (
                        <span
                          key={b.id}
                          className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5"
                        >
                          <span>{b.name}</span>
                          <button
                            onClick={() => handleDeleteBreed(b.id, cat.id)}
                            title="Delete breed"
                            className="text-slate-500 hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SELLERS DIRECTORY */}
        {activeTab === 'sellers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  User & Seller Directory ({filteredSellers.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Manage accounts, suspend scam users, promote/demote roles, or delete users.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={sellerSearchQuery}
                  onChange={(e) => setSellerSearchQuery(e.target.value)}
                  placeholder="Search user name, phone, email..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-white text-sm">{seller.fullName}</h4>
                          {seller.role === 'ADMIN' && (
                            <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{seller.email}</div>
                      </div>

                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          seller.status === 'ACTIVE'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {seller.status}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3 h-3 text-green-400" />
                        <a href={`tel:${seller.phone}`} className="hover:underline text-green-400 font-bold">
                          {seller.phone}
                        </a>
                      </div>
                      <div className="text-slate-500">
                        Location: {seller.city || 'N/A'}, {seller.region || 'Ethiopia'}
                      </div>
                      <div className="text-slate-500">
                        Listings Posted: <strong className="text-slate-300">{seller._count?.listings || 0}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Seller Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSellerStatus(seller.id, seller.status)}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold text-[11px] transition ${
                        seller.status === 'ACTIVE'
                          ? 'bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800/80'
                          : 'bg-green-700 hover:bg-green-600 text-white'
                      }`}
                    >
                      {seller.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                    </button>

                    <button
                      onClick={() => handleToggleSellerRole(seller.id, seller.role)}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition"
                      title="Promote or Demote Role"
                    >
                      {seller.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                    </button>

                    <button
                      onClick={() => handleDeleteSeller(seller.id)}
                      className="py-1.5 px-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 transition"
                      title="Permanently delete user"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SAFETY REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Buyer Safety & Scam Reports ({reports.length})
              </h2>
              <p className="text-xs text-slate-400">
                User-flagged listings for suspicious behavior, wrong phone numbers, or offline sold animals.
              </p>
            </div>

            {reports.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-2">
                <ShieldCheck className="w-10 h-10 text-green-500 mx-auto" />
                <h3 className="font-bold text-white text-base">Zero Active Safety Reports</h3>
                <p className="text-xs text-slate-400">No scams or issues flagged by buyers.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-slate-900 border border-red-950 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 uppercase">
                          Reason: {report.reason}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1.5">
                          Listing: {report.listing?.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {report.description && (
                      <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                        &ldquo;{report.description}&rdquo;
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Seller: <strong className="text-slate-200">{report.listing?.seller?.fullName}</strong></div>
                      <div>Contact: {report.listing?.seller?.phone}</div>
                      {report.reporterContact && <div>Reporter: {report.reporterContact}</div>}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleUpdateListingStatus(report.listing.id, 'REMOVED')}
                        className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition"
                      >
                        Remove Listing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
