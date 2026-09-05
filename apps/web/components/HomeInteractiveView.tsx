'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  SlidersHorizontal,
  X,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  Clock,
  Award,
} from 'lucide-react';
import ListingCard, { ListingCardData } from './ListingCard';
import SafetyNotice from './SafetyNotice';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  breeds?: { id: string; name: string }[];
}

interface HomeInteractiveViewProps {
  categories: CategoryItem[];
  initialListings: ListingCardData[];
}

export default function HomeInteractiveView({
  categories,
  initialListings,
}: HomeInteractiveViewProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'dairy' | 'beef' | 'sheep_goat' | 'budget'>('all');
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  // Quick preset regions
  const quickRegions = [
    { label: 'All Ethiopia', value: 'all' },
    { label: 'Oromia (Sululta, Bishoftu)', value: 'Oromia' },
    { label: 'Addis Ababa', value: 'Addis Ababa' },
    { label: 'Amhara', value: 'Amhara' },
    { label: 'Sidama (Hawassa)', value: 'Sidama' },
  ];

  // Filter listings based on interactive controls
  const filteredListings = useMemo(() => {
    return initialListings.filter((item) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchBreed = item.breed?.name?.toLowerCase().includes(q);
        const matchCat = item.category?.name?.toLowerCase().includes(q);
        const matchCity = item.city?.toLowerCase().includes(q);
        const matchRegion = item.region?.toLowerCase().includes(q);
        if (!matchTitle && !matchBreed && !matchCat && !matchCity && !matchRegion) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'all') {
        const catSlug = item.category?.name?.toLowerCase().replace(/\s+/g, '-');
        const matchSlug = catSlug?.includes(selectedCategory.toLowerCase());
        const matchName = item.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase());
        if (!matchSlug && !matchName) {
          return false;
        }
      }

      // 3. Region filter
      if (selectedRegion !== 'all') {
        if (!item.region?.toLowerCase().includes(selectedRegion.toLowerCase())) {
          return false;
        }
      }

      // 4. Active Tab filter
      if (activeTab === 'dairy') {
        const isDairy =
          item.category?.name?.toLowerCase().includes('cow') ||
          item.breed?.name?.toLowerCase().includes('friesian') ||
          item.title?.toLowerCase().includes('dairy') ||
          item.title?.toLowerCase().includes('milk');
        if (!isDairy) return false;
      } else if (activeTab === 'beef') {
        const isBeef =
          item.category?.name?.toLowerCase().includes('bull') ||
          item.category?.name?.toLowerCase().includes('ox') ||
          item.title?.toLowerCase().includes('fatten') ||
          item.breed?.name?.toLowerCase().includes('borana');
        if (!isBeef) return false;
      } else if (activeTab === 'sheep_goat') {
        const isSmallRuminant =
          item.category?.name?.toLowerCase().includes('sheep') ||
          item.category?.name?.toLowerCase().includes('goat');
        if (!isSmallRuminant) return false;
      } else if (activeTab === 'budget') {
        if (item.price > 60000) return false;
      }

      return true;
    });
  }, [initialListings, searchQuery, selectedCategory, selectedRegion, activeTab]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedRegion !== 'all' ||
    activeTab !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegion('all');
    setActiveTab('all');
  };

  return (
    <div className="space-y-6 sm:space-y-10 pb-16">
      {/* 1. Mobile App Top Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 text-white pt-6 pb-8 px-4 sm:px-6 lg:px-8 rounded-b-3xl sm:rounded-none shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-4xl mx-auto space-y-4">
          {/* Status & Location Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-green-200">
              <span>🇪🇹</span>
              <span>Ethiopia Livestock Classifieds</span>
            </div>

            {/* In-Person Inspection Pill */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Direct Call • Zero Online Payment</span>
            </div>
          </div>

          {/* Heading with Brand Logo Emblem */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 text-center sm:text-left">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-lg shrink-0 bg-emerald-950">
              <Image
                src="/logo-emblem.png"
                alt="AxumMarket Livestock Marketplace Logo"
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Buy & Sell Livestock <br className="hidden sm:inline" />
                <span className="text-green-400">Directly with Farmers</span>
              </h1>
              <p className="text-xs sm:text-base text-green-100/90 max-w-xl font-normal">
                Verified dairy cows, Borana bulls, sheep, and goats. Connect by phone & inspect in daylight.
              </p>
            </div>
          </div>

          {/* 2. Interactive Search & Quick Region Bar */}
          <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col gap-2 text-gray-800">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-gray-400 ml-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dairy cow, Borana bull, Dorper sheep..."
                className="w-full pl-2.5 pr-8 py-2.5 text-sm sm:text-base outline-none text-gray-900 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Region selector & action row */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-gray-100">
              <div className="relative flex items-center w-full sm:flex-1 bg-gray-50 hover:bg-gray-100/80 rounded-xl px-2.5 py-1.5 border border-gray-200 transition">
                <MapPin className="w-4 h-4 text-green-600 shrink-0 mr-1.5" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-gray-800 font-semibold outline-none cursor-pointer"
                >
                  {quickRegions.map((reg) => (
                    <option key={reg.value} value={reg.value}>
                      {reg.label}
                    </option>
                  ))}
                </select>
              </div>

              <Link
                href="/listings"
                className="w-full sm:w-auto px-4 py-2.5 bg-green-600 hover:bg-green-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Advanced Filters</span>
              </Link>
            </div>
          </div>

          {/* Quick Search Tag Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-green-300/80 font-medium shrink-0 text-[11px]">Quick:</span>
            {['Friesian Cow', 'Borana Bull', 'Bishoftu', 'Sululta', 'Dorper Sheep'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white text-[11px] px-2.5 py-0.5 rounded-full border border-white/15 transition shrink-0 whitespace-nowrap"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Interactive Content */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* 3. Interactive Touch Category Bar */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-lg font-bold text-gray-900 flex items-center gap-1.5">
              <span>Choose Animal Category</span>
              {selectedCategory !== 'all' && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              )}
            </h2>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-red-600 font-semibold hover:underline"
              >
                Show All
              </button>
            )}
          </div>

          {/* Horizontal scrollable category touch cards */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5">
            {/* "All" button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all shadow-sm ${
                selectedCategory === 'all'
                  ? 'bg-green-700 text-white border-green-700 shadow-green-700/20 ring-2 ring-green-600 ring-offset-1'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-green-300'
              }`}
            >
              <span className="text-base">🐾</span>
              <span>All Livestock</span>
            </button>

            {categories.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.slug?.toLowerCase() ||
                selectedCategory.toLowerCase() === cat.name?.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all shadow-sm ${
                    isSelected
                      ? 'bg-green-700 text-white border-green-700 shadow-green-700/20 ring-2 ring-green-600 ring-offset-1'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-300'
                  }`}
                >
                  <span className="text-lg">{cat.icon || '🐮'}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Interactive Market Mood Tabs */}
        <section className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Listings', icon: '📋' },
            { id: 'dairy', label: '🥛 Dairy Cows', icon: '🥛' },
            { id: 'beef', label: '🥩 Beef / Bulls', icon: '🥩' },
            { id: 'sheep_goat', label: '🐑 Sheep & Goats', icon: '🐑' },
            { id: 'budget', label: '💰 Under 60k ETB', icon: '💰' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[110px] py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-green-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </section>

        {/* 5. Live Listings Feed Header */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-xl font-black text-gray-900 tracking-tight">
                Verified Livestock
              </h2>
              <span className="bg-green-100 text-green-800 font-bold text-xs px-2 py-0.5 rounded-full">
                {filteredListings.length}
              </span>
            </div>

            <Link
              href="/listings"
              className="text-xs sm:text-sm font-bold text-green-700 hover:text-green-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-gray-500 font-medium">Filtering by:</span>

              {searchQuery && (
                <span className="bg-green-50 text-green-800 font-semibold px-2.5 py-1 rounded-lg border border-green-200 flex items-center gap-1">
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3.5 h-3.5 hover:text-green-950" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="bg-green-50 text-green-800 font-semibold px-2.5 py-1 rounded-lg border border-green-200 flex items-center gap-1">
                  <span>Category: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('all')}>
                    <X className="w-3.5 h-3.5 hover:text-green-950" />
                  </button>
                </span>
              )}

              {selectedRegion !== 'all' && (
                <span className="bg-green-50 text-green-800 font-semibold px-2.5 py-1 rounded-lg border border-green-200 flex items-center gap-1">
                  <span>Region: {selectedRegion}</span>
                  <button onClick={() => setSelectedRegion('all')}>
                    <X className="w-3.5 h-3.5 hover:text-green-950" />
                  </button>
                </span>
              )}

              {activeTab !== 'all' && (
                <span className="bg-green-50 text-green-800 font-semibold px-2.5 py-1 rounded-lg border border-green-200 flex items-center gap-1">
                  <span>Tab: {activeTab}</span>
                  <button onClick={() => setActiveTab('all')}>
                    <X className="w-3.5 h-3.5 hover:text-green-950" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-red-600 hover:text-red-800 font-bold ml-1 hover:underline text-xs"
              >
                Clear all
              </button>
            </div>
          )}

          {/* 2-Column Mobile Feed Grid */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center font-bold text-xl">
                🔍
              </div>
              <h3 className="font-bold text-gray-900 text-base">No livestock match your selection</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try clearing search terms or selecting a different category or region.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>

        {/* 6. Interactive Safe Buying Checklist Accordion */}
        <section className="bg-white rounded-3xl border border-amber-200 p-4 sm:p-6 shadow-sm space-y-3">
          <div
            onClick={() => setIsChecklistOpen(!isChecklistOpen)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
                  <span>Direct Inspection Checklist</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                    Important
                  </span>
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Tap to review safe physical buying guidelines in Ethiopia
                </p>
              </div>
            </div>

            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition">
              {isChecklistOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {/* Expandable Checklist Details */}
          {isChecklistOpen && (
            <div className="pt-3 border-t border-amber-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-700">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-gray-900">1. Inspect in Daylight</strong>
                  <span>Always visit the farm or public livestock market in morning light to observe gait and vitality.</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-gray-900">2. Examine Teeth (Dentition)</strong>
                  <span>Check incisor pairs to accurately confirm the animal&apos;s real age before agreeing on price.</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-gray-900">3. Udder & Health Verification</strong>
                  <span>For dairy cows, verify mastitis absence, teat softness, and inspect 3 photographic angles.</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-red-900">4. Zero Online Advance Payments</strong>
                  <span>Never send money or deposits beforehand. Pay the seller only after physical handover!</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 7. How AxumMarket Works 4-Step Cards */}
        <section className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-8 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
              Safe & Simple
            </span>
            <h2 className="text-base sm:text-2xl font-black text-gray-900">
              How Buyers Trade on AxumMarket
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="p-3 bg-white rounded-2xl border border-gray-100 text-center space-y-1.5 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">Browse Photos</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Check Front, Left, Right angles and detailed health info.
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-gray-100 text-center space-y-1.5 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">Direct Call</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Tap the phone button to dial the farmer directly.
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-gray-100 text-center space-y-1.5 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">Physical Visit</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Inspect animal health and teeth at the farm or market.
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-gray-100 text-center space-y-1.5 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mx-auto">
                4
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">In-Person Pay</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Pay in cash or bank transfer only after full satisfaction.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Farmer / Seller Action CTA */}
        <section className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-5 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-2xl font-black">
              Selling a Cow, Bull, or Sheep?
            </h3>
            <p className="text-green-100 text-xs sm:text-sm max-w-md">
              Post in 2 minutes. Receive direct calls from serious buyers across Ethiopia. 100% free with 0% sales commission.
            </p>
          </div>
          <Link
            href="/seller/create"
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-green-50 active:scale-98 text-green-800 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Livestock Now</span>
          </Link>
        </section>
      </div>
    </div>
  );
}

