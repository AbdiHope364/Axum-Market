'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
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
  Search,
  Plus,
  Trash2,
  Tag,
  DollarSign,
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
  ArrowRight,
  Filter,
  AlertCircle,
  Eye,
  X,
  ChevronDown,
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
  milkYieldLiters?: number | null;
  hasGivenBirth?: boolean | null;
  calvingCount?: number | null;
  udderHealth?: string | null;
  isPregnant?: boolean | null;
  pregnancyMonths?: number | null;
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
  milkYieldLiters?: number | null;
  hasGivenBirth?: boolean | null;
  calvingCount?: number | null;
  udderHealth?: string | null;
  isPregnant?: boolean | null;
  pregnancyMonths?: number | null;
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Dashboard Stats
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
        fetchAdminData();
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
  const [postMilkYieldLiters, setPostMilkYieldLiters] = useState('');
  const [postHasGivenBirth, setPostHasGivenBirth] = useState<boolean | null>(null);
  const [postCalvingCount, setPostCalvingCount] = useState('');
  const [postUdderHealth, setPostUdderHealth] = useState('');
  const [postIsPregnant, setPostIsPregnant] = useState<boolean | null>(null);
  const [postPregnancyMonths, setPostPregnancyMonths] = useState('');
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
    } finally {
      setLoading(false);
    }
  }, [router, stats, selectedCategoryIdForBreed, postCategoryId]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Enforce 5-minute inactivity timeout
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    lastActivityRef.current = Date.now();
    
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });

    const interval = setInterval(async () => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= 5 * 60 * 1000) {
        clearInterval(interval);
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        router.push('/admin/login');
      }
    }, 5000); // Check every 5 seconds instead of setting timeouts on every mouse move

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [router]);

  // Photo Upload Handler
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

  // Post Livestock Handler
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

    if (postIsPregnant === true && !postPregnancyMonths) {
      setPostFormError('Please specify the exact pregnancy duration in months (1-9 months) for the pregnant cow.');
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
          milkYieldLiters: postMilkYieldLiters.trim() || null,
          hasGivenBirth: postHasGivenBirth,
          calvingCount: postCalvingCount !== '' ? parseInt(postCalvingCount, 10) : null,
          udderHealth: postUdderHealth.trim() || null,
          isPregnant: postIsPregnant,
          pregnancyMonths: postPregnancyMonths !== '' ? parseInt(postPregnancyMonths, 10) : null,
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
      fetchAdminData();
      setTimeout(() => {
        setPostModalOpen(false);
        setPostFormSuccess('');
        setPostTitle('');
        setPostDescription('');
        setPostPrice('');
        setPostWeightKg('');
        setPostMilkYieldLiters('');
        setPostHasGivenBirth(null);
        setPostCalvingCount('');
        setPostUdderHealth('');
        setPostIsPregnant(null);
        setPostPregnancyMonths('');
        setPostFrontUrl('');
        setPostLeftUrl('');
        setPostRightUrl('');
      }, 1000);
    } catch {
      setPostFormError('Network error while creating listing.');
      setPostSubmitting(false);
    }
  };

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
        fetchAdminData();
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
          setInspectListing((cur: any) => (cur ? { ...cur, status: newStatus } : null));
        }
        showToast(`Listing status updated to ${newStatus}! ✓`, 'success');
        fetchAdminData();
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
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete listing', 'error');
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
        showToast(`Seller status updated to ${nextStatus}! ✓`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update seller status', 'error');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-500">Loading admin operations center...</p>
        </div>
      </div>
    );
  }

  // Filtered inventory & sellers
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 space-y-4 sm:space-y-6">
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

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-4 sm:pb-5">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-black text-gray-900 flex items-center gap-1.5 sm:gap-2 truncate">
            <span>🛡️</span>
            <span className="truncate">Platform Governance & Admin</span>
          </h1>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5 truncate">
            Real-time management for Ethiopian livestock, verified sellers, and platform health.
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setPostModalOpen(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 text-white text-xs font-black shadow-md transition flex items-center gap-1 sm:gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">+ Post Livestock</span>
            <span className="sm:hidden">Post</span>
          </button>
          <button
            onClick={() => {
              fetchAdminData();
              showToast('Refreshed latest data! ✓', 'info');
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* INTERACTIVE KPI SUMMARY CARDS (Swipeable carousel on mobile, grid on desktop) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span>Quick Metric Filters (Click card to view)</span>
          <span className="text-green-700 font-semibold sm:hidden">👉 Swipe cards</span>
          <span className="text-green-700 font-semibold hidden sm:inline">⚡ 1-Click Navigation</span>
        </div>

        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 overflow-x-auto no-scrollbar w-full max-w-full py-1">
          {/* 1. Pending Sellers */}
          <button
            onClick={() => setActiveTab('seller_approvals')}
            className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
              activeTab === 'seller_approvals'
                ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                : 'bg-white border-gray-200 hover:border-amber-400 hover:-translate-y-0.5 shadow-sm'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between w-full">
              <span>Sellers</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 my-1">{stats.pendingSellersCount}</div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 flex items-center justify-between w-full">
              <span>Awaiting</span>
              <ArrowRight className="w-3 h-3 text-amber-500" />
            </div>
          </button>

          {/* 2. Pending Animals */}
          <button
            onClick={() => setActiveTab('moderation')}
            className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
              activeTab === 'moderation'
                ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                : 'bg-white border-gray-200 hover:border-amber-400 hover:-translate-y-0.5 shadow-sm'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between w-full">
              <span>Animals</span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 my-1">{stats.pendingListings}</div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 flex items-center justify-between w-full">
              <span>3-photo</span>
              <ArrowRight className="w-3 h-3 text-amber-500" />
            </div>
          </button>

          {/* 3. Live Livestock */}
          <button
            onClick={() => {
              setActiveTab('all_listings');
              setListingStatusFilter('ACTIVE');
            }}
            className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
              activeTab === 'all_listings' && listingStatusFilter === 'ACTIVE'
                ? 'bg-green-50 border-green-500 shadow-md ring-2 ring-green-500/40'
                : 'bg-white border-gray-200 hover:border-green-500 hover:-translate-y-0.5 shadow-sm'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between w-full">
              <span>Live</span>
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-green-700 my-1">{stats.activeListings}</div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 flex items-center justify-between w-full">
              <span>Active</span>
              <ArrowRight className="w-3 h-3 text-green-600" />
            </div>
          </button>

          {/* 4. Sold Animals */}
          <button
            onClick={() => {
              setActiveTab('all_listings');
              setListingStatusFilter('SOLD');
            }}
            className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
              activeTab === 'all_listings' && listingStatusFilter === 'SOLD'
                ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-500/40'
                : 'bg-white border-gray-200 hover:border-blue-500 hover:-translate-y-0.5 shadow-sm'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between w-full">
              <span>Sold</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-700 my-1">{stats.soldListings}</div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 flex items-center justify-between w-full">
              <span>Completed</span>
              <ArrowRight className="w-3 h-3 text-blue-600" />
            </div>
          </button>

          {/* 5. Sellers */}
          <button
            onClick={() => setActiveTab('sellers')}
            className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
              activeTab === 'sellers'
                ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-500/40'
                : 'bg-white border-gray-200 hover:border-purple-500 hover:-translate-y-0.5 shadow-sm'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between w-full">
              <span>Directory</span>
              <Users className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-700 my-1">{stats.totalSellers}</div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 flex items-center justify-between w-full">
              <span>Base</span>
              <ArrowRight className="w-3 h-3 text-purple-600" />
            </div>
          </button>

          {/* 6. Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`min-w-[130px] max-w-[155px] sm:min-w-0 sm:max-w-none shrink-0 sm:shrink text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between border ${
              activeTab === 'reports'
                ? 'bg-red-50 border-red-500 shadow-md ring-2 ring-red-500/40'
                : 'bg-white border-gray-200 hover:border-red-500 hover:-translate-y-0.5 shadow-sm'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between w-full">
              <span>Reports</span>
              <Flag className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-600 my-1">{stats.totalReports}</div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 flex items-center justify-between w-full">
              <span>Scam alerts</span>
              <ArrowRight className="w-3 h-3 text-red-600" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Active Section Indicator (md:hidden) */}
      <div className="md:hidden flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-3.5 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
          <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
            {activeTab === 'seller_approvals' && `Seller Approvals (${pendingSellers.length})`}
            {activeTab === 'moderation' && `Listing Moderation (${pendingItems.length})`}
            {activeTab === 'all_listings' && `Livestock Inventory (${filteredInventoryListings.length})`}
            {activeTab === 'categories' && `Categories & Breeds (${categories.length})`}
            {activeTab === 'sellers' && `Sellers Directory (${filteredSellers.length})`}
            {activeTab === 'reports' && `Safety Reports (${reports.length})`}
          </span>
        </div>
        <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
          Managing
        </span>
      </div>

      {/* Desktop Tabs (hidden md:flex) */}
      <div className="hidden md:flex items-center gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'seller_approvals', label: 'Seller Approvals', count: stats.pendingSellersCount },
          { id: 'moderation', label: 'Listing Moderation', count: stats.pendingListings },
          { id: 'all_listings', label: 'Livestock Inventory', count: allListings.length },
          { id: 'categories', label: 'Categories & Breeds', count: categories.length },
          { id: 'sellers', label: 'Sellers Directory', count: stats.totalSellers },
          { id: 'reports', label: 'Reports', count: stats.totalReports },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'border-green-700 text-green-700 font-black'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
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
          <h2 className="text-base font-bold text-gray-900">
            Pending Seller Applications ({pendingSellers.length})
          </h2>

          {pendingSellers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-gray-800">No pending seller registrations.</p>
              <p className="text-xs text-gray-500">All applications have been processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Awaiting Approval
                      </span>
                      <h3 className="font-bold text-gray-900 text-base mt-1">{seller.fullName}</h3>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>
                          {seller.city}, {seller.region} {seller.area ? `(${seller.area})` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <Phone className="w-3.5 h-3.5 text-green-600" />
                        <span>{seller.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleCopyPhone(seller.phone, e)}
                          className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold hover:bg-gray-100"
                        >
                          {copiedPhone === seller.phone ? '✓ Copied' : 'Copy'}
                        </button>
                        <a
                          href={`tel:${seller.phone}`}
                          className="px-2.5 py-0.5 bg-green-700 text-white rounded text-[10px] font-bold hover:bg-green-600"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                    <div className="text-gray-500 truncate">{seller.email}</div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSellerApproval(seller.id, 'APPROVE')}
                      disabled={actionLoading === seller.id}
                      className="flex-1 py-2 px-3 rounded-xl bg-green-700 hover:bg-green-800 active:scale-95 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Seller</span>
                    </button>
                    <button
                      onClick={() => handleSellerApproval(seller.id, 'REJECT')}
                      disabled={actionLoading === seller.id}
                      className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs transition cursor-pointer"
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

      {/* TAB 2: LISTING MODERATION */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900">
            Pending Livestock Moderation ({pendingItems.length})
          </h2>

          {pendingItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-gray-800">No pending listings.</p>
              <p className="text-xs text-gray-500">All submitted animals are up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-gray-300 transition"
                >
                  <div className="p-4 space-y-3">
                    {/* 3 Photos Thumbnails (Clickable to inspect) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                        <span>3-Angle Photos</span>
                        <span className="text-green-700 text-[10px] flex items-center gap-0.5">
                          <Maximize2 className="w-3 h-3" /> Click to inspect
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {item.images?.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => openInspectionModal(item, img.imageType as any)}
                            className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 group border border-gray-200 hover:border-green-600 transition cursor-pointer"
                          >
                            <Image
                              src={img.imageUrl}
                              alt={img.imageType}
                              fill
                              sizes="120px"
                              className="object-cover group-hover:scale-105 transition"
                            />
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                              {img.imageType}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-base font-black text-green-800">
                          {formatPriceETB(item.price)}
                        </div>
                        {item.weightKg && (
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <span>⚖️</span>
                            <span>{item.weightKg} kg</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{item.title}</h3>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.category?.name} {item.breed && `• ${item.breed.name}`} • {item.gender} • {item.age}
                      </div>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Seller: <strong className="text-gray-900">{item.seller?.fullName}</strong></span>
                        <span className="text-gray-400">{item.city}</span>
                      </div>
                      <div className="flex items-center justify-between text-green-700 font-mono text-[11px] pt-0.5">
                        <span>{item.contactPhone}</span>
                        <button
                          onClick={(e) => handleCopyPhone(item.contactPhone, e)}
                          className="text-[10px] px-1.5 py-0.2 bg-white border border-gray-200 rounded font-sans"
                        >
                          {copiedPhone === item.contactPhone ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center gap-2">
                    <button
                      onClick={() => openInspectionModal(item)}
                      className="py-2 px-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => handleModerate(item.id, 'APPROVE')}
                      disabled={actionLoading === item.id}
                      className="flex-1 py-2 px-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Publish Live</span>
                    </button>
                    <button
                      onClick={() => handleModerate(item.id, 'REJECT')}
                      disabled={actionLoading === item.id}
                      className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs transition cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVESTOCK INVENTORY */}
      {activeTab === 'all_listings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900">
                Full Livestock Inventory ({filteredInventoryListings.length})
              </h2>
              <p className="text-xs text-gray-500">
                Search, inline edit prices, update status (Active/Sold/Removed), or delete.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPostModalOpen(true)}
                className="px-3.5 py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-black rounded-xl shadow-sm transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Livestock</span>
              </button>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
                {['ALL', 'ACTIVE', 'SOLD', 'PENDING', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setListingStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      listingStatusFilter === st
                        ? 'bg-white text-green-800 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Species / Category Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full max-w-full snap-x">
            <span className="text-[11px] font-bold text-gray-500 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-green-700" /> Species:
            </span>
            <button
              onClick={() => setListingCategoryFilter('ALL')}
              className={`shrink-0 snap-start px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                listingCategoryFilter === 'ALL'
                  ? 'bg-green-700 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
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
                      ? 'bg-green-700 text-white shadow'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
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
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={listingSearchQuery}
              onChange={(e) => setListingSearchQuery(e.target.value)}
              placeholder="Search inventory by title, seller name, phone, city, or breed..."
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-green-600 shadow-sm"
            />
          </div>

          {filteredInventoryListings.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-2">
              <Search className="w-8 h-8 text-gray-400 mx-auto" />
              <h3 className="font-bold text-gray-800 text-base">No Matching Livestock Found</h3>
              <p className="text-xs text-gray-500">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredInventoryListings.map((listing) => {
                const frontImg = listing.images?.find((img) => img.imageType === 'FRONT') || listing.images?.[0];
                const isEditingThisPrice = editingPriceId === listing.id;

                return (
                  <div
                    key={listing.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-gray-300 shadow-sm transition"
                  >
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        {frontImg ? (
                          <button
                            type="button"
                            onClick={() => openInspectionModal(listing)}
                            className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 group cursor-pointer"
                            title="Click to inspect all angles"
                          >
                            <Image
                              src={frontImg.imageUrl}
                              alt={listing.title}
                              fill
                              sizes="80px"
                              className="object-cover group-hover:scale-105 transition"
                            />
                            <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                              <Maximize2 className="w-4 h-4" />
                            </span>
                          </button>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-gray-400 text-xs">
                            No image
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                listing.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : listing.status === 'SOLD'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : listing.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}
                            >
                              {listing.status}
                            </span>
                            <span className="text-[10px] text-gray-400">
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
                                  className="w-24 bg-white border border-green-600 text-green-800 font-black text-xs px-2 py-1 rounded outline-none"
                                  autoFocus
                                />
                                <button
                                  type="submit"
                                  className="p-1 bg-green-700 hover:bg-green-600 text-white rounded text-xs"
                                  title="Save Price"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPriceId(null)}
                                  className="p-1 bg-gray-200 text-gray-600 rounded text-xs"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </form>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-base font-black text-green-800">
                                  {formatPriceETB(listing.price)}
                                </span>
                                <button
                                  onClick={(e) => handleStartEditPrice(listing, e)}
                                  className="p-1 text-gray-400 hover:text-green-700 rounded transition cursor-pointer"
                                  title="Edit Price"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {listing.weightKg && (
                            <div className="mt-0.5">
                              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                                <span>⚖️</span>
                                <span>{listing.weightKg} kg</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{listing.title}</h4>

                      <div className="text-[11px] text-gray-600 space-y-0.5 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <div>Category: <strong className="text-gray-900">{listing.category?.name}</strong> {listing.breed && `(${listing.breed.name})`}</div>
                        <div className="flex items-center justify-between">
                          <span>Seller: <strong className="text-gray-900">{listing.seller?.fullName}</strong></span>
                          <button
                            onClick={(e) => handleCopyPhone(listing.contactPhone || listing.seller?.phone, e)}
                            className="text-[10px] font-mono text-green-700 hover:underline flex items-center gap-0.5"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            <span>{listing.contactPhone || listing.seller?.phone}</span>
                          </button>
                        </div>
                        <div>Location: {listing.city}, {listing.region}</div>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => openInspectionModal(listing)}
                        className="py-1.5 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>

                      {listing.status !== 'ACTIVE' && (
                        <button
                          onClick={() => handleUpdateListingStatus(listing.id, 'ACTIVE')}
                          className="py-1.5 px-2.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-800 font-bold text-[11px] transition cursor-pointer"
                        >
                          Set Active
                        </button>
                      )}

                      {listing.status !== 'SOLD' && (
                        <button
                          onClick={() => handleUpdateListingStatus(listing.id, 'SOLD')}
                          className="py-1.5 px-2.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[11px] transition cursor-pointer"
                        >
                          Mark Sold
                        </button>
                      )}

                      {listing.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateListingStatus(listing.id, 'REJECTED')}
                          className="py-1.5 px-2.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[11px] transition cursor-pointer"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        className="py-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-[11px] transition ml-auto flex items-center gap-1 cursor-pointer"
                        title="Delete listing"
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

      {/* TAB 4: CATEGORIES & BREEDS */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900">
                Livestock Taxonomy & Breeds
              </h2>
              <p className="text-xs text-gray-500">
                Manage animal categories and verified Ethiopian breeds.
              </p>
            </div>

            <button
              onClick={() => setCategoryFormOpen(!categoryFormOpen)}
              className="py-2 px-3.5 bg-green-700 hover:bg-green-800 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {categoryFormOpen && (
            <form
              onSubmit={handleCreateCategory}
              className="bg-white border border-green-600 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md"
            >
              <h3 className="font-black text-sm text-gray-900">Add New Livestock Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Camels (ግመሎች)"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-900 outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    placeholder="e.g. 🐪, 🐴, 🐔"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-900 outline-none focus:border-green-600"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {['🐄', '🐂', '🐑', '🐐', '🐪', '🐴', '🐔'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewCategoryIcon(em)}
                        className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="py-2 px-4 bg-green-700 hover:bg-green-800 text-white font-black text-xs rounded-xl transition cursor-pointer"
                  >
                    Save Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFormOpen(false)}
                    className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Add Breed Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
            <h3 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-green-700" />
              <span>Add Ethiopian Breed to Category</span>
            </h3>
            <form onSubmit={handleCreateBreed} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <select
                value={selectedCategoryIdForBreed}
                onChange={(e) => setSelectedCategoryIdForBreed(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-900 outline-none"
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
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-900 outline-none"
                required
              />

              <button
                type="submit"
                className="py-2 px-4 bg-green-700 hover:bg-green-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                + Add Breed
              </button>
            </form>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{cat.icon || '🐾'}</span>
                  <div>
                    <h4 className="font-black text-gray-900 text-base">{cat.name}</h4>
                    <span className="text-[10px] text-gray-400">
                      {cat._count?.listings || 0} active marketplace listings
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Registered Breeds ({cat.breeds?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.breeds?.map((b) => (
                      <span
                        key={b.id}
                        className="bg-gray-100 text-gray-700 border border-gray-200 text-[11px] font-medium py-0.5 pl-2 pr-1 rounded-lg flex items-center gap-1"
                      >
                        <span>{b.name}</span>
                        <button
                          onClick={() => handleDeleteBreed(b.id, cat.id)}
                          className="p-0.5 hover:text-red-600 text-gray-400 rounded"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(!cat.breeds || cat.breeds.length === 0) && (
                      <span className="text-xs text-gray-400 italic">No specific breeds registered yet.</span>
                    )}
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
              <h2 className="text-base sm:text-lg font-black text-gray-900">
                Sellers & Traders Directory ({filteredSellers.length})
              </h2>
              <p className="text-xs text-gray-500">
                Manage accounts, toggle suspension, or view direct contact information.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={sellerSearchQuery}
                onChange={(e) => setSellerSearchQuery(e.target.value)}
                placeholder="Search sellers by name, phone, city..."
                className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-900 outline-none focus:border-green-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm hover:border-gray-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{seller.fullName}</h4>
                    <span className="text-[10px] text-gray-400 block">
                      Registered {new Date(seller.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      seller.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {seller.status}
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-xl text-xs space-y-1.5 text-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-900 font-mono">
                      <Phone className="w-3.5 h-3.5 text-green-600" />
                      <span>{seller.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleCopyPhone(seller.phone, e)}
                        className="px-1.5 py-0.5 bg-white border border-gray-200 text-gray-600 rounded text-[10px]"
                      >
                        {copiedPhone === seller.phone ? '✓' : 'Copy'}
                      </button>
                      <a
                        href={`tel:${seller.phone}`}
                        className="px-1.5 py-0.5 bg-green-700 text-white rounded text-[10px]"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                  <div className="text-gray-500 truncate">{seller.email}</div>
                  <div className="text-gray-500">
                    {seller.city || 'Ethiopia'}, {seller.region || 'Nationwide'}
                  </div>
                  <div className="text-[10px] text-green-800 font-bold pt-0.5">
                    📊 {seller._count?.listings || 0} Total Listings
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => handleSellerStatus(seller.id, seller.status)}
                    disabled={actionLoading === seller.id}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                      seller.status === 'ACTIVE'
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-green-700 text-white hover:bg-green-800'
                    }`}
                  >
                    {seller.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900">
            Safety & Scam Reports ({reports.length})
          </h2>

          {reports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-gray-800">No active reports.</p>
              <p className="text-xs text-gray-500">Marketplace is running smoothly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white border border-red-200 rounded-2xl p-5 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-red-100 text-red-800 rounded">
                        {rep.reason}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm mt-1">
                        Listing: {rep.listing?.title || 'Unknown'}
                      </h4>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                    <p className="text-gray-700 italic">
                      &quot;{rep.description || 'No notes provided.'}&quot;
                    </p>
                    {rep.reporterContact && (
                      <p className="text-gray-500 text-[11px]">
                        Reporter Contact: {rep.reporterContact}
                      </p>
                    )}
                  </div>

                  {rep.listing && (
                    <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-100 p-2.5 rounded-xl">
                      <span>Price: {formatPriceETB(rep.listing.price)}</span>
                      <span>Seller: {rep.listing.seller?.fullName}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                    {rep.listing && (
                      <button
                        onClick={() => handleDeleteListing(rep.listing.id)}
                        className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Delete Listing
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* INTERACTIVE INSPECTION LIGHTBOX MODAL */}
      {/* =================================================================== */}
      {inspectListing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="max-w-4xl w-full bg-white border-t sm:border border-gray-200 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-3.5 sm:p-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-green-100 text-green-800 rounded-lg">
                  <Eye className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-black text-gray-900 text-sm sm:text-base line-clamp-1">{inspectListing.title}</h3>
                  <div className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1.5 sm:gap-2">
                    <span>{inspectListing.category?.name}</span>
                    {inspectListing.breed && <span>• {inspectListing.breed.name}</span>}
                    <span>• {inspectListing.gender}</span>
                    <span>• Age: {inspectListing.age}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectListing(null)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
              {/* Left: 3-Angle Full Viewer */}
              <div className="lg:col-span-8 space-y-3">
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
                            ? 'bg-green-700 text-white border-green-700 font-black shadow'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
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

                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-gray-200 shadow-inner flex items-center justify-center">
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
                      <div className="text-center text-gray-400 space-y-1">
                        <ImageIcon className="w-8 h-8 mx-auto text-gray-500" />
                        <span className="text-xs">No {inspectAngle} photo uploaded</span>
                      </div>
                    );
                  })()}

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
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <div className="text-xl font-black text-green-800">
                      {formatPriceETB(inspectListing.price)}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <strong className="text-gray-900">{inspectListing.status}</strong>
                      </div>
                      {inspectListing.weightKg && (
                        <div className="flex justify-between text-amber-700 font-bold">
                          <span>Live Weight:</span>
                          <span>⚖️ {inspectListing.weightKg} kg</span>
                        </div>
                      )}
                      {inspectListing.milkYieldLiters && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Daily Milk Yield:</span>
                          <span>🥛 {inspectListing.milkYieldLiters} L/day</span>
                        </div>
                      )}
                      {(inspectListing.calvingCount !== null && inspectListing.calvingCount !== undefined) && (
                        <div className="flex justify-between text-gray-700">
                          <span>Calving History:</span>
                          <span>{inspectListing.calvingCount === 0 ? 'Heifer (0)' : `${inspectListing.calvingCount} Calvings`}</span>
                        </div>
                      )}
                      {inspectListing.udderHealth && (
                        <div className="flex justify-between text-gray-700">
                          <span>Udder Health:</span>
                          <span className="truncate max-w-[150px]" title={inspectListing.udderHealth}>{inspectListing.udderHealth}</span>
                        </div>
                      )}
                      {inspectListing.isPregnant !== null && inspectListing.isPregnant !== undefined && (
                        <div className="flex justify-between text-purple-700">
                          <span>Pregnancy:</span>
                          <span>{inspectListing.isPregnant ? `Pregnant (${inspectListing.pregnancyMonths ? `${inspectListing.pregnancyMonths} Mo` : 'In-Calf'})` : 'Not Pregnant'}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <strong className="text-gray-900">{inspectListing.city}, {inspectListing.region}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                      Seller Verification:
                    </span>
                    <div className="font-bold text-gray-900 text-sm">
                      {inspectListing.seller?.fullName}
                    </div>
                    <div className="flex items-center justify-between text-xs text-green-800 font-mono">
                      <span>{(inspectListing.contactPhone || inspectListing.seller?.phone || '').replace(/(\d{4})(\d{3})(\d{3,4})/, '$1 $2 $3')}</span>
                      <button
                        onClick={(e) => handleCopyPhone(inspectListing.contactPhone || inspectListing.seller?.phone, e)}
                        className="px-2 py-0.5 bg-white border border-gray-200 text-gray-700 rounded text-[10px] font-sans font-bold active:scale-95 transition"
                      >
                        {copiedPhone === (inspectListing.contactPhone || inspectListing.seller?.phone) ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="pt-1">
                      <a
                        href={`tel:${inspectListing.contactPhone || inspectListing.seller?.phone}`}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 active:scale-98 text-white rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Seller</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-200">
                  {inspectListing.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleModerate(inspectListing.id, 'APPROVE')}
                        className="flex-1 py-2.5 bg-green-700 hover:bg-green-600 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve & Publish Live</span>
                      </button>
                      <button
                        onClick={() => handleModerate(inspectListing.id, 'REJECT')}
                        className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
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
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
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
                        className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs rounded-xl transition cursor-pointer"
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
      {/* POST LIVESTOCK MODAL */}
      {/* =================================================================== */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-4xl w-full bg-white border-t sm:border border-gray-200 rounded-t-3xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl my-0 sm:my-auto max-h-[92vh] overflow-y-auto overflow-x-hidden space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-xl bg-green-100 text-green-800">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-lg font-black text-gray-900">
                    Create & Publish Livestock
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-500">
                    Post directly to the live marketplace with instant verified approval.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPostModalOpen(false)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostLivestock} className="space-y-5 w-full max-w-full min-w-0">
              {postFormError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{postFormError}</span>
                </div>
              )}

              {postFormSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                  <span>{postFormSuccess}</span>
                </div>
              )}

              {/* 3 Photos Upload Section (Top of form for fast mobile camera/gallery access) */}
              <div className="space-y-2.5 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-green-700" />
                    <span className="text-xs font-black text-gray-900">
                      Mandatory 3 Photos (Front, Left Flank, Right Flank)
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-bold">* All 3 required</span>
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
                      className="bg-gray-50 border border-gray-200 rounded-2xl p-2 sm:p-3 space-y-2 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] sm:text-xs font-bold text-gray-900 truncate">
                          <span className="hidden sm:inline">{item.label}</span>
                          <span className="sm:hidden">{item.shortLabel}</span>
                        </span>
                        {item.url ? (
                          <span className="text-[9px] sm:text-[10px] font-bold text-green-600">✓ Ready</span>
                        ) : (
                          <span className="text-[9px] sm:text-[10px] font-bold text-amber-600">* Req</span>
                        )}
                      </div>

                      {item.url ? (
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-300 group">
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
                        <label className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 hover:border-green-600 bg-white flex flex-col items-center justify-center p-2 text-center text-gray-400 cursor-pointer transition hover:bg-gray-50">
                          {uploadingAngle === item.angle ? (
                            <RefreshCw className="w-5 h-5 text-green-600 animate-spin" />
                          ) : (
                            <Camera className="w-5 h-5 mb-1 text-gray-500" />
                          )}
                          <span className="text-[10px] font-bold text-gray-600">
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
                        className="w-full bg-white border border-gray-200 rounded-lg py-1 px-1.5 text-[10px] text-gray-900 outline-none focus:border-green-600"
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
                    <label className="block text-xs font-bold text-gray-700 mb-1">
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
                        className="w-full max-w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-2 px-3 text-xs text-gray-900 flex items-center justify-between outline-none focus:border-green-600 transition text-left cursor-pointer"
                      >
                        <span className="truncate pr-2">
                          {postSellerId === 'self'
                            ? 'Axum Direct (Admin account)'
                            : sellers.find((s) => s.id === postSellerId)?.fullName
                              ? `${sellers.find((s) => s.id === postSellerId)?.fullName} (${sellers.find((s) => s.id === postSellerId)?.phone})`
                              : 'Select Seller'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${postSellerDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {postSellerDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl p-1 space-y-0.5 w-full max-w-full">
                          <button
                            type="button"
                            onClick={() => {
                              setPostSellerId('self');
                              setPostSellerDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between cursor-pointer ${
                              postSellerId === 'self' ? 'bg-green-50 text-green-800 font-bold' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="truncate">Axum Direct (Admin account)</span>
                            {postSellerId === 'self' && <Check className="w-3.5 h-3.5 text-green-600 shrink-0 ml-2" />}
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
                                  isSelected ? 'bg-green-50 text-green-800 font-bold' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <span className="truncate">{s.fullName} ({s.phone}) {s.city ? `• ${s.city}` : ''}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-green-600 shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="min-w-0 max-w-full">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Animal Title / ስም *
                    </label>
                    <input
                      type="text"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="e.g. Prime Borana Fattened Bull (የቦረና ሰንጋ በሬ)"
                      required
                      className="w-full max-w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-2 px-3 text-base sm:text-xs text-gray-900 outline-none focus:border-green-600"
                    />
                  </div>

                  {/* Price & Weight in KG */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 max-w-full">
                    <div className="min-w-0">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Price in ETB (ዋጋ) *
                      </label>
                      <input
                        type="number"
                        value={postPrice}
                        onChange={(e) => setPostPrice(e.target.value)}
                        placeholder="e.g. 185000"
                        required
                        className="w-full max-w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-2 px-3 text-base sm:text-xs text-gray-900 outline-none focus:border-green-600"
                      />
                    </div>

                    <div className="min-w-0">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Live Weight (kg) / ክብደት (ኪ.ግ)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={postWeightKg}
                        onChange={(e) => setPostWeightKg(e.target.value)}
                        placeholder="e.g. 460"
                        className="w-full max-w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-2 px-3 text-base sm:text-xs text-gray-900 outline-none focus:border-green-600"
                      />
                      <div className="flex items-center gap-1 mt-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <span className="text-[10px] text-gray-400 shrink-0">Presets:</span>
                        {[280, 350, 420, 460, 520].map((kg) => (
                          <button
                            key={kg}
                            type="button"
                            onClick={() => setPostWeightKg(kg.toString())}
                            className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-amber-800 rounded text-[10px] font-bold shrink-0"
                          >
                            {kg}kg
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category & Breed */}
                  <div className="space-y-3 min-w-0 max-w-full">
                    <div className="min-w-0">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                        <span>Category (የእንስሳት አይነት) *</span>
                        {categories.find((c) => c.id === postCategoryId) && (
                          <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                            {categories.find((c) => c.id === postCategoryId)?.icon} {categories.find((c) => c.id === postCategoryId)?.name.split('/')[0].trim()}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-full">
                        {categories.map((c) => {
                          const isSelected = postCategoryId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setPostCategoryId(c.id);
                                setPostBreedId('');
                              }}
                              className={`py-2 px-2.5 rounded-xl text-left border transition-all active:scale-95 flex items-center justify-between min-w-0 cursor-pointer overflow-hidden ${
                                isSelected
                                  ? 'bg-green-50 border-green-600 text-green-900 font-bold shadow-xs ring-1 ring-green-600/30'
                                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                              }`}
                            >
                              <span className="text-xs truncate">{c.icon} {c.name.split('/')[0].trim()}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-green-600 shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
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
                          className="w-full max-w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-2 px-3 text-xs text-gray-900 flex items-center justify-between outline-none focus:border-green-600 transition text-left cursor-pointer"
                        >
                          <span className="truncate pr-2">
                            {categories.find((c) => c.id === postCategoryId)?.breeds?.find((b) => b.id === postBreedId)?.name || 'Select breed (optional)'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${postBreedDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {postBreedDropdownOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl p-1 space-y-0.5 w-full max-w-full">
                            <button
                              type="button"
                              onClick={() => {
                                setPostBreedId('');
                                setPostBreedDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between cursor-pointer ${
                                !postBreedId ? 'bg-green-50 text-green-800 font-bold' : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <span className="truncate">None (Unspecified breed)</span>
                              {!postBreedId && <Check className="w-3.5 h-3.5 text-green-600 shrink-0 ml-2" />}
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
                                      isSelected ? 'bg-green-50 text-green-800 font-bold' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                  >
                                    <span className="truncate">{b.name}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-green-600 shrink-0 ml-2" />}
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
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Age</label>
                      <input
                        type="text"
                        value={postAge}
                        onChange={(e) => setPostAge(e.target.value)}
                        placeholder="e.g. 4 yrs"
                        className="w-full max-w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-2 px-3 text-base sm:text-xs text-gray-900 outline-none focus:border-green-600"
                      />
                    </div>
                    <div className="col-span-1 min-w-0">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Gender *</label>
                      <div className="grid grid-cols-2 bg-gray-50 p-1 rounded-xl border border-gray-200 gap-1 h-[42px] sm:h-[38px] items-center">
                        <button
                          type="button"
                          onClick={() => setPostGender('MALE')}
                          className={`h-full text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                            postGender === 'MALE'
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black shadow-sm'
                              : 'text-gray-500 hover:text-gray-900'
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
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black shadow-sm'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          <span>🐄</span>
                          <span className="truncate">Female</span>
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 min-w-0">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Contact Phone *</label>
                      <input
                        type="tel"
                        value={postContactPhone}
                        onChange={(e) => setPostContactPhone(e.target.value)}
                        placeholder="e.g. 0911 234 567 or +251 91 123 4567"
                        className="w-full max-w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-2 px-3 text-base sm:text-xs text-gray-900 outline-none font-mono focus:border-green-600 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Dairy & Maternal Profile (when FEMALE) */}
                  {postGender === 'FEMALE' && (
                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          <span>🥛</span>
                          <span>Dairy Cow & Maternal Profile (የማልዳ / የወተት ላም)</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                          Dairy Specs
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Daily Milk Yield (L/day) / የቀን ወተት
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={postMilkYieldLiters}
                            onChange={(e) => setPostMilkYieldLiters(e.target.value)}
                            placeholder="e.g. 18.5"
                            className="w-full bg-white border border-emerald-200 rounded-xl py-2 px-3 text-xs text-gray-900 outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Calving Count / Parity (የወለደችው)
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-full">
                            {[
                              { count: '0', title: 'Heifer (0)', am: 'ያልወለደች' },
                              { count: '1', title: '1st Calving', am: '1 ጊዜ' },
                              { count: '2', title: '2nd Calving', am: '2 ጊዜ' },
                              { count: '3', title: '3rd Calving', am: '3 ጊዜ' },
                              { count: '4', title: '4+ Calvings', am: '4+ ጊዜ' },
                            ].map((item) => {
                              const isSelected = postCalvingCount === item.count;
                              return (
                                <button
                                  key={item.count}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setPostCalvingCount('');
                                      setPostHasGivenBirth(null);
                                    } else {
                                      setPostCalvingCount(item.count);
                                      setPostHasGivenBirth(item.count !== '0');
                                    }
                                  }}
                                  className={`py-1.5 px-2 rounded-lg text-left border transition-all text-xs flex items-center justify-between min-w-0 ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                                      : 'bg-white text-gray-700 border-emerald-200 hover:bg-emerald-50'
                                  }`}
                                >
                                  <span className="truncate">{item.title}</span>
                                  {isSelected && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Udder Health / የጡት ጤንነት
                          </label>
                          <input
                            type="text"
                            value={postUdderHealth}
                            onChange={(e) => setPostUdderHealth(e.target.value)}
                            placeholder="e.g. 4 Healthy Teats, Mastitis-Free"
                            className="w-full bg-white border border-emerald-200 rounded-xl py-2 px-3 text-xs text-gray-900 outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Pregnancy Status & Months (እርግዝና)
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 w-full">
                            <button
                              type="button"
                              onClick={() => {
                                if (postIsPregnant === false) {
                                  setPostIsPregnant(null);
                                } else {
                                  setPostIsPregnant(false);
                                  setPostPregnancyMonths('');
                                }
                              }}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-between border min-w-0 ${
                                postIsPregnant === false
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white text-gray-700 border-emerald-200 hover:bg-emerald-50'
                              }`}
                            >
                              <span className="truncate">Not Pregnant (ክፍት)</span>
                              {postIsPregnant === false && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (postIsPregnant === true) {
                                  setPostIsPregnant(null);
                                  setPostPregnancyMonths('');
                                } else {
                                  setPostIsPregnant(true);
                                }
                              }}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-between border min-w-0 ${
                                postIsPregnant === true
                                  ? 'bg-purple-700 text-white border-purple-700'
                                  : 'bg-white text-gray-700 border-purple-200 hover:bg-purple-50'
                              }`}
                            >
                              <span className="truncate">Pregnant 🤰 (እርጉዝ)</span>
                              {postIsPregnant === true && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
                            </button>
                          </div>
                          {postIsPregnant && (
                            <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 mt-1.5">
                              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setPostPregnancyMonths(m)}
                                  className={`py-1 rounded text-center text-xs font-bold border transition ${
                                    postPregnancyMonths === m
                                      ? 'bg-purple-700 text-white border-purple-700'
                                      : 'bg-white text-gray-700 border-purple-200 hover:bg-purple-100'
                                  }`}
                                >
                                  {m} Mo
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Live Buyer Preview: hidden on mobile to avoid bloat, 4 cols on desktop */}
                <div className="hidden md:block md:col-span-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 block">
                    Live Buyer Card Preview:
                  </span>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2.5 shadow-sm sticky top-4">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center">
                      {postFrontUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={postFrontUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-400 text-xs">
                          <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-400" />
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
                      <div className="text-base font-black text-green-800">
                        {postPrice ? formatPriceETB(parseFloat(postPrice)) : '0 ETB'}
                      </div>
                      <h4 className="font-bold text-gray-900 text-xs line-clamp-1">
                        {postTitle || 'Livestock Title'}
                      </h4>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {categories.find((c) => c.id === postCategoryId)?.name || 'Livestock'} • {postCity}, {postRegion}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postSubmitting}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  {postSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{postSubmitting ? 'Publishing...' : 'Publish Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Fixed for phone thumb reach) */}
      <nav aria-label="Mobile Navigation" className="hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-gray-200 backdrop-blur-xl px-1.5 py-1.5 flex items-center justify-around shadow-2xl">
        {[
          {
            id: 'seller_approvals',
            label: 'Sellers',
            icon: Users,
            count: stats.pendingSellersCount,
            badgeColor: 'bg-amber-500 text-white',
          },
          {
            id: 'moderation',
            label: 'Approvals',
            icon: Clock,
            count: stats.pendingListings,
            badgeColor: 'bg-amber-500 text-white',
          },
          {
            id: 'all_listings',
            label: 'Animals',
            icon: Layers,
            count: allListings.length,
            badgeColor: 'bg-gray-200 text-gray-700',
          },
          {
            id: 'categories',
            label: 'Breeds',
            icon: Tag,
            count: categories.length,
            badgeColor: 'bg-gray-200 text-gray-700',
          },
          {
            id: 'sellers',
            label: 'Directory',
            icon: UserCheck,
            count: stats.totalSellers,
            badgeColor: 'bg-gray-200 text-gray-700',
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
                  ? 'text-green-700 bg-green-50 font-black'
                  : 'text-gray-500 hover:text-gray-900 active:scale-95'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center shadow-sm ${item.badgeColor}`}
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