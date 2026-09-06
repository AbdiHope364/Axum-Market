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
  CheckCircle2,
  Upload,
  Camera,
  Image as ImageIcon,
  Copy,
  Maximize2,
  X,
  ChevronRight,
  ChevronDown,
  Filter,
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
  weightKg?: number | null;
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
  weightKg?: number | null;
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
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard data
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
  const [listingCategoryFilter, setListingCategoryFilter] = useState('ALL');
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.message === message ? null : cur));
    }, 3500);
  };

  // Clipboard Phone Copy
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const handleCopyPhone = (phone: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    showToast(`Copied ${phone} to clipboard!`, 'info');
    setTimeout(() => {
      setCopiedPhone((cur) => (cur === phone ? null : cur));
    }, 2000);
  };

  // Inline Price Editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');

  const handleStartEditPrice = (listing: InventoryListing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPriceId(listing.id);
    setEditingPriceValue(listing.price.toString());
  };

  const handleSaveInlinePrice = async (listingId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newPrice = parseFloat(editingPriceValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      showToast('Please enter a valid price amount in ETB', 'error');
      return;
    }
    setActionLoading(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice }),
      });
      if (res.ok) {
        setAllListings((prev) =>
          prev.map((l) => (l.id === listingId ? { ...l, price: newPrice } : l))
        );
        setEditingPriceId(null);
        showToast(`Price updated to ${formatPriceETB(newPrice)}! ✓`, 'success');
        loadDashboardData();
      } else {
        showToast('Failed to update price', 'error');
      }
    } catch {
      showToast('Network error updating price', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Image Lightbox / Full Inspection Modal
  const [inspectListing, setInspectListing] = useState<any | null>(null);
  const [inspectAngle, setInspectAngle] = useState<'FRONT' | 'LEFT' | 'RIGHT'>('FRONT');

  const openInspectionModal = (listing: any, initialAngle: 'FRONT' | 'LEFT' | 'RIGHT' = 'FRONT') => {
    setInspectListing(listing);
    setInspectAngle(initialAngle);
  };

  // New Category & Breed Modal / Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🐄');
  const [newBreedName, setNewBreedName] = useState('');
  const [selectedCategoryIdForBreed, setSelectedCategoryIdForBreed] = useState('');
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);

  // Admin Create Livestock State
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postSellerId, setPostSellerId] = useState('self');
  const [postSellerDropdownOpen, setPostSellerDropdownOpen] = useState(false);
  const [postCategoryId, setPostCategoryId] = useState('');
  const [postCategoryDropdownOpen, setPostCategoryDropdownOpen] = useState(false);
  const [postBreedId, setPostBreedId] = useState('');
  const [postBreedDropdownOpen, setPostBreedDropdownOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postWeightKg, setPostWeightKg] = useState('');
  const [postAge, setPostAge] = useState('3.5 years');
  const [postGender, setPostGender] = useState<'FEMALE' | 'MALE'>('FEMALE');
  const [postRegion, setPostRegion] = useState('Oromia');
  const [postCity, setPostCity] = useState('Sululta');
  const [postArea, setPostArea] = useState('');
  const [postContactPhone, setPostContactPhone] = useState('');
  const [postStatus, setPostStatus] = useState<'ACTIVE' | 'PENDING'>('ACTIVE');
  const [postFrontUrl, setPostFrontUrl] = useState('');
  const [postLeftUrl, setPostLeftUrl] = useState('');
  const [postRightUrl, setPostRightUrl] = useState('');
  const [uploadingAngle, setUploadingAngle] = useState<string | null>(null);
  const [postFormError, setPostFormError] = useState('');
  const [postFormSuccess, setPostFormSuccess] = useState('');
  const [postSubmitting, setPostSubmitting] = useState(false);

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
        if (data.categories?.length > 0) {
          if (!selectedCategoryIdForBreed) {
            setSelectedCategoryIdForBreed(data.categories[0].id);
          }
          if (!postCategoryId) {
            setPostCategoryId(data.categories[0].id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadPhoto = async (file: File, angle: 'FRONT' | 'LEFT' | 'RIGHT') => {
    setUploadingAngle(angle);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('imageType', angle);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      const uploadedUrl = data.imageUrl || data.url;
      if (res.ok && uploadedUrl) {
        if (angle === 'FRONT') setPostFrontUrl(uploadedUrl);
        if (angle === 'LEFT') setPostLeftUrl(uploadedUrl);
        if (angle === 'RIGHT') setPostRightUrl(uploadedUrl);
        showToast(`${angle} photo uploaded successfully! ✓`, 'success');
      } else {
        showToast(data.error || 'Upload failed', 'error');
      }
    } catch {
      showToast('Network error during photo upload', 'error');
    } finally {
      setUploadingAngle(null);
    }
  };

  const handlePostLivestock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostFormError('');
    setPostFormSuccess('');

    if (!postTitle.trim() || !postPrice.trim() || !postCategoryId) {
      setPostFormError('Please fill title, price and select category.');
      return;
    }

    if (!postFrontUrl || !postLeftUrl || !postRightUrl) {
      setPostFormError('All 3 required photo angles (Front, Left, Right) must be provided.');
      return;
    }

    setPostSubmitting(true);
    try {
      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle.trim(),
          description: postDescription.trim() || 'Prime verified livestock from AxumMarket.',
          price: postPrice,
          weightKg: postWeightKg.trim() || null,
          age: postAge.trim(),
          gender: postGender,
          categoryId: postCategoryId,
          breedId: postBreedId || null,
          region: postRegion,
          city: postCity,
          area: postArea.trim() || null,
          contactPhone: postContactPhone.trim(),
          sellerId: postSellerId === 'self' ? null : postSellerId,
          status: postStatus,
          images: [
            { imageType: 'FRONT', imageUrl: postFrontUrl },
            { imageType: 'LEFT', imageUrl: postLeftUrl },
            { imageType: 'RIGHT', imageUrl: postRightUrl },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPostFormError(data.error || 'Failed to publish animal.');
        setPostSubmitting(false);
        return;
      }

      setPostFormSuccess('Livestock published successfully to AxumMarket!');
      showToast('Livestock published successfully! ✓', 'success');
      setPostSubmitting(false);
      loadDashboardData();
      setTimeout(() => {
        setPostModalOpen(false);
        setPostFormSuccess('');
        setPostTitle('');
        setPostDescription('');
        setPostPrice('');
        setPostWeightKg('');
        setPostFrontUrl('');
        setPostLeftUrl('');
        setPostRightUrl('');
      }, 1000);
    } catch {
      setPostFormError('Network error while creating listing.');
      setPostSubmitting(false);
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
      showToast(`Welcome back, ${data.user.fullName}!`, 'success');
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
    showToast('Signed out of admin session', 'info');
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
        showToast(
          action === 'APPROVE' ? 'Seller approved & activated! ✓' : 'Seller application rejected',
          action === 'APPROVE' ? 'success' : 'info'
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Listing Moderation Action
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
        if (inspectListing?.id === listingId) {
          setInspectListing(null);
        }
        setStats((prev) => ({
          ...prev,
          pendingListings: Math.max(0, prev.pendingListings - 1),
          activeListings: action === 'APPROVE' ? prev.activeListings + 1 : prev.activeListings,
        }));
        showToast(
          action === 'APPROVE' ? 'Listing approved & published live! ✓' : 'Listing rejected',
          action === 'APPROVE' ? 'success' : 'info'
        );
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
      showToast('Moderation action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Force Update Listing Status
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
        if (inspectListing?.id === listingId) {
          setInspectListing((cur: any) => cur ? { ...cur, status: newStatus } : null);
        }
        showToast(`Listing status updated to ${newStatus}! ✓`, 'success');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Listing
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
        if (inspectListing?.id === listingId) {
          setInspectListing(null);
        }
        showToast('Listing deleted successfully', 'info');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete listing', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Seller Directory Controls
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
        showToast(`Seller status updated to ${nextStatus}! ✓`, 'success');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update seller status', 'error');
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
        showToast(`User role updated to ${nextRole}! ✓`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update role', 'error');
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
        showToast('Seller account deleted', 'info');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete seller', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Category & Breed Actions
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
        showToast('New livestock category created! ✓', 'success');
      } else {
        showToast(data.error || 'Failed to create category', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error creating category', 'error');
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
        showToast('New breed registered! ✓', 'success');
      } else {
        showToast(data.error || 'Failed to create breed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error creating breed', 'error');
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
        showToast('Breed removed', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete breed', 'error');
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
          <div className="text-center space-y-3">
            <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-amber-400/80 shadow-xl shadow-amber-500/10 bg-slate-950">
              <Image
                src="/admin-logo.png"
                alt="AxumMarket Administration Logo"
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
                Platform Governance & Full Management Portal
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Admin Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@axummarket.et"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Master Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{loginLoading ? 'Signing In...' : 'Unlock Admin Portal'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // FILTERING LOGIC
  // ---------------------------------------------------------------------------
  const filteredInventoryListings = allListings.filter((l) => {
    if (listingStatusFilter !== 'ALL' && l.status !== listingStatusFilter) return false;
    if (listingCategoryFilter !== 'ALL' && l.category?.id !== listingCategoryFilter) return false;
    if (listingSearchQuery.trim()) {
      const q = listingSearchQuery.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchSeller = l.seller?.fullName?.toLowerCase().includes(q);
      const matchPhone = l.contactPhone?.includes(q) || l.seller?.phone?.includes(q);
      const matchCity = l.city?.toLowerCase().includes(q) || l.region?.toLowerCase().includes(q);
      const matchBreed = l.breed?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchSeller && !matchPhone && !matchCity && !matchBreed) return false;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification Floating Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs sm:text-sm font-bold backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/80 shadow-emerald-900/30'
                : toast.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-700/80 shadow-red-900/30'
                : 'bg-slate-900/95 text-slate-100 border-slate-700 shadow-slate-900/50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header with Admin Crest Logo */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-md bg-slate-950 shrink-0">
            <Image
              src="/admin-logo.png"
              alt="AxumMarket Admin Logo"
              fill
              sizes="(max-width: 640px) 36px, 44px"
              className="object-cover"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight truncate">
                Axum<span className="text-amber-400">Market</span>
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                Admin
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[120px] sm:max-w-none">
              <span className="hidden sm:inline">Logged in as </span>
              <strong className="text-slate-200">{sessionUser.fullName}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setPostModalOpen(true)}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-black shadow-lg shadow-emerald-900/20 transition flex items-center gap-1 sm:gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">+ Post Livestock</span>
            <span className="sm:hidden">Post</span>
          </button>
          <button
            onClick={() => {
              loadDashboardData();
              showToast('Refreshed latest data! ✓', 'info');
            }}
            title="Refresh dashboard data"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/80 text-red-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8 space-y-4 sm:space-y-6">
        {/* INTERACTIVE KPI SUMMARY CARDS (Swipeable on mobile, Grid on desktop) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Platform Quick Metrics</span>
            </span>
            <span className="text-[11px] text-amber-400/90 font-semibold sm:hidden">
              👉 Swipe cards
            </span>
            <span className="text-[11px] text-amber-400/90 font-semibold hidden sm:inline">
              ⚡ Interactive: 1-Click navigation
            </span>
          </div>

          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-1.5 snap-x">
            {/* 1. Pending Sellers */}
            <button
              onClick={() => setActiveTab('seller_approvals')}
              className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink snap-start text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
                activeTab === 'seller_approvals'
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:-translate-y-0.5'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between w-full">
                <span>Sellers</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-amber-400 my-1">
                {stats.pendingSellersCount}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 flex items-center justify-between w-full">
                <span>Review</span>
                <ArrowRight className="w-3 h-3 text-amber-400/80" />
              </div>
            </button>

            {/* 2. Pending Animals */}
            <button
              onClick={() => setActiveTab('moderation')}
              className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink snap-start text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
                activeTab === 'moderation'
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:-translate-y-0.5'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between w-full">
                <span>Approvals</span>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-amber-400 my-1">
                {stats.pendingListings}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 flex items-center justify-between w-full">
                <span>3-photo</span>
                <ArrowRight className="w-3 h-3 text-amber-400/80" />
              </div>
            </button>

            {/* 3. Live Livestock */}
            <button
              onClick={() => {
                setActiveTab('all_listings');
                setListingStatusFilter('ACTIVE');
              }}
              className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink snap-start text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
                activeTab === 'all_listings' && listingStatusFilter === 'ACTIVE'
                  ? 'bg-green-950/40 border-green-500 shadow-lg shadow-green-500/10 ring-2 ring-green-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-green-500/50 hover:-translate-y-0.5'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between w-full">
                <span>Live</span>
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-green-400 my-1">
                {stats.activeListings}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 flex items-center justify-between w-full">
                <span>On site</span>
                <ArrowRight className="w-3 h-3 text-green-400/80" />
              </div>
            </button>

            {/* 4. Sold Animals */}
            <button
              onClick={() => {
                setActiveTab('all_listings');
                setListingStatusFilter('SOLD');
              }}
              className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink snap-start text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
                activeTab === 'all_listings' && listingStatusFilter === 'SOLD'
                  ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-blue-500/50 hover:-translate-y-0.5'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between w-full">
                <span>Sold (የተሸጡ)</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-blue-400 my-1">
                {stats.soldListings}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 flex items-center justify-between w-full">
                <span>Sales</span>
                <ArrowRight className="w-3 h-3 text-blue-400/80" />
              </div>
            </button>

            {/* 5. Sellers Directory */}
            <button
              onClick={() => setActiveTab('sellers')}
              className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink snap-start text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
                activeTab === 'sellers'
                  ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-purple-500/50 hover:-translate-y-0.5'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between w-full">
                <span>All Sellers</span>
                <Users className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-purple-400 my-1">
                {stats.totalSellers}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 flex items-center justify-between w-full">
                <span>Directory</span>
                <ArrowRight className="w-3 h-3 text-purple-400/80" />
              </div>
            </button>

            {/* 6. Safety Reports */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink snap-start text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
                activeTab === 'reports'
                  ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-500/10 ring-2 ring-red-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-red-500/50 hover:-translate-y-0.5'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between w-full">
                <span>Reports</span>
                <Flag className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-red-400 my-1">
                {stats.totalReports}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 flex items-center justify-between w-full">
                <span>Scam flags</span>
                <ArrowRight className="w-3 h-3 text-red-400/80" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Active Section Indicator (md:hidden) */}
        <div className="md:hidden flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-3.5 py-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              {activeTab === 'seller_approvals' && `Seller Approvals (${pendingSellers.length})`}
              {activeTab === 'moderation' && `Listing Moderation (${pendingItems.length})`}
              {activeTab === 'all_listings' && `Livestock Inventory (${filteredInventoryListings.length})`}
              {activeTab === 'categories' && `Categories & Breeds (${categories.length})`}
              {activeTab === 'sellers' && `Sellers Directory (${filteredSellers.length})`}
              {activeTab === 'reports' && `Safety Reports (${reports.length})`}
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Managing
          </span>
        </div>

        {/* Desktop Navigation Tabs Bar (hidden on mobile, thumb bar below) */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
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
                className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
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

        {/* =================================================================== */}
        {/* TAB 1: SELLER APPROVALS */}
        {/* =================================================================== */}
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
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
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

                    {/* Contact details with 1-click tools */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-green-400 shrink-0" />
                          <span className="font-bold text-green-400">{seller.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleCopyPhone(seller.phone, e)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold flex items-center gap-1 transition"
                            title="Copy Phone Number"
                          >
                            {copiedPhone === seller.phone ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedPhone === seller.phone ? 'Copied' : 'Copy'}</span>
                          </button>
                          <a
                            href={`tel:${seller.phone}`}
                            className="px-2.5 py-1 bg-green-700/80 hover:bg-green-600 text-white rounded text-[10px] font-bold flex items-center gap-1 transition"
                            title="Direct Call"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        </div>
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
                        className="flex-1 py-2.5 px-3 rounded-xl bg-green-600 hover:bg-green-700 active:scale-98 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Seller</span>
                      </button>

                      <button
                        onClick={() => handleSellerApproval(seller.id, 'REJECT')}
                        disabled={actionLoading === seller.id}
                        className="py-2.5 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
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

        {/* =================================================================== */}
        {/* TAB 2: LISTING MODERATION */}
        {/* =================================================================== */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Livestock Listings Pending Review ({pendingItems.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Click any image to inspect full high-resolution angles before approving.
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
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div className="p-4 space-y-3">
                      {/* Photo Angles Preview (Clickable to open high-res inspector) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                          <span>3-Angle Photos</span>
                          <span className="text-amber-400 text-[10px] flex items-center gap-0.5">
                            <Maximize2 className="w-3 h-3" /> Click to inspect
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {item.images?.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => openInspectionModal(item, img.imageType as any)}
                              className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-800 group border border-slate-700 hover:border-amber-400 transition cursor-pointer"
                            >
                              <Image
                                src={img.imageUrl}
                                alt={img.imageType}
                                fill
                                sizes="120px"
                                className="object-cover group-hover:scale-105 transition"
                              />
                              <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                                {img.imageType}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-black text-green-400">
                            {formatPriceETB(item.price)}
                          </div>
                          {item.weightKg && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <span>⚖️</span>
                              <span>{item.weightKg} kg</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-white text-sm line-clamp-1">{item.title}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{item.category?.name}</span>
                          {item.breed && <span>• {item.breed.name}</span>}
                          <span>• {item.gender}</span>
                          <span>• Age: {item.age}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300">Seller: {item.seller?.fullName}</span>
                          <span className="text-slate-500">{item.city}, {item.region}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 pt-0.5">
                          <span className="font-mono text-green-400">{item.contactPhone}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleCopyPhone(item.contactPhone, e)}
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                            >
                              {copiedPhone === item.contactPhone ? '✓' : 'Copy'}
                            </button>
                            <a
                              href={`tel:${item.contactPhone}`}
                              className="px-1.5 py-0.5 bg-green-700/80 text-white rounded text-[10px]"
                            >
                              Call
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => openInspectionModal(item)}
                        className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                        title="Open full inspection lightbox"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => handleListingModeration(item.id, 'APPROVE')}
                        disabled={actionLoading === item.id}
                        className="flex-1 py-2 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Publish Live</span>
                      </button>

                      <button
                        onClick={() => handleListingModeration(item.id, 'REJECT')}
                        disabled={actionLoading === item.id}
                        className="py-2 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
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

        {/* =================================================================== */}
        {/* TAB 3: ALL LIVESTOCK INVENTORY (Full Control + Inline Price Edit) */}
        {/* =================================================================== */}
        {activeTab === 'all_listings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Full Livestock Inventory ({filteredInventoryListings.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Search, inline edit prices, update status (Active/Sold/Removed), or delete.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPostModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-sm transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Livestock</span>
                </button>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  {['ALL', 'ACTIVE', 'SOLD', 'PENDING', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setListingStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
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
            </div>

            {/* Species / Category Quick Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full -mx-3 px-3 sm:mx-0 sm:px-0 snap-x">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-400" /> Species:
              </span>
              <button
                onClick={() => setListingCategoryFilter('ALL')}
                className={`shrink-0 snap-start px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  listingCategoryFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                🐾 All Animals ({allListings.length})
              </button>
              {categories.map((cat) => {
                const count = allListings.filter((l) => l.category?.id === cat.id).length;
                const shortCatName = cat.name.replace(/\s*\/.*$/, '').replace(/\(.*?\)/, '').trim() || cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setListingCategoryFilter(cat.id)}
                    className={`shrink-0 snap-start px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      listingCategoryFilter === cat.id
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{cat.icon || '🐾'}</span>
                    <span className="hidden sm:inline">{cat.name}</span>
                    <span className="sm:hidden">{shortCatName}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={listingSearchQuery}
                onChange={(e) => setListingSearchQuery(e.target.value)}
                placeholder="Search inventory by title, seller name, phone, city, or breed..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            {filteredInventoryListings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-2">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <h3 className="font-bold text-white text-base">No Matching Livestock Found</h3>
                <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredInventoryListings.map((listing) => {
                  const frontImg = listing.images?.find((img) => img.imageType === 'FRONT') || listing.images?.[0];
                  const isEditingThisPrice = editingPriceId === listing.id;

                  return (
                    <div
                      key={listing.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition"
                    >
                      <div className="space-y-3">
                        {/* Thumbnail + Header */}
                        <div className="flex gap-3">
                          {frontImg ? (
                            <button
                              type="button"
                              onClick={() => openInspectionModal(listing)}
                              className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 group cursor-pointer"
                              title="Click to inspect all angles"
                            >
                              <Image
                                src={frontImg.imageUrl}
                                alt={listing.title}
                                fill
                                sizes="80px"
                                className="object-cover group-hover:scale-105 transition"
                              />
                              <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                                <Maximize2 className="w-4 h-4" />
                              </span>
                            </button>
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-500 text-xs">
                              No image
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
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
                              <span className="text-[10px] text-slate-500">
                                {new Date(listing.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* INLINE PRICE EDITOR */}
                            <div className="mt-1">
                              {isEditingThisPrice ? (
                                <form
                                  onSubmit={(e) => handleSaveInlinePrice(listing.id, e)}
                                  className="flex items-center gap-1"
                                >
                                  <input
                                    type="number"
                                    value={editingPriceValue}
                                    onChange={(e) => setEditingPriceValue(e.target.value)}
                                    className="w-24 bg-slate-950 border border-amber-500 text-green-400 font-black text-xs px-2 py-1 rounded outline-none"
                                    autoFocus
                                  />
                                  <button
                                    type="submit"
                                    className="p-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs"
                                    title="Save Price"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingPriceId(null)}
                                    className="p-1 bg-slate-800 text-slate-400 rounded text-xs"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </form>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-base font-black text-green-400">
                                    {formatPriceETB(listing.price)}
                                  </span>
                                  <button
                                    onClick={(e) => handleStartEditPrice(listing, e)}
                                    className="p-1 text-slate-500 hover:text-amber-400 rounded transition cursor-pointer"
                                    title="Edit Price"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {listing.weightKg && (
                              <div className="mt-0.5">
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                                  <span>⚖️</span>
                                  <span>{listing.weightKg} kg</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <h4 className="font-bold text-white text-sm line-clamp-1">{listing.title}</h4>

                        <div className="text-[11px] text-slate-400 space-y-0.5 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                          <div>Category: <strong className="text-slate-200">{listing.category?.name}</strong> {listing.breed && `(${listing.breed.name})`}</div>
                          <div className="flex items-center justify-between">
                            <span>Seller: <strong className="text-slate-200">{listing.seller?.fullName}</strong></span>
                            <button
                              onClick={(e) => handleCopyPhone(listing.contactPhone || listing.seller?.phone, e)}
                              className="text-[10px] font-mono text-green-400 hover:underline flex items-center gap-0.5"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{listing.contactPhone || listing.seller?.phone}</span>
                            </button>
                          </div>
                          <div>Location: {listing.city}, {listing.region}</div>
                        </div>
                      </div>

                      {/* Actions row */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => openInspectionModal(listing)}
                          className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>

                        {listing.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateListingStatus(listing.id, 'ACTIVE')}
                            className="py-1.5 px-2 rounded-lg bg-green-700/60 hover:bg-green-700 text-green-100 font-bold text-[11px] transition cursor-pointer"
                          >
                            Set Active
                          </button>
                        )}

                        {listing.status !== 'SOLD' && (
                          <button
                            onClick={() => handleUpdateListingStatus(listing.id, 'SOLD')}
                            className="py-1.5 px-2 rounded-lg bg-blue-700/60 hover:bg-blue-700 text-blue-100 font-bold text-[11px] transition cursor-pointer"
                          >
                            Mark Sold
                          </button>
                        )}

                        {listing.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateListingStatus(listing.id, 'REJECTED')}
                            className="py-1.5 px-2 rounded-lg bg-amber-700/60 hover:bg-amber-700 text-amber-100 font-bold text-[11px] transition cursor-pointer"
                          >
                            Reject
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="py-1.5 px-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/80 font-bold text-[11px] transition ml-auto flex items-center gap-1 cursor-pointer"
                          title="Permanently delete listing"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: CATEGORIES & BREEDS TAXONOMY */}
        {/* =================================================================== */}
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
                className="py-2 px-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
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
                    {/* Quick emoji chips */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {['🐄', '🐂', '🐑', '🐐', '🐪', '🐴', '🐔'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setNewCategoryIcon(em)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-xs"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
                    >
                      Save Category
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryFormOpen(false)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Quick Add Breed Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Add Ethiopian Breed to Category</span>
              </h3>
              <form onSubmit={handleCreateBreed} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <select
                  value={selectedCategoryIdForBreed}
                  onChange={(e) => setSelectedCategoryIdForBreed(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={newBreedName}
                  onChange={(e) => setNewBreedName(e.target.value)}
                  placeholder="Breed name, e.g. 'Hararghe Highland', 'Arsi'"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white outline-none"
                  required
                />

                <button
                  type="submit"
                  className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  + Add Breed
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{cat.icon || '🐾'}</span>
                      <div>
                        <h4 className="font-black text-white text-sm sm:text-base">{cat.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          {cat._count?.listings || 0} active marketplace listings
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Breeds Chips */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Registered Breeds ({cat.breeds?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.breeds?.map((b) => (
                        <span
                          key={b.id}
                          className="bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium py-0.5 pl-2 pr-1 rounded-lg flex items-center gap-1"
                        >
                          <span>{b.name}</span>
                          <button
                            onClick={() => handleDeleteBreed(b.id, cat.id)}
                            className="p-0.5 hover:text-red-400 text-slate-500 rounded"
                            title="Delete breed"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {(!cat.breeds || cat.breeds.length === 0) && (
                        <span className="text-xs text-slate-500 italic">No specific breeds registered yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: SELLERS DIRECTORY */}
        {/* =================================================================== */}
        {activeTab === 'sellers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Sellers & Traders Directory ({filteredSellers.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Manage accounts, toggle suspension, elevate admin roles, or delete.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={sellerSearchQuery}
                  onChange={(e) => setSellerSearchQuery(e.target.value)}
                  placeholder="Search sellers by name, phone, city..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-sm">{seller.fullName}</h4>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                            seller.role === 'ADMIN'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {seller.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Registered {new Date(seller.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        seller.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {seller.status}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                        <Phone className="w-3.5 h-3.5 text-green-400" />
                        <span>{seller.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleCopyPhone(seller.phone, e)}
                          className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]"
                        >
                          {copiedPhone === seller.phone ? '✓' : 'Copy'}
                        </button>
                        <a
                          href={`tel:${seller.phone}`}
                          className="px-1.5 py-0.5 bg-green-700/80 text-white rounded text-[10px]"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{seller.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{seller.city || 'Ethiopia'}, {seller.region || 'Nationwide'}</span>
                    </div>
                    <div className="text-[10px] text-amber-400 font-bold pt-0.5">
                      📊 {seller._count?.listings || 0} Total Listings
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleToggleSellerStatus(seller.id, seller.status)}
                      disabled={actionLoading === seller.id}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        seller.status === 'ACTIVE'
                          ? 'bg-amber-950/80 text-amber-300 hover:bg-amber-900 border border-amber-800'
                          : 'bg-green-700/80 text-white hover:bg-green-600'
                      }`}
                    >
                      {seller.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                    </button>

                    <button
                      onClick={() => handleToggleSellerRole(seller.id, seller.role)}
                      disabled={actionLoading === seller.id}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      Role: {seller.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                    </button>

                    <button
                      onClick={() => handleDeleteSeller(seller.id)}
                      disabled={actionLoading === seller.id}
                      className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800 ml-auto transition cursor-pointer"
                      title="Permanently delete seller"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 6: SAFETY REPORTS */}
        {/* =================================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Buyer Reports & Fraud Flags ({reports.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Buyer feedback regarding sold animals, wrong pricing, or suspicious listings.
                </p>
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                <h3 className="font-bold text-white text-base">No Outstanding Reports</h3>
                <p className="text-xs text-slate-400">The marketplace is healthy with zero pending flags.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-slate-900 border border-red-950/80 rounded-2xl p-5 space-y-3 shadow-sm hover:border-red-900 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                          {rep.reason}
                        </span>
                        <h4 className="font-bold text-white text-sm pt-1">
                          Listing: {rep.listing?.title || 'Unknown listing'}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="text-slate-300 italic">
                        &quot;{rep.description || 'No detailed note provided by reporter.'}&quot;
                      </div>
                      {rep.reporterContact && (
                        <div className="text-slate-400 text-[11px] pt-1">
                          Reporter Contact: <strong className="text-slate-200">{rep.reporterContact}</strong>
                        </div>
                      )}
                    </div>

                    {rep.listing && (
                      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/40 p-2.5 rounded-xl">
                        <span>Price: {formatPriceETB(rep.listing.price)}</span>
                        <span>Seller: {rep.listing.seller?.fullName} ({rep.listing.seller?.phone})</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      {rep.listing && (
                        <>
                          <button
                            onClick={() => handleUpdateListingStatus(rep.listing.id, 'REMOVED')}
                            className="py-1.5 px-3 bg-amber-700/80 hover:bg-amber-700 text-amber-100 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Take Down Listing
                          </button>
                          <button
                            onClick={() => handleDeleteListing(rep.listing.id)}
                            className="py-1.5 px-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Delete Listing
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* INTERACTIVE INSPECTION LIGHTBOX MODAL (Click any animal photo to view) */}
        {/* =================================================================== */}
        {inspectListing && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="max-w-4xl w-full bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-black text-white text-sm sm:text-base line-clamp-1">{inspectListing.title}</h3>
                    <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 sm:gap-2">
                      <span>{inspectListing.category?.name}</span>
                      {inspectListing.breed && <span>• {inspectListing.breed.name}</span>}
                      <span>• {inspectListing.gender}</span>
                      <span>• Age: {inspectListing.age}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setInspectListing(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
                {/* Left: 3-Angle Full Viewer */}
                <div className="lg:col-span-8 space-y-3">
                  {/* Angle Switcher Tabs */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {(['FRONT', 'LEFT', 'RIGHT'] as const).map((ang) => {
                      const img = inspectListing.images?.find((i: any) => i.imageType === ang);
                      const isSelected = inspectAngle === ang;
                      return (
                        <button
                          key={ang}
                          onClick={() => setInspectAngle(ang)}
                          className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {ang === 'FRONT' ? '1. Front' : ang === 'LEFT' ? '2. Left Flank' : '3. Right Flank'}
                          </span>
                          <span className="sm:hidden">
                            {ang === 'FRONT' ? 'Front' : ang === 'LEFT' ? 'Left' : 'Right'}
                          </span>
                          {img && <span className="text-[10px] opacity-80">✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Main High-Res Image Display */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner flex items-center justify-center">
                    {(() => {
                      const currentImg = inspectListing.images?.find((i: any) => i.imageType === inspectAngle);
                      if (currentImg) {
                        return (
                          <Image
                            src={currentImg.imageUrl}
                            alt={`${inspectListing.title} ${inspectAngle}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 800px"
                            className="object-contain"
                            priority
                          />
                        );
                      }
                      return (
                        <div className="text-center text-slate-500 space-y-1">
                          <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
                          <span className="text-xs">No {inspectAngle} photo uploaded for this listing</span>
                        </div>
                      );
                    })()}

                    {/* Weight overlay badge */}
                    {inspectListing.weightKg && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1">
                        <span>⚖️</span>
                        <span>{inspectListing.weightKg} kg (ኪ.ግ)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Specifications & 1-Click Verification */}
                <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="text-xl font-black text-green-400">
                        {formatPriceETB(inspectListing.price)}
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <strong className="text-slate-200">{inspectListing.status}</strong>
                        </div>
                        {inspectListing.weightKg && (
                          <div className="flex justify-between text-amber-400 font-bold">
                            <span>Live Weight:</span>
                            <span>⚖️ {inspectListing.weightKg} kg</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <strong className="text-slate-200">{inspectListing.city}, {inspectListing.region}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Listing ID:</span>
                          <span className="font-mono text-[10px] text-slate-500">{inspectListing.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Seller details card */}
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Seller Verification:
                      </span>
                      <div className="font-bold text-white text-sm">
                        {inspectListing.seller?.fullName}
                      </div>
                      <div className="flex items-center justify-between text-xs text-green-400 font-mono">
                        <span>{(inspectListing.contactPhone || inspectListing.seller?.phone || '').replace(/(\d{4})(\d{3})(\d{3,4})/, '$1 $2 $3')}</span>
                        <button
                          onClick={(e) => handleCopyPhone(inspectListing.contactPhone || inspectListing.seller?.phone, e)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-sans font-bold active:scale-95 transition"
                        >
                          {copiedPhone === (inspectListing.contactPhone || inspectListing.seller?.phone) ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="pt-1">
                        <a
                          href={`tel:${inspectListing.contactPhone || inspectListing.seller?.phone}`}
                          className="w-full py-2 bg-green-600 hover:bg-green-500 active:scale-98 text-white rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Seller</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions right inside inspector modal */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {inspectListing.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleListingModeration(inspectListing.id, 'APPROVE')}
                          className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve & Publish Live</span>
                        </button>
                        <button
                          onClick={() => handleListingModeration(inspectListing.id, 'REJECT')}
                          className="py-2.5 px-3 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {inspectListing.status !== 'SOLD' && (
                          <button
                            onClick={() => handleUpdateListingStatus(inspectListing.id, 'SOLD')}
                            className="flex-1 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Mark as Sold
                          </button>
                        )}
                        {inspectListing.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateListingStatus(inspectListing.id, 'ACTIVE')}
                            className="flex-1 py-2 bg-green-700 hover:bg-green-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteListing(inspectListing.id)}
                          className="py-2 px-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* POST LIVESTOCK MODAL (with Weight Chips & Live Buyer Preview) */}
        {/* =================================================================== */}
        {postModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto overflow-x-hidden">
            <div className="max-w-4xl w-full bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl my-0 sm:my-auto max-h-[92vh] overflow-y-auto overflow-x-hidden space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-lg font-black text-white">
                      Create & Publish Livestock
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Post directly to the live marketplace with instant verified approval.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPostModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePostLivestock} className="space-y-5 w-full max-w-full min-w-0">
                {postFormError && (
                  <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{postFormError}</span>
                  </div>
                )}

                {postFormSuccess && (
                  <div className="p-3 bg-green-950/80 border border-green-800 rounded-xl text-xs text-green-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
                    <span>{postFormSuccess}</span>
                  </div>
                )}

                {/* 3 Photos Upload Section (Top of form for fast mobile camera/gallery access) */}
                <div className="space-y-2.5 pb-4 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-white">
                        Mandatory 3 Photos (Front, Left Flank, Right Flank)
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold">* All 3 required</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      {
                        angle: 'FRONT' as const,
                        label: '1. Front View',
                        shortLabel: 'Front',
                        url: postFrontUrl,
                        setUrl: setPostFrontUrl,
                      },
                      {
                        angle: 'LEFT' as const,
                        label: '2. Left Flank',
                        shortLabel: 'Left Flank',
                        url: postLeftUrl,
                        setUrl: setPostLeftUrl,
                      },
                      {
                        angle: 'RIGHT' as const,
                        label: '3. Right Flank',
                        shortLabel: 'Right Flank',
                        url: postRightUrl,
                        setUrl: setPostRightUrl,
                      },
                    ].map((item) => (
                      <div
                        key={item.angle}
                        className="bg-slate-800/80 border border-slate-700 rounded-2xl p-2 sm:p-3 space-y-2 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] sm:text-xs font-bold text-white truncate">
                            <span className="hidden sm:inline">{item.label}</span>
                            <span className="sm:hidden">{item.shortLabel}</span>
                          </span>
                          {item.url ? (
                            <span className="text-[9px] sm:text-[10px] font-bold text-green-400">✓ Ready</span>
                          ) : (
                            <span className="text-[9px] sm:text-[10px] font-bold text-amber-400">* Req</span>
                          )}
                        </div>

                        {item.url ? (
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-600 group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => item.setUrl('')}
                              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 rounded-lg text-white transition cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500 bg-slate-900/50 flex flex-col items-center justify-center p-2 text-center text-slate-400 cursor-pointer transition hover:bg-slate-900">
                            {uploadingAngle === item.angle ? (
                              <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                            ) : (
                              <Camera className="w-5 h-5 mb-1 text-slate-400" />
                            )}
                            <span className="text-[10px] font-bold text-slate-300">
                              {uploadingAngle === item.angle ? 'Uploading...' : 'Tap to Add'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadPhoto(f, item.angle);
                              }}
                            />
                          </label>
                        )}

                        <input
                          type="text"
                          placeholder="or URL..."
                          value={item.url}
                          onChange={(e) => item.setUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 px-1.5 text-[10px] text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full max-w-full min-w-0">
                  {/* Form inputs: full width on mobile, 8 cols on desktop */}
                  <div className="md:col-span-8 space-y-4 w-full max-w-full min-w-0">
                    {/* Seller attribution */}
                    <div className="min-w-0 max-w-full">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Seller Attribution
                      </label>
                      <div className="relative w-full min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            setPostSellerDropdownOpen(!postSellerDropdownOpen);
                            setPostCategoryDropdownOpen(false);
                            setPostBreedDropdownOpen(false);
                          }}
                          className="w-full max-w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 sm:py-2 px-3 text-xs text-white flex items-center justify-between outline-none focus:border-amber-500 transition text-left cursor-pointer"
                        >
                          <span className="truncate pr-2">
                            {postSellerId === 'self'
                              ? `Axum Direct (Admin: ${sessionUser?.fullName || 'Self'})`
                              : sellers.find((s) => s.id === postSellerId)?.fullName
                                ? `${sellers.find((s) => s.id === postSellerId)?.fullName} (${sellers.find((s) => s.id === postSellerId)?.phone})`
                                : 'Select Seller'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${postSellerDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {postSellerDropdownOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 space-y-0.5 w-full max-w-full">
                            <button
                              type="button"
                              onClick={() => {
                                setPostSellerId('self');
                                setPostSellerDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between cursor-pointer ${
                                postSellerId === 'self' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span className="truncate">Axum Direct (Admin: {sessionUser?.fullName || 'Self'})</span>
                              {postSellerId === 'self' && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />}
                            </button>
                            {sellers.map((s) => {
                              const isSelected = postSellerId === s.id;
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => {
                                    setPostSellerId(s.id);
                                    setPostSellerDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between cursor-pointer ${
                                    isSelected ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <span className="truncate">{s.fullName} ({s.phone}) {s.city ? `• ${s.city}` : ''}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="min-w-0 max-w-full">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Animal Title / ስም *
                      </label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="e.g. Prime Borana Fattened Bull (የቦረና ሰንጋ በሬ)"
                        required
                        className="w-full max-w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 sm:py-2 px-3 text-base sm:text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Price & Weight in KG */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 max-w-full">
                      <div className="min-w-0">
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Price in ETB (ዋጋ) *
                        </label>
                        <input
                          type="number"
                          value={postPrice}
                          onChange={(e) => setPostPrice(e.target.value)}
                          placeholder="e.g. 185000"
                          required
                          className="w-full max-w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 sm:py-2 px-3 text-base sm:text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="min-w-0">
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Live Weight (kg) / ክብደት (ኪ.ግ)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={postWeightKg}
                          onChange={(e) => setPostWeightKg(e.target.value)}
                          placeholder="e.g. 460"
                          className="w-full max-w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 sm:py-2 px-3 text-base sm:text-xs text-white outline-none focus:border-amber-500"
                        />
                        {/* Quick weight chips */}
                        <div className="flex items-center gap-1 mt-1.5 overflow-x-auto no-scrollbar py-0.5">
                          <span className="text-[10px] text-slate-500 shrink-0">Presets:</span>
                          {[280, 350, 420, 460, 520].map((kg) => (
                            <button
                              key={kg}
                              type="button"
                              onClick={() => setPostWeightKg(kg.toString())}
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px] font-bold shrink-0"
                            >
                              {kg}kg
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Category & Breed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 max-w-full">
                      <div className="min-w-0">
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Category *
                        </label>
                        <div className="relative w-full min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              setPostCategoryDropdownOpen(!postCategoryDropdownOpen);
                              setPostSellerDropdownOpen(false);
                              setPostBreedDropdownOpen(false);
                            }}
                            className="w-full max-w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 sm:py-2 px-3 text-xs text-white flex items-center justify-between outline-none focus:border-amber-500 transition text-left cursor-pointer"
                          >
                            <span className="truncate pr-2">
                              {categories.find((c) => c.id === postCategoryId)
                                ? `${categories.find((c) => c.id === postCategoryId)?.icon || '🏷️'} ${categories.find((c) => c.id === postCategoryId)?.name.split('/')[0].trim()}`
                                : 'Select Category'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${postCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {postCategoryDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 space-y-0.5 w-full max-w-full">
                              {categories.map((c) => {
                                const isSelected = postCategoryId === c.id;
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      setPostCategoryId(c.id);
                                      setPostBreedId('');
                                      setPostCategoryDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between cursor-pointer ${
                                      isSelected ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                                  >
                                    <span className="truncate">{c.icon} {c.name.split('/')[0].trim()}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Breed (ዝርያ)
                        </label>
                        <div className="relative w-full min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              setPostBreedDropdownOpen(!postBreedDropdownOpen);
                              setPostCategoryDropdownOpen(false);
                              setPostSellerDropdownOpen(false);
                            }}
                            className="w-full max-w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 sm:py-2 px-3 text-xs text-white flex items-center justify-between outline-none focus:border-amber-500 transition text-left cursor-pointer"
                          >
                            <span className="truncate pr-2">
                              {categories.find((c) => c.id === postCategoryId)?.breeds?.find((b) => b.id === postBreedId)?.name || 'Select breed (optional)'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${postBreedDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {postBreedDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 space-y-0.5 w-full max-w-full">
                              <button
                                type="button"
                                onClick={() => {
                                  setPostBreedId('');
                                  setPostBreedDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between cursor-pointer ${
                                  !postBreedId ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <span className="truncate">None (Unspecified breed)</span>
                                {!postBreedId && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />}
                              </button>
                              {categories
                                .find((c) => c.id === postCategoryId)
                                ?.breeds?.map((b) => {
                                  const isSelected = postBreedId === b.id;
                                  return (
                                    <button
                                      key={b.id}
                                      type="button"
                                      onClick={() => {
                                        setPostBreedId(b.id);
                                        setPostBreedDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between cursor-pointer ${
                                        isSelected ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                                      }`}
                                    >
                                      <span className="truncate">{b.name}</span>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />}
                                    </button>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Age, Gender, Contact */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 min-w-0 max-w-full">
                      <div className="col-span-1 min-w-0">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Age</label>
                        <input
                          type="text"
                          value={postAge}
                          onChange={(e) => setPostAge(e.target.value)}
                          placeholder="e.g. 4 yrs"
                          className="w-full max-w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 sm:py-2 px-3 text-base sm:text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="col-span-1 min-w-0">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Gender *</label>
                        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 h-[42px] sm:h-[38px] items-center">
                          <button
                            type="button"
                            onClick={() => setPostGender('MALE')}
                            className={`h-full text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                              postGender === 'MALE'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>🐂</span>
                            <span className="truncate">Male</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPostGender('FEMALE')}
                            className={`h-full text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                              postGender === 'FEMALE'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>🐄</span>
                            <span className="truncate">Female</span>
                          </button>
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1 min-w-0">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Contact Phone *</label>
                        <input
                          type="tel"
                          value={postContactPhone}
                          onChange={(e) => setPostContactPhone(e.target.value)}
                          placeholder="e.g. 0911 234 567 or +251 91 123 4567"
                          className="w-full max-w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 sm:py-2 px-3 text-base sm:text-xs text-white outline-none font-mono focus:border-amber-500 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Buyer Preview: hidden on mobile to avoid bloat, 4 cols on desktop */}
                  <div className="hidden md:block md:col-span-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      Live Buyer Card Preview:
                    </span>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md sticky top-4">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                        {postFrontUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={postFrontUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-slate-500 text-xs">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                            Front photo preview
                          </div>
                        )}
                        {postWeightKg && (
                          <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-lg shadow">
                            ⚖️ {postWeightKg} kg
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-base font-black text-green-400">
                          {postPrice ? formatPriceETB(parseFloat(postPrice)) : '0 ETB'}
                        </div>
                        <h4 className="font-bold text-white text-xs line-clamp-1">
                          {postTitle || 'Livestock Title'}
                        </h4>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {categories.find((c) => c.id === postCategoryId)?.name || 'Livestock'} • {postCity}, {postRegion}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPostModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={postSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 cursor-pointer"
                  >
                    {postSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{postSubmitting ? 'Publishing...' : 'Publish Listing'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Fixed for thumb reach) */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-xl px-1.5 py-1.5 flex items-center justify-around shadow-2xl">
        {[
          {
            id: 'seller_approvals',
            label: 'Sellers',
            icon: Users,
            count: stats.pendingSellersCount,
            badgeColor: 'bg-amber-500 text-slate-950',
          },
          {
            id: 'moderation',
            label: 'Approvals',
            icon: Clock,
            count: stats.pendingListings,
            badgeColor: 'bg-amber-500 text-slate-950',
          },
          {
            id: 'all_listings',
            label: 'Animals',
            icon: Layers,
            count: allListings.length,
            badgeColor: 'bg-slate-700 text-slate-200',
          },
          {
            id: 'categories',
            label: 'Breeds',
            icon: Tag,
            count: categories.length,
            badgeColor: 'bg-slate-700 text-slate-200',
          },
          {
            id: 'sellers',
            label: 'Directory',
            icon: UserCheck,
            count: stats.totalSellers,
            badgeColor: 'bg-slate-700 text-slate-200',
          },
          {
            id: 'reports',
            label: 'Reports',
            icon: Flag,
            count: stats.totalReports,
            badgeColor: 'bg-red-500 text-white',
          },
        ].map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[50px] cursor-pointer ${
                isActive
                  ? 'text-amber-400 bg-amber-500/15 font-black'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center shadow-md ${item.badgeColor}`}
                  >
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
