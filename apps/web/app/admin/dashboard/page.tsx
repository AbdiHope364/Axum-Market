'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  Users,
  Layers,
  MapPin,
  ExternalLink,
  Ban,
  UserCheck,
  UserPlus,
  Phone,
  Mail,
  Calendar,
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
  status: string; // ACTIVE, SUSPENDED, REJECTED
  region?: string | null;
  city?: string | null;
  createdAt: string;
  _count: { listings: number };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.status === 403 || res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data) {
        setStats(data.stats || stats);
        setPendingSellers(data.pendingSellers || []);
        setPendingItems(data.pendingItems || []);
        setReports(data.reports || []);
        setSellers(data.sellers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router, stats]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Seller Approval Handler
  const handleSellerApproval = async (sellerId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(sellerId);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/approve`, {
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

  // Listing Moderation Handler
  const handleModerate = async (listingId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(listingId);
    try {
      const res = await fetch('/api/admin/moderate', {
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

  // Seller Suspend/Reactivate Handler
  const handleSellerStatus = async (sellerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(sellerId);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            Platform Governance Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Approve seller accounts, moderate livestock classifieds, and inspect buyer reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700">
            Port: <strong>3000</strong> (Unified / Web)
          </span>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Public Site
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* Pending Sellers Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-300 shadow-sm bg-amber-50/40">
          <span className="text-xs text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-amber-600" />
            Seller Approvals
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
            {stats.pendingSellersCount}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Approved Sellers
          </span>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            {stats.totalSellers}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-green-200 shadow-sm bg-green-50/30">
          <span className="text-xs text-green-700 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Active Listings
          </span>
          <div className="text-2xl sm:text-3xl font-black text-green-700 mt-1">
            {stats.activeListings}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/30">
          <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending Listings
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
            {stats.pendingListings}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-red-200 shadow-sm bg-red-50/30">
          <span className="text-xs text-red-700 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5" />
            Reports
          </span>
          <div className="text-2xl sm:text-3xl font-black text-red-700 mt-1">
            {stats.totalReports}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('seller_approvals')}
          className={`pb-3 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
            activeTab === 'seller_approvals'
              ? 'border-amber-600 text-amber-700 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Seller Approvals</span>
          {pendingSellers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-black">
              {pendingSellers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
            activeTab === 'moderation'
              ? 'border-green-600 text-green-700 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Listing Moderation ({pendingItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
            activeTab === 'reports'
              ? 'border-red-600 text-red-700 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>User Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`pb-3 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
            activeTab === 'sellers'
              ? 'border-blue-600 text-blue-700 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Sellers ({sellers.length})</span>
        </button>
      </div>

      {/* TAB 1: Seller Approvals Queue */}
      {activeTab === 'seller_approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              New Seller Registrations Awaiting Verification
            </h2>
            <span className="text-xs text-gray-500">
              {pendingSellers.length} pending approval
            </span>
          </div>

          {pendingSellers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto" />
              <h3 className="font-bold text-gray-800 text-base">
                No pending seller registrations
              </h3>
              <p className="text-xs text-gray-500">
                All registered sellers have been approved or reviewed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                        Pending Approval
                      </span>
                      <span className="text-xs text-gray-400">
                        Registered: {new Date(seller.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-gray-900">
                      {seller.fullName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-green-600" />
                        {seller.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        {seller.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        {seller.city}, {seller.region} {seller.area ? `(${seller.area})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleSellerApproval(seller.id, 'APPROVE')}
                      disabled={actionLoading === seller.id}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Approve Seller</span>
                    </button>
                    <button
                      onClick={() => handleSellerApproval(seller.id, 'REJECT')}
                      disabled={actionLoading === seller.id}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition"
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
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto" />
              <h3 className="font-bold text-gray-800 text-base">
                Moderation queue is empty
              </h3>
              <p className="text-xs text-gray-500">
                All submitted livestock listings have been reviewed and processed.
              </p>
            </div>
          ) : (
            pendingItems.map((item) => {
              const front = item.images.find((i) => i.imageType === 'FRONT') || item.images[0];
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
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
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                            Pending Review
                          </span>
                          <span className="text-gray-500">
                            {item.category.name} {item.breed ? `• ${item.breed.name}` : ''}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-gray-900">{item.title}</h3>
                        <div className="text-xs text-gray-500 flex items-center gap-3">
                          <span className="font-black text-green-700 text-sm">
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
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                      >
                        Approve Listing
                      </button>
                      <button
                        onClick={() => handleModerate(item.id, 'REJECT')}
                        disabled={actionLoading === item.id}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* 3 Photos Inspection strip */}
                  <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
                    {item.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <Image src={img.imageUrl} alt={img.imageType} fill className="object-cover" />
                        <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
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
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Buyer Safety Reports
          </h2>
          {reports.length === 0 ? (
            <p className="text-center py-8 text-xs text-gray-500">
              No reports have been submitted.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        Reason: {r.reason}
                      </span>
                      <span className="text-xs text-gray-500">
                        Listing: {r.listing.title} ({formatPriceETB(r.listing.price)})
                      </span>
                    </div>
                    {r.description && (
                      <p className="text-xs text-gray-700 bg-white p-2.5 rounded-xl border border-gray-200">
                        &ldquo;{r.description}&rdquo;
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400">
                      Seller: {r.listing.seller.fullName} ({r.listing.seller.phone}) • Reporter Contact: {r.reporterContact || 'Anonymous'}
                    </p>
                  </div>

                  <Link
                    href={`/listings/${r.listing.id}`}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 transition shrink-0"
                  >
                    View Listing
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Sellers Directory */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Active & Verified Livestock Sellers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200">
                  <th className="pb-3 font-semibold">Seller</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Listings</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 font-bold text-gray-900">{s.fullName}</td>
                    <td className="py-3 text-gray-600 font-mono">{s.phone}</td>
                    <td className="py-3 text-gray-600">
                      {s.city || 'Sululta'}, {s.region || 'Oromia'}
                    </td>
                    <td className="py-3 font-semibold text-gray-900">
                      {s._count.listings}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          s.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
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
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
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
