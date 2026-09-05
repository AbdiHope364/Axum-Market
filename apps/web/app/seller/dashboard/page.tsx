'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlusCircle, CheckCircle, Clock, XCircle, Check, Trash2, ExternalLink, MapPin, AlertTriangle } from 'lucide-react';
import { formatPriceETB } from '@/lib/constants';

interface SellerListing {
  id: string;
  title: string;
  price: number;
  status: string; // ACTIVE, PENDING, REJECTED, SOLD
  rejectionReason?: string | null;
  age: string;
  gender: string;
  city: string;
  region: string;
  createdAt: string;
  category: { name: string; icon?: string | null };
  breed?: { name: string } | null;
  images: { imageUrl: string; imageType: string }[];
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (!authData?.user) {
        router.push('/seller/login');
        return;
      }
      setUser(authData.user);

      // Fetch seller's listings
      const listRes = await fetch(`/api/listings?sellerId=${authData.user.id}&status=ALL`);
      const listData = await listRes.json();
      setListings(listData.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAsSold = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SOLD' }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'SOLD' } : item))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setListings((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading Seller Dashboard...
      </div>
    );
  }

  const activeCount = listings.filter((l) => l.status === 'ACTIVE').length;
  const pendingCount = listings.filter((l) => l.status === 'PENDING').length;
  const rejectedCount = listings.filter((l) => l.status === 'REJECTED').length;
  const soldCount = listings.filter((l) => l.status === 'SOLD').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Welcome & Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
            Seller Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Welcome, {user?.fullName || 'Seller'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage your livestock classifieds, review statuses, and mark completed transactions.
          </p>
        </div>

        <Link
          href="/seller/create"
          className="w-full sm:w-auto px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md transition flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Add New Animal</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Total Listings
          </span>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            {listings.length}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-green-200 shadow-sm bg-green-50/30">
          <span className="text-xs text-green-700 font-semibold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Active
          </span>
          <div className="text-2xl sm:text-3xl font-black text-green-700 mt-1">
            {activeCount}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/30">
          <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
            {pendingCount}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
            Marked Sold
          </span>
          <div className="text-2xl sm:text-3xl font-black text-gray-700 mt-1">
            {soldCount}
          </div>
        </div>
      </div>

      {/* Listings List */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900">My Livestock Listings</h2>
          <span className="text-xs text-gray-500 font-medium">
            {listings.length} total entries
          </span>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <span className="text-4xl">🐄</span>
            <h3 className="font-bold text-gray-800 text-base">You have not posted any animals yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Get started by adding your dairy cow, bull, sheep, or goat with 3 clear photo angles.
            </p>
            <Link
              href="/seller/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-green-700"
            >
              <PlusCircle className="w-4 h-4" />
              Post Animal Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((item) => {
              const frontImg =
                item.images.find((i) => i.imageType === 'FRONT' || i.imageType === 'PROFILE') ||
                item.images[0];
              const imgUrl =
                frontImg?.imageUrl ||
                'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80';

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition bg-white"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <Image
                        src={imgUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.status === 'ACTIVE' && (
                          <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Active
                          </span>
                        )}
                        {item.status === 'PENDING' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Pending Review
                          </span>
                        )}
                        {item.status === 'REJECTED' && (
                          <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Rejected
                          </span>
                        )}
                        {item.status === 'SOLD' && (
                          <span className="bg-gray-100 text-gray-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Sold
                          </span>
                        )}
                        <span className="text-[11px] text-gray-500">
                          {item.category.name} {item.breed ? `• ${item.breed.name}` : ''}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate max-w-md">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="font-extrabold text-green-700 text-sm">
                          {formatPriceETB(item.price)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.city}
                        </span>
                      </div>

                      {item.rejectionReason && item.status === 'REJECTED' && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg mt-1 flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Reason: {item.rejectionReason}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                    {item.status !== 'SOLD' && (
                      <button
                        onClick={() => handleMarkAsSold(item.id)}
                        disabled={actionLoading === item.id}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
                      >
                        Mark Sold
                      </button>
                    )}

                    <Link
                      href={`/listings/${item.id}`}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="View public listing"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={actionLoading === item.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

