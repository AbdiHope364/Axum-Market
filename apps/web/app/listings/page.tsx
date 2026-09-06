'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ListingCard, { ListingCardData } from '@/components/ListingCard';
import SafetyNotice from '@/components/SafetyNotice';
import {
  Search,
  Filter,
  X,
  RefreshCw,
  SlidersHorizontal,
  Check,
  MapPin,
  Tag,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  breeds: { id: string; name: string }[];
}

interface StructuredLocation {
  region: string;
  cities: string[];
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [structuredLocations, setStructuredLocations] = useState<StructuredLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Form Filter state
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [breed, setBreed] = useState(searchParams.get('breed') || '');
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFiltersOpen]);

  // Fetch categories & locations on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data?.categories) setCategories(data.categories);
      })
      .catch(console.error);

    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data?.structured) setStructuredLocations(data.structured);
      })
      .catch(console.error);
  }, []);

  // Fetch listings based on search params
  const fetchListings = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (breed) params.set('breed', breed);
    if (region) params.set('region', region);
    if (city) params.set('city', city);
    if (gender) params.set('gender', gender);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    fetch(`/api/listings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings || []);
      })
      .catch((err) => {
        console.error(err);
        setListings([]);
      })
      .finally(() => setLoading(false));
  }, [q, category, breed, region, city, gender, minPrice, maxPrice]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Breeds list matching selected category
  const selectedCategoryObj = categories.find(
    (c) => c.slug === category || c.id === category
  );
  const availableBreeds = selectedCategoryObj ? selectedCategoryObj.breeds : [];

  // Available cities matching selected region
  const selectedRegionObj = structuredLocations.find((r) => r.region === region);
  const availableCities = selectedRegionObj ? selectedRegionObj.cities : [];

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMobileFiltersOpen(false);

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (breed) params.set('breed', breed);
    if (region) params.set('region', region);
    if (city) params.set('city', city);
    if (gender) params.set('gender', gender);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    router.push(`/listings?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setQ('');
    setCategory('');
    setBreed('');
    setRegion('');
    setCity('');
    setGender('');
    setMinPrice('');
    setMaxPrice('');
    setMobileFiltersOpen(false);
    router.push('/listings');
  };

  const removeFilter = (filterKey: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);

    let nextCategory = category;
    let nextBreed = breed;
    let nextRegion = region;
    let nextCity = city;
    let nextGender = gender;
    let nextMinPrice = minPrice;
    let nextMaxPrice = maxPrice;

    if (filterKey === 'category') {
      nextCategory = '';
      nextBreed = '';
    } else if (filterKey === 'breed') {
      nextBreed = '';
    } else if (filterKey === 'region') {
      nextRegion = '';
      nextCity = '';
    } else if (filterKey === 'city') {
      nextCity = '';
    } else if (filterKey === 'gender') {
      nextGender = '';
    } else if (filterKey === 'price') {
      nextMinPrice = '';
      nextMaxPrice = '';
    }

    setCategory(nextCategory);
    setBreed(nextBreed);
    setRegion(nextRegion);
    setCity(nextCity);
    setGender(nextGender);
    setMinPrice(nextMinPrice);
    setMaxPrice(nextMaxPrice);

    if (nextCategory) params.set('category', nextCategory);
    if (nextBreed) params.set('breed', nextBreed);
    if (nextRegion) params.set('region', nextRegion);
    if (nextCity) params.set('city', nextCity);
    if (nextGender) params.set('gender', nextGender);
    if (nextMinPrice) params.set('minPrice', nextMinPrice);
    if (nextMaxPrice) params.set('maxPrice', nextMaxPrice);

    router.push(`/listings?${params.toString()}`);
  };

  const pricePresets = [
    { label: 'All Prices', min: '', max: '' },
    { label: '< 35,000 ETB', min: '', max: '35000' },
    { label: '35k – 80k ETB', min: '35000', max: '80000' },
    { label: '80k – 150k ETB', min: '80000', max: '150000' },
    { label: '150,000+ ETB', min: '150000', max: '' },
  ];

  const activeFilterCount = [
    category,
    breed,
    region,
    city,
    gender,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-3 sm:space-y-5">
      {/* Top Search & Filter Bar for Mobile */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            placeholder="Search by breed, cow, bull, location..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-green-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-green-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-green-600 text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleApplyFilters()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Category Pills Slider (Fast mobile tap, edge-to-edge scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
        <button
          onClick={() => {
            setCategory('');
            setBreed('');
          }}
          className={`shrink-0 snap-start px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            !category
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
          }`}
        >
          🐾 All Livestock
        </button>
        {categories.map((cat) => {
          const isSelected = category === cat.slug || category === cat.id;
          const shortName = cat.name.replace(/\s*\/.*$/, '').replace(/\(.*?\)/, '').trim() || cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(isSelected ? '' : cat.slug);
                setBreed('');
              }}
              className={`shrink-0 snap-start px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>{cat.icon || '🐾'}</span>
              <span className="hidden sm:inline">{cat.name}</span>
              <span className="sm:hidden">{shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Chips (Instant tap-to-remove) */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs animate-fadeIn">
          <span className="text-gray-500 font-bold shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-green-600" /> Active:
          </span>
          {category && (
            <button
              onClick={() => removeFilter('category')}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-800 border border-green-300/80 font-bold hover:bg-green-100 active:scale-95 transition shadow-2xs"
            >
              <span>{selectedCategoryObj?.icon || '🐾'} {selectedCategoryObj?.name || category}</span>
              <X className="w-3 h-3 text-green-700" />
            </button>
          )}
          {breed && (
            <button
              onClick={() => removeFilter('breed')}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-800 border border-green-300/80 font-bold hover:bg-green-100 active:scale-95 transition shadow-2xs"
            >
              <span>Breed: {availableBreeds.find((b) => b.id === breed)?.name || breed}</span>
              <X className="w-3 h-3 text-green-700" />
            </button>
          )}
          {region && (
            <button
              onClick={() => removeFilter('region')}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-800 border border-green-300/80 font-bold hover:bg-green-100 active:scale-95 transition shadow-2xs"
            >
              <span>Region: {region}</span>
              <X className="w-3 h-3 text-green-700" />
            </button>
          )}
          {city && (
            <button
              onClick={() => removeFilter('city')}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-800 border border-green-300/80 font-bold hover:bg-green-100 active:scale-95 transition shadow-2xs"
            >
              <span>City: {city}</span>
              <X className="w-3 h-3 text-green-700" />
            </button>
          )}
          {gender && (
            <button
              onClick={() => removeFilter('gender')}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-800 border border-green-300/80 font-bold hover:bg-green-100 active:scale-95 transition shadow-2xs"
            >
              <span>{gender === 'FEMALE' ? 'Female ♀' : 'Male ♂'}</span>
              <X className="w-3 h-3 text-green-700" />
            </button>
          )}
          {(minPrice || maxPrice) && (
            <button
              onClick={() => removeFilter('price')}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-800 border border-green-300/80 font-bold hover:bg-green-100 active:scale-95 transition shadow-2xs"
            >
              <span>Price: {minPrice ? `${Number(minPrice).toLocaleString()} ETB` : '0'} – {maxPrice ? `${Number(maxPrice).toLocaleString()} ETB` : 'Any'}</span>
              <X className="w-3 h-3 text-green-700" />
            </button>
          )}
          <button
            onClick={handleResetFilters}
            className="shrink-0 text-xs font-bold text-red-600 hover:text-red-700 hover:underline px-2 py-1 active:scale-95 transition"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Layout (Desktop Sidebar + Listings Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-white p-5 rounded-2xl border border-gray-200 h-fit sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-green-600" />
              <span>Filters</span>
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setBreed('');
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Breed */}
          {availableBreeds.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Breed
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Breeds</option>
                {availableBreeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Region */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setCity('');
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Regions</option>
              {structuredLocations.map((loc) => (
                <option key={loc.region} value={loc.region}>
                  {loc.region}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          {availableCities.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                City / Town
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Cities</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setGender('')}
                className={`py-1.5 rounded-lg transition ${
                  !gender ? 'bg-white shadow-sm font-bold text-gray-900' : 'text-gray-600'
                }`}
              >
                Any
              </button>
              <button
                type="button"
                onClick={() => setGender('FEMALE')}
                className={`py-1.5 rounded-lg transition ${
                  gender === 'FEMALE' ? 'bg-white shadow-sm font-bold text-gray-900' : 'text-gray-600'
                }`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setGender('MALE')}
                className={`py-1.5 rounded-lg transition ${
                  gender === 'MALE' ? 'bg-white shadow-sm font-bold text-gray-900' : 'text-gray-600'
                }`}
              >
                Male
              </button>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Price (ETB)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ETB"
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ETB"
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <button
            onClick={() => handleApplyFilters()}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow-sm transition"
          >
            Apply Filters
          </button>
        </aside>

        {/* Listings Content */}
        <main className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing <span className="font-bold text-gray-900">{listings.length}</span> livestock classifieds
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-green-700 hover:underline font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 aspect-[3/4] animate-pulse p-2.5 sm:p-4 space-y-2 sm:space-y-3"
                >
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg sm:rounded-xl" />
                  <div className="h-3.5 sm:h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {listings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center space-y-4">
              <span className="text-5xl">🐄</span>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                No livestock found matching your criteria
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                Try clearing filters or adjusting your price and breed selections.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-green-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Buyer Safety Reminder */}
          <div className="pt-6">
            <SafetyNotice variant="compact" />
          </div>
        </main>
      </div>

      {/* Mobile Filters Slide-over / Bottom Sheet */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop Overlay - tap outside to dismiss */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Slide-over Filter Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft z-10">
            {/* Sticky Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50/60 to-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-xs">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900 leading-tight">
                    Filter Livestock
                  </h3>
                  <div className="text-[11px] text-gray-500 font-semibold">
                    {activeFilterCount > 0
                      ? `${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}`
                      : 'Tap options to narrow results'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-xl active:scale-95 transition"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-90 flex items-center justify-center text-gray-600 hover:text-gray-900 transition"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Options Body */}
            <div className="p-4 space-y-5 overflow-y-auto flex-1">
              {/* 1. Animal Category (Interactive Visual Cards) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Animal Category</span>
                  </label>
                  {category && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('');
                        setBreed('');
                      }}
                      className="text-[11px] text-green-700 font-bold hover:underline"
                    >
                      Show All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => {
                    const isSelected = category === c.slug || category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCategory(isSelected ? '' : c.slug);
                          setBreed('');
                        }}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-green-50/90 border-green-500 text-green-900 shadow-xs ring-1 ring-green-500'
                            : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-2xl">{c.icon || '🐾'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black truncate">{c.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium">
                            {c.breeds?.length || 0} Breeds
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Breed Selection (Dynamic Interactive Pills) */}
              {availableBreeds.length > 0 && (
                <div className="space-y-2 p-3 bg-gray-50/80 rounded-2xl border border-gray-200/80 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-green-600" />
                      <span>{selectedCategoryObj?.name} Breeds ({availableBreeds.length})</span>
                    </label>
                    {breed && (
                      <button
                        type="button"
                        onClick={() => setBreed('')}
                        className="text-[11px] text-green-700 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-0.5">
                    <button
                      type="button"
                      onClick={() => setBreed('')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                        !breed
                          ? 'bg-green-600 text-white shadow-xs font-bold'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      All Breeds
                    </button>
                    {availableBreeds.map((b) => {
                      const isSel = breed === b.id || breed === b.name;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setBreed(isSel ? '' : b.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1 ${
                            isSel
                              ? 'bg-green-600 text-white shadow-xs font-bold'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span>{b.name}</span>
                          {isSel && <Check className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Ethiopian Region (Interactive Pills) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-green-600" />
                    <span>Region</span>
                  </label>
                  {region && (
                    <button
                      type="button"
                      onClick={() => {
                        setRegion('');
                        setCity('');
                      }}
                      className="text-[11px] text-green-700 font-bold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRegion('');
                      setCity('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                      !region
                        ? 'bg-green-600 text-white shadow-xs font-bold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Regions
                  </button>
                  {structuredLocations.map((loc) => {
                    const isSel = region === loc.region;
                    return (
                      <button
                        key={loc.region}
                        type="button"
                        onClick={() => {
                          setRegion(isSel ? '' : loc.region);
                          setCity('');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1 ${
                          isSel
                            ? 'bg-green-600 text-white shadow-xs font-bold'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{loc.region}</span>
                        {isSel && <Check className="w-3 h-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. City / Market Town (Interactive Pills) */}
              {availableCities.length > 0 && (
                <div className="space-y-2 p-3 bg-gray-50/80 rounded-2xl border border-gray-200/80 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider">
                      Cities in {region}
                    </label>
                    {city && (
                      <button
                        type="button"
                        onClick={() => setCity('')}
                        className="text-[11px] text-green-700 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCity('')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                        !city
                          ? 'bg-green-600 text-white shadow-xs font-bold'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      All Cities
                    </button>
                    {availableCities.map((c) => {
                      const isSel = city === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCity(isSel ? '' : c)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1 ${
                            isSel
                              ? 'bg-green-600 text-white shadow-xs font-bold'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span>{c}</span>
                          {isSel && <Check className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Gender (Tactile Segmented Control) */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setGender('')}
                    className={`py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                      !gender
                        ? 'bg-white shadow-xs text-gray-900'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Any
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('FEMALE')}
                    className={`py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                      gender === 'FEMALE'
                        ? 'bg-white shadow-xs text-green-700'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Female ♀
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('MALE')}
                    className={`py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                      gender === 'MALE'
                        ? 'bg-white shadow-xs text-green-700'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Male ♂
                  </button>
                </div>
              </div>

              {/* 6. Price Range (Quick Budget Chips + Inputs) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-800 uppercase tracking-wider">
                    Price Range (ETB)
                  </label>
                  {(minPrice || maxPrice) && (
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                      }}
                      className="text-[11px] text-green-700 font-bold hover:underline"
                    >
                      Reset Price
                    </button>
                  )}
                </div>

                {/* Quick Budget Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {pricePresets.map((preset) => {
                    const isSel = minPrice === preset.min && maxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setMinPrice(preset.min);
                          setMaxPrice(preset.max);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                          isSel
                            ? 'bg-green-600 text-white shadow-xs font-bold'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Numeric Inputs */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="relative">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min ETB"
                      className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                      ETB
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max ETB"
                      className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                      ETB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="p-4 border-t border-gray-200 bg-white/95 backdrop-blur-md shrink-0 flex items-center gap-2.5 shadow-lg">
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-3 px-4 rounded-2xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm active:scale-95 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => handleApplyFilters()}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-black text-sm shadow-md shadow-green-600/30 flex items-center justify-center gap-2 transition"
              >
                <span>Apply Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-white/25 px-2 py-0.5 rounded-full text-xs font-extrabold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading livestock...</div>}>
      <ListingsContent />
    </Suspense>
  );
}

