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

function parseCategory(name: string) {
  const amharicMatch = name.match(/\((.*?)\)/);
  const amharic = amharicMatch ? amharicMatch[1] : '';
  const english = name.replace(/\(.*?\)/, '').replace(/\s*\/.*$/, '').trim();
  return {
    primary: english || name,
    secondary: amharic,
  };
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
          item.category?.name?.toLowerCase().includes('dairy') ||
          item.category?.name?.includes('የወተት') ||
          item.breed?.name?.toLowerCase().includes('friesian') ||
          item.title?.toLowerCase().includes('dairy') ||
          item.title?.toLowerCase().includes('milk');
        if (!isDairy) return false;
      } else if (activeTab === 'beef') {
        const isBeef =
          item.category?.name?.toLowerCase().includes('bull') ||
          item.category?.name?.toLowerCase().includes('beef') ||
          item.category?.name?.includes('የስጋ') ||
          item.category?.name?.toLowerCase().includes('ox') ||
          item.title?.toLowerCase().includes('fatten') ||
          item.breed?.name?.toLowerCase().includes('borana');
        if (!isBeef) return false;
      } else if (activeTab === 'sheep_goat') {
        const isSmallRuminant =
          item.category?.name?.toLowerCase().includes('sheep') ||
          item.category?.name?.toLowerCase().includes('goat') ||
          item.category?.name?.includes('በጎች') ||
          item.category?.name?.includes('ፍየሎች');
        if (!isSmallRuminant) return false;
      } else if (activeTab === 'budget') {
        if (item.price > 60000) return false;
      }

      return true;
    });
  }, [initialListings, searchQuery, selectedCategory, selectedRegion, activeTab]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedRegion !== 'all' ||
    activeTab !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegion('all');
    setActiveTab('all');
  };

  return (
    <div className="space-y-4 sm:space-y-8 pb-12 sm:pb-16">
      {/* 1. Mobile App Top Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 text-white pt-3.5 pb-4 sm:pt-6 sm:pb-8 px-3 sm:px-6 lg:px-8 rounded-b-2xl sm:rounded-none shadow-xs">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-4xl mx-auto space-y-2.5 sm:space-y-4">
          {/* Status & Location Pill */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-semibold text-green-200">
              <span>🇪🇹</span>
              <span>Ethiopia Livestock Classifieds</span>
            </div>

            {/* In-Person Inspection Pill */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-[10px] sm:text-[11px] font-medium">
              <ShieldCheck className="w-3 h-3 text-amber-300 shrink-0" />
              <span>Direct Call • 0% Online Fee</span>
            </div>
          </div>

          {/* Heading with Brand Logo Emblem */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-left">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-md shrink-0 bg-emerald-950">
              <Image
                src="/logo-emblem.png"
                alt="AxumMarket Livestock Marketplace Logo"
                fill
                sizes="64px"
                className="object-cover"
                priority
              />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-lg sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Buy & Sell Livestock <span className="text-green-400">Directly</span>
              </h1>
              <p className="text-[11px] sm:text-sm text-green-100/90 font-normal leading-tight line-clamp-1 sm:line-clamp-none">
                Connect directly with Ethiopian cattle & sheep farmers by phone.
              </p>
            </div>
          </div>

          {/* 2. Interactive Search & Quick Region Bar */}
          <div className="bg-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-lg flex flex-col gap-1.5 text-gray-800">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dairy cow, Borana bull, sheep..."
                className="w-full pl-2 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm outline-none text-gray-900 placeholder:text-gray-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1.5 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Region selector & action row */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 max-w-full">
              <div className="relative flex items-center flex-1 min-w-0 bg-gray-50 hover:bg-gray-100/80 rounded-lg px-2 py-1 border border-gray-200 transition">
                <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0 mr-1" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-transparent text-[11px] sm:text-xs text-gray-800 font-semibold outline-none cursor-pointer truncate"
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
                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 active:scale-98 text-white font-bold text-[11px] sm:text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-1 shrink-0"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Filters</span>
              </Link>
            </div>
          </div>

          {/* Quick Search Tag Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs max-w-full">
            <span className="text-green-300/80 font-semibold shrink-0 text-[10px]">Quick:</span>
            {['Friesian Cow', 'Borana Bull', 'Bishoftu', 'Sululta', 'Dorper Sheep'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border border-white/15 transition shrink-0 whitespace-nowrap"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Interactive Content */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
        {/* 3. Interactive Touch Category Bar (Responsive 3-column grid on mobile, horizontal row on desktop) */}
        <section className="space-y-1.5 sm:space-y-2.5 max-w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-base font-black text-gray-900 flex items-center gap-1.5">
              <span>Choose Animal Category</span>
              {selectedCategory !== 'all' && (
                <span className="text-[10px] sm:text-xs font-semibold text-green-700 bg-green-50 px-1.5 py-0.2 rounded">
                  Active
                </span>
              )}
            </h2>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] sm:text-xs text-red-600 font-semibold hover:underline cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>

          {/* Responsive Category Cards: Smooth horizontal scroll row on all screen sizes */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5 w-full max-w-full">
            {/* "All" button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border text-left transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-green-700 text-white border-green-700 shadow-green-700/20'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-gray-50/60'
              }`}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black">
                  All Animals
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] leading-tight ${
                    selectedCategory === 'all' ? 'text-green-100' : 'text-gray-400'
                  }`}
                >
                  ሁሉም ከብቶች
                </span>
              </div>
            </button>

            {categories.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.slug?.toLowerCase() ||
                selectedCategory.toLowerCase() === cat.name?.toLowerCase();
              const { primary, secondary } = parseCategory(cat.name);

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                  className={`flex items-center px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border text-left transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-green-700 text-white border-green-700 shadow-green-700/20'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-gray-50/60'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black">
                      {primary}
                    </span>
                    {secondary && (
                      <span
                        className={`text-[9px] sm:text-[10px] leading-tight ${
                          isSelected ? 'text-green-100' : 'text-gray-400'
                        }`}
                      >
                        {secondary}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Interactive Market Mood Tabs */}
        <section className="bg-slate-100/90 p-1 rounded-xl sm:rounded-2xl max-w-full overflow-hidden">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar snap-x">
            {[
              { id: 'all', label: 'All', amharic: 'ሁሉም' },
              { id: 'dairy', label: 'Dairy', amharic: 'የወተት' },
              { id: 'beef', label: 'Beef Cattle', amharic: 'የስጋ' },
              { id: 'sheep_goat', label: 'Sheep & Goats', amharic: 'በጎች' },
              { id: 'budget', label: '< 60k ETB', amharic: 'ቅናሽ' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`shrink-0 sm:flex-1 snap-start py-1.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-green-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[9px] opacity-75">({tab.amharic})</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Live Listings Feed Header */}
        <section className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-lg font-black text-gray-900 tracking-tight">
                Verified Livestock
              </h2>
              <span className="bg-green-100 text-green-800 font-bold text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full">
                {filteredListings.length}
              </span>
            </div>

            <Link
              href="/listings"
              className="text-[11px] sm:text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] sm:text-xs max-w-full overflow-hidden">
              <span className="text-gray-500 font-medium text-[10px] shrink-0">Filtering by:</span>

              {searchQuery && (
                <span className="bg-green-50 text-green-800 font-semibold px-2 py-0.5 rounded-lg border border-green-200 flex items-center gap-1 max-w-[140px] min-w-0">
                  <span className="truncate min-w-0">&ldquo;{searchQuery}&rdquo;</span>
                  <button onClick={() => setSearchQuery('')} className="shrink-0 p-0.5">
                    <X className="w-3 h-3 hover:text-green-950" />
                  </button>
                </span>
              )}

              {selectedRegion !== 'all' && (
                <span className="bg-green-50 text-green-800 font-semibold px-2 py-0.5 rounded-lg border border-green-200 flex items-center gap-1 max-w-[140px] min-w-0">
                  <span className="truncate min-w-0">Region: {selectedRegion}</span>
                  <button onClick={() => setSelectedRegion('all')} className="shrink-0 p-0.5">
                    <X className="w-3 h-3 hover:text-green-950" />
                  </button>
                </span>
              )}

              {activeTab !== 'all' && (
                <span className="bg-green-50 text-green-800 font-semibold px-2 py-0.5 rounded-lg border border-green-200 flex items-center gap-1 max-w-[140px] min-w-0">
                  <span className="truncate min-w-0">Tab: {activeTab}</span>
                  <button onClick={() => setActiveTab('all')} className="shrink-0 p-0.5">
                    <X className="w-3 h-3 hover:text-green-950" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-red-600 hover:text-red-800 font-bold ml-1 hover:underline text-[10px] shrink-0"
              >
                Clear all
              </button>
            </div>
          )}

          {/* 2-Column Mobile Feed Grid */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center space-y-2.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center font-bold text-lg">
                🔍
              </div>
              <h3 className="font-bold text-gray-900 text-sm">No livestock match your selection</h3>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                Try clearing search terms or selecting a different category or region.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>

        {/* 6. Interactive Safe Buying Checklist Accordion */}
        <section className="bg-white rounded-2xl border border-amber-200 p-3.5 sm:p-5 shadow-xs space-y-2.5">
          <div
            onClick={() => setIsChecklistOpen(!isChecklistOpen)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>Direct Inspection Checklist</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                    Notice
                  </span>
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  Tap to view safe buying rules in Ethiopia
                </p>
              </div>
            </div>

            <button className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition">
              {isChecklistOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Expandable Checklist Details */}
          {isChecklistOpen && (
            <div className="pt-2 border-t border-amber-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
              <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100/80 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-gray-900 text-[11px]">1. Inspect in Daylight</strong>
                  <span className="text-[11px] leading-tight text-gray-600">Observe walking gait, vitality, and alertness at the farm.</span>
                </div>
              </div>

              <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100/80 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-gray-900 text-[11px]">2. Examine Teeth (Dentition)</strong>
                  <span className="text-[11px] leading-tight text-gray-600">Check incisors to verify true age before closing agreement.</span>
                </div>
              </div>

              <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100/80 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-gray-900 text-[11px]">3. Udder & Health Verification</strong>
                  <span className="text-[11px] leading-tight text-gray-600">For dairy cows, verify teat softness, milk yield, and health.</span>
                </div>
              </div>

              <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100/80 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-red-900 text-[11px]">4. Zero Advance Transfers</strong>
                  <span className="text-[11px] leading-tight text-gray-600">Never send money beforehand. Pay only upon physical handover!</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 7. How AxumMarket Works 4-Step Cards */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-6 space-y-3">
          <div className="text-center space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              Safe & Simple
            </span>
            <h2 className="text-sm sm:text-xl font-black text-gray-900">
              How Buyers Trade on AxumMarket
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-100 text-center space-y-1 shadow-xs">
              <div className="w-6 h-6 rounded-md bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-bold text-[11px] sm:text-xs text-gray-900">Browse Photos</h4>
              <p className="text-[10px] text-gray-500 leading-tight">
                Inspect 3 verified photo angles and live weight.
              </p>
            </div>

            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-100 text-center space-y-1 shadow-xs">
              <div className="w-6 h-6 rounded-md bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-bold text-[11px] sm:text-xs text-gray-900">Direct Call</h4>
              <p className="text-[10px] text-gray-500 leading-tight">
                Dial the seller directly to discuss price.
              </p>
            </div>

            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-100 text-center space-y-1 shadow-xs">
              <div className="w-6 h-6 rounded-md bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-bold text-[11px] sm:text-xs text-gray-900">Physical Visit</h4>
              <p className="text-[10px] text-gray-500 leading-tight">
                Inspect animal health and teeth in person.
              </p>
            </div>

            <div className="p-2 sm:p-3 bg-white rounded-xl border border-gray-100 text-center space-y-1 shadow-xs">
              <div className="w-6 h-6 rounded-md bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mx-auto">
                4
              </div>
              <h4 className="font-bold text-[11px] sm:text-xs text-gray-900">In-Person Pay</h4>
              <p className="text-[10px] text-gray-500 leading-tight">
                Pay in cash/transfer only after complete satisfaction.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Farmer / Seller Action CTA */}
        <section className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-2xl p-4 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5 text-center sm:text-left">
            <h3 className="text-base sm:text-xl font-black">
              Selling Cattle or Sheep?
            </h3>
            <p className="text-green-100 text-xs sm:text-sm max-w-md leading-tight">
              Post in 2 minutes. Receive direct calls from buyers across Ethiopia with 0% commission.
            </p>
          </div>
          <Link
            href="/seller/create"
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-green-50 active:scale-98 text-green-800 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Livestock Now</span>
          </Link>
        </section>
      </div>
    </div>
  );
}

