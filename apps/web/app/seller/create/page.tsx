'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Camera,
  ShieldCheck,
  Check,
  Trash2,
  Phone,
  Loader2,
  Link as LinkIcon,
  MapPin,
  Tag,
  Coins,
  Milk,
  Baby,
  Activity,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  breeds: { id: string; name: string }[];
}

interface StructuredLocation {
  region: string;
  cities: string[];
}

export default function CreateListingPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [locations, setLocations] = useState<StructuredLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [categoryId, setCategoryId] = useState('');
  const [breedId, setBreedId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('FEMALE');
  // Dairy Cow & Maternal Profile fields
  const [milkYieldLiters, setMilkYieldLiters] = useState('');
  const [hasGivenBirth, setHasGivenBirth] = useState<boolean | null>(null);
  const [calvingCount, setCalvingCount] = useState('');
  const [udderHealth, setUdderHealth] = useState('');
  const [isPregnant, setIsPregnant] = useState<boolean | null>(null);
  const [pregnancyMonths, setPregnancyMonths] = useState('');
  const [showDairyManualToggle, setShowDairyManualToggle] = useState(false);
  const [region, setRegion] = useState('Oromia');
  const [city, setCity] = useState('Sululta');
  const [area, setArea] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [inspectedAgreed, setInspectedAgreed] = useState(false);

  // Exactly 3 required images
  const [frontUrl, setFrontUrl] = useState('');
  const [leftUrl, setLeftUrl] = useState('');
  const [rightUrl, setRightUrl] = useState('');
  const [uploadingAngle, setUploadingAngle] = useState<string | null>(null);

  // Toggle url input for each angle if user prefers pasting
  const [showUrlInput, setShowUrlInput] = useState<{ [key: string]: boolean }>({});

  const frontInputRef = useRef<HTMLInputElement>(null);
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);

  const checkAuthAndFetchMeta = useCallback(async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (!authData?.user) {
        router.push('/seller/login?redirect=/seller/create');
        return;
      }
      if (authData.user.phone) {
        setContactPhone(authData.user.phone);
      }
      if (authData.user.region) setRegion(authData.user.region);
      if (authData.user.city) setCity(authData.user.city);

      const [catRes, locRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/locations'),
      ]);

      const catData = await catRes.json();
      const locData = await locRes.json();

      if (catData?.categories) {
        setCategories(catData.categories);
        if (catData.categories.length > 0) {
          setCategoryId(catData.categories[0].id);
        }
      }
      if (locData?.structured) {
        setLocations(locData.structured);
      }
    } catch (err) {
      console.error(err);
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndFetchMeta();
  }, [checkAuthAndFetchMeta]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const availableBreeds = selectedCategory ? selectedCategory.breeds : [];

  const selectedRegion = locations.find((l) => l.region === region);
  const availableCities = selectedRegion ? selectedRegion.cities : [];

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, angle: 'FRONT' | 'LEFT' | 'RIGHT') => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      if (res.ok && data.imageUrl) {
        if (angle === 'FRONT') setFrontUrl(data.imageUrl);
        if (angle === 'LEFT') setLeftUrl(data.imageUrl);
        if (angle === 'RIGHT') setRightUrl(data.imageUrl);
      } else {
        alert(data.error || 'Failed to upload photo');
      }
    } catch (err) {
      console.error(err);
      alert('Upload error');
    } finally {
      setUploadingAngle(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inspectedAgreed) {
      setError('You must acknowledge that buyers should inspect the livestock before purchasing.');
      return;
    }

    if (!frontUrl || !leftUrl || !rightUrl) {
      setError('All three livestock photos (Front/Profile, Left Side, and Right Side) are strictly required.');
      return;
    }

    if (isPregnant === true && (!pregnancyMonths || parseFloat(pregnancyMonths) <= 0)) {
      setError('Please specify the exact pregnancy duration in months (ስንት ወር እንደሆናት ይግለጹ) for the pregnant cow.');
      return;
    }

    setLoading(true);

    try {
      const images = [
        { imageType: 'FRONT', imageUrl: frontUrl },
        { imageType: 'LEFT', imageUrl: leftUrl },
        { imageType: 'RIGHT', imageUrl: rightUrl },
      ];

      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          breedId: breedId || undefined,
          title,
          description,
          price,
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
          milkYieldLiters: milkYieldLiters ? parseFloat(milkYieldLiters) : undefined,
          hasGivenBirth: hasGivenBirth !== null ? hasGivenBirth : undefined,
          calvingCount: calvingCount !== '' ? parseInt(calvingCount, 10) : undefined,
          udderHealth: udderHealth.trim() || undefined,
          isPregnant: isPregnant !== null ? isPregnant : undefined,
          pregnancyMonths: isPregnant === true && pregnancyMonths !== '' ? parseInt(pregnancyMonths, 10) : undefined,
          age,
          gender,
          region,
          city,
          area,
          contactPhone,
          images,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to publish listing.');
        setLoading(false);
        return;
      }

      router.push('/seller/dashboard');
      router.refresh();
    } catch {
      setError('A network error occurred.');
      setLoading(false);
    }
  };

  const renderAngleUploader = (
    angle: 'FRONT' | 'LEFT' | 'RIGHT',
    title: string,
    subtitle: string,
    url: string,
    setUrl: (val: string) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const isUploading = uploadingAngle === angle;
    const isUrlOpen = showUrlInput[angle];

    return (
      <div className="space-y-2 p-3 sm:p-3.5 bg-gray-50/90 rounded-2xl border border-gray-200/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="font-bold text-xs text-gray-900 truncate">{title}</span>
            {url ? (
              <span className="shrink-0 inline-flex items-center gap-1 text-[11px] xs:text-xs font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            ) : (
              <span className="shrink-0 text-[11px] xs:text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                Required
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2 leading-tight">{subtitle}</p>
        </div>

        {/* Hidden native file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e, angle)}
        />

        {/* Image Preview or Upload Trigger Box */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80 transition-all">
          {url ? (
            <>
              <Image src={url} alt={title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90 sm:opacity-0 sm:hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="px-2.5 py-1 bg-white/90 hover:bg-white text-gray-900 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 active:scale-95 transition"
                >
                  <Camera className="w-3 h-3 text-green-700" />
                  <span>Change</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-lg shadow-xs active:scale-95 transition"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center p-3 text-center hover:bg-gray-50/80 active:bg-gray-100 transition cursor-pointer group"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-1.5 text-green-700">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-bold">Uploading...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center mb-1 group-hover:scale-105 transition">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Tap to Take or Upload</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, or WebP</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Secondary URL Paste Toggle */}
        <div className="pt-1">
          {!isUrlOpen && !url && (
            <button
              type="button"
              onClick={() => setShowUrlInput((prev) => ({ ...prev, [angle]: true }))}
              className="text-[10px] text-gray-400 hover:text-green-700 flex items-center gap-1 transition"
            >
              <LinkIcon className="w-3 h-3" />
              <span>Paste URL link instead</span>
            </button>
          )}

          {isUrlOpen && !url && (
            <div className="space-y-1 animate-fadeIn">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-green-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUrlInput((prev) => ({ ...prev, [angle]: false }))}
                  className="text-[11px] xs:text-xs text-gray-400 hover:text-gray-600"
                >
                  Hide URL field
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-24 md:pb-10 min-w-0 overflow-x-hidden">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 px-2 py-1 -ml-1 text-xs sm:text-sm font-bold text-gray-600 hover:text-green-700 hover:bg-gray-100 rounded-lg transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Seller Dashboard</span>
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-4 sm:p-7 md:p-8 shadow-xs space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">
        {/* Header */}
        <div className="space-y-1.5 border-b border-gray-100 pb-4 sm:pb-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
              Livestock Classifieds Form
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Add New Livestock Listing
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Provide accurate details and photos from all 3 angles so buyers across Ethiopia can inspect your livestock.
          </p>
        </div>

        {error && (
          <div className="p-3 sm:p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-full">
          {/* Animal Category Selection (Touch-friendly responsive grid that stays 100% inside mobile bounds) */}
          <div className="space-y-1.5 w-full max-w-full">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-black text-gray-700 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span>Animal Category / የእንስሳት አይነት *</span>
              </span>
              {selectedCategory && (
                <span className="text-[11px] xs:text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200 truncate max-w-[150px]">
                  {selectedCategory.name.split('(')[0].trim()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-full">
              {categories.map((c) => {
                const isSelected = categoryId === c.id;
                const parts = c.name.match(/^(.*?)(?:\s*\((.*?)\))?$/);
                const en = parts ? parts[1].trim() : c.name;
                const am = parts && parts[2] ? parts[2].trim() : '';

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(c.id);
                      setBreedId('');
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all active:scale-95 flex flex-col justify-between min-w-0 w-full cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'bg-green-50 border-green-600 text-green-900 shadow-xs ring-1 ring-green-600/30'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full min-w-0">
                      <span className="text-xs font-bold truncate">{en}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />}
                    </div>
                    {am && (
                      <span
                        className={`text-[10px] truncate mt-0.5 ${
                          isSelected ? 'text-green-700 font-semibold' : 'text-gray-400'
                        }`}
                      >
                        {am}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Breed Selection */}
          <div className="space-y-1.5 w-full max-w-full">
            <div className="flex items-center justify-between text-xs font-black text-gray-700 uppercase tracking-wider">
              <span>Breed / ዝርያ (Optional)</span>
              {breedId && (
                <button
                  type="button"
                  onClick={() => setBreedId('')}
                  className="text-[11px] xs:text-xs text-gray-400 hover:text-red-500 font-medium"
                >
                  Clear breed
                </button>
              )}
            </div>
            {availableBreeds.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 w-full max-w-full">
                <button
                  type="button"
                  onClick={() => setBreedId('')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 border cursor-pointer ${
                    !breedId
                      ? 'bg-gray-800 text-white border-gray-800 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  Local / Cross / Other
                </button>
                {availableBreeds.map((b) => {
                  const isSelected = breedId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBreedId(isSelected ? '' : b.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 border cursor-pointer ${
                        isSelected
                          ? 'bg-green-600 text-white border-green-600 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No specific sub-breeds listed for this category. You can specify breed details in the title.</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
              Listing Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2nd Calving Holstein Friesian Dairy Cow (20L daily)"
              className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition font-medium"
            />
          </div>

          {/* Gender, Age & Optional Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                Gender *
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGender('FEMALE')}
                  className={`py-2 rounded-lg text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1 ${
                    gender === 'FEMALE'
                      ? 'bg-white shadow-xs text-green-800'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>Female ♀</span>
                  {gender === 'FEMALE' && <Check className="w-3 h-3 text-green-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => setGender('MALE')}
                  className={`py-2 rounded-lg text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1 ${
                    gender === 'MALE'
                      ? 'bg-white shadow-xs text-green-800'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>Male ♂</span>
                  {gender === 'MALE' && <Check className="w-3 h-3 text-green-600" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                Age *
              </label>
              <input
                type="text"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 4 years, 18 mos"
                className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Weight (kg)</span>
                <span className="text-[11px] xs:text-xs text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">Optional</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min={5}
                  max={2500}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 460"
                  className="w-full pl-3.5 pr-10 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* Dairy Cow / Maternal Attributes (የማልዳ / የወተት ላም ዝርዝር መረጃ) */}
          {(gender === 'FEMALE' || selectedCategory?.name?.toLowerCase().includes('cow') || selectedCategory?.name?.toLowerCase().includes('dairy') || selectedCategory?.name?.includes('የወተት')) && (
            <div className="w-full max-w-full min-w-0 p-3 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-green-50/40 to-teal-50/30 border border-emerald-200/80 shadow-xs space-y-4 overflow-hidden">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Milk className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-emerald-950 flex flex-wrap items-center gap-1.5">
                      <span>Dairy & Maternal Profile</span>
                      <span className="text-[11px] xs:text-xs font-bold text-emerald-700 font-sans">(የማልዳ / የወተት ላም መረጃ)</span>
                    </h3>
                    <p className="text-xs text-emerald-800/80 truncate">
                      Essential milk yield, calving history, udder condition, & pregnancy information
                    </p>
                  </div>
                </div>
                <span className="text-[10px] xs:text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300/60 hidden sm:inline-block shrink-0">
                  Dairy Cattle
                </span>
              </div>

              {/* 1. Daily Milk Yield */}
              <div className="w-full max-w-full min-w-0">
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex flex-wrap items-center justify-between gap-1">
                  <span className="flex items-center gap-1">
                    <Milk className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Daily Milk Yield (የቀን ወተት ምርት)</span>
                  </span>
                  <span className="text-[10px] xs:text-xs text-emerald-700 font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                    Liters / Day (ሊትር/ቀን)
                  </span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2 w-full min-w-0">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={120}
                      value={milkYieldLiters}
                      onChange={(e) => setMilkYieldLiters(e.target.value)}
                      placeholder="e.g. 18.5"
                      className="w-full pl-3.5 pr-14 py-2 sm:py-2.5 bg-white border border-emerald-300/80 rounded-xl text-xs sm:text-sm font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                      L/day
                    </span>
                  </div>
                  {/* Quick Select Yield Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[10, 15, 18, 22, 25].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setMilkYieldLiters(milkYieldLiters === amt.toString() ? '' : amt.toString())}
                        className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition active:scale-95 ${
                          milkYieldLiters === amt.toString()
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {amt} L
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Calving / Parity History (Styled like Animal Category for 100% mobile responsiveness) */}
              <div className="w-full max-w-full min-w-0 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-black text-gray-800 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Baby className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Calving History / የወለደችው ብዛት</span>
                  </span>
                  {calvingCount !== '' && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {calvingCount === '0'
                        ? '✓ Heifer (ያልወለደች ጊደር)'
                        : `✓ ${calvingCount} Calvings (${calvingCount} ጊዜ)`}
                    </span>
                  )}
                </div>

                {/* 2/3 Column Card Grid matching Category Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-full min-w-0">
                  {[
                    { count: '0', title: 'Heifer (0)', am: 'ያልወለደች ጊደር', givenBirth: false },
                    { count: '1', title: '1st Calving', am: '1 ጊዜ የወለደች', givenBirth: true },
                    { count: '2', title: '2nd Calving', am: '2 ጊዜ የወለደች', givenBirth: true },
                    { count: '3', title: '3rd Calving', am: '3 ጊዜ የወለደች', givenBirth: true },
                    { count: '4', title: '4+ Calvings', am: '4+ ጊዜ የወለደች', givenBirth: true },
                  ].map((item) => {
                    const isSelected = calvingCount === item.count;
                    return (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setCalvingCount('');
                            setHasGivenBirth(null);
                          } else {
                            setCalvingCount(item.count);
                            setHasGivenBirth(item.givenBirth);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all active:scale-95 flex flex-col justify-between min-w-0 w-full cursor-pointer overflow-hidden ${
                          isSelected
                            ? 'bg-green-50 border-green-600 text-green-900 shadow-xs ring-1 ring-green-600/30'
                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full min-w-0">
                          <span className="text-xs font-bold truncate">{item.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />}
                        </div>
                        <span
                          className={`text-[10px] truncate mt-0.5 ${
                            isSelected ? 'text-green-700 font-semibold' : 'text-gray-400'
                          }`}
                        >
                          {item.am}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Optional exact parity numeric input */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <label className="text-xs font-bold text-emerald-900 shrink-0">
                    Or exact calvings:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={calvingCount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCalvingCount(val);
                      if (val === '') {
                        setHasGivenBirth(null);
                      } else {
                        setHasGivenBirth(parseInt(val, 10) > 0);
                      }
                    }}
                    placeholder="e.g. 5"
                    className="w-16 px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 shrink-0"
                  />
                  <span className="text-xs font-semibold text-emerald-800 shrink-0">ጊዜ የወለደች</span>
                </div>
              </div>

              {/* 3. Udder & Breastfeeding Health */}
              <div className="w-full max-w-full min-w-0">
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5 flex flex-wrap items-center justify-between gap-1">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Udder & Teat Health (የጡትና የወተት ማጥባት ጤንነት)</span>
                  </span>
                  <span className="text-[10px] xs:text-xs text-emerald-700 font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                    Milking Quality
                  </span>
                </label>
                <div className="space-y-2 w-full min-w-0">
                  <input
                    type="text"
                    value={udderHealth}
                    onChange={(e) => setUdderHealth(e.target.value)}
                    placeholder="e.g. 4 Healthy & Functional Teats, Mastitis-Free (4ቱም ጡቶች ጤናማ ናቸው)"
                    className="w-full px-3.5 py-2 sm:py-2.5 bg-white border border-emerald-300/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  {/* Quick Pills for Udder Health */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      '4 Healthy Teats (4ቱም ጡቶች ጤናማ)',
                      'Mastitis-Free (ከጡት በሽታ የጠራች)',
                      'All Teats Milking (4ቱም የሚያልቡ)',
                      '3 Functional Teats (3ቱ ጤናማ)',
                    ].map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => setUdderHealth(udderHealth === pill ? '' : pill)}
                        className={`text-[11px] xs:text-xs font-semibold px-2.5 py-1 rounded-lg border transition active:scale-95 ${
                          udderHealth === pill
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Pregnancy Status (Styled like Animal Category for 100% mobile responsiveness) */}
              <div className="space-y-2 w-full max-w-full min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-black text-gray-800 uppercase tracking-wider">
                  <span>Pregnancy Status / የእርግዝና ሁኔታ {isPregnant === true && <span className="text-red-500">*</span>}</span>
                  <span className="text-[10px] xs:text-xs font-bold text-gray-500 bg-white/70 px-2 py-0.5 rounded border border-emerald-200/60">
                    {isPregnant === true
                      ? pregnancyMonths
                        ? `✓ ${pregnancyMonths} Mo (የ${pregnancyMonths} ወር)`
                        : '⚠️ Month Required'
                      : isPregnant === false
                      ? 'Not Pregnant (ክፍት)'
                      : 'Optional'}
                  </span>
                </div>

                {/* 2-Option Card Grid matching Category Selection */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-full min-w-0">
                  {[
                    { val: false, title: 'Not Pregnant', am: 'Open (ያልረገዘች)' },
                    { val: true, title: 'Pregnant 🤰', am: 'In-Calf (እርጉዝ)' },
                  ].map((item) => {
                    const isSelected = isPregnant === item.val;
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setIsPregnant(null);
                            setPregnancyMonths('');
                          } else {
                            setIsPregnant(item.val);
                            if (!item.val) setPregnancyMonths('');
                          }
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all active:scale-95 flex flex-col justify-between min-w-0 w-full cursor-pointer overflow-hidden ${
                          isSelected
                            ? item.val
                              ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-xs ring-1 ring-purple-600/30'
                              : 'bg-green-50 border-green-600 text-green-900 shadow-xs ring-1 ring-green-600/30'
                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full min-w-0">
                          <span className="text-xs font-bold truncate">{item.title}</span>
                          {isSelected && (
                            <Check
                              className={`w-3.5 h-3.5 shrink-0 ${
                                item.val ? 'text-purple-600' : 'text-green-600'
                              }`}
                            />
                          )}
                        </div>
                        <span
                          className={`text-[10px] truncate mt-0.5 ${
                            isSelected
                              ? item.val
                                ? 'text-purple-700 font-semibold'
                                : 'text-green-700 font-semibold'
                              : 'text-gray-400'
                          }`}
                        >
                          {item.am}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Specific Pregnancy Month Selector (Months 1 - 9) */}
                {isPregnant === true && (
                  <div className="p-3 sm:p-4 bg-white rounded-2xl border border-purple-200 shadow-xs space-y-2.5 animate-fadeIn w-full max-w-full overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-xs font-black text-purple-950 flex items-center gap-1">
                        <span>🤰</span>
                        <span>Exact Gestation Duration (ስንት ወር ሆኗታል?)*</span>
                      </span>
                      {pregnancyMonths && (
                        <span className="text-[11px] xs:text-xs font-black text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                          Month {pregnancyMonths} (የ{pregnancyMonths} ወር)
                        </span>
                      )}
                    </div>

                    {/* Months 1-9 Touch Buttons */}
                    <div className="grid grid-cols-5 xs:grid-cols-9 gap-1.5 w-full max-w-full min-w-0">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((m) => {
                        const isSelected = pregnancyMonths === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPregnancyMonths(m)}
                            className={`py-2 px-1 rounded-xl text-center border transition-all active:scale-95 flex flex-col items-center justify-center cursor-pointer min-w-0 w-full overflow-hidden ${
                              isSelected
                                ? 'bg-purple-700 text-white border-purple-700 shadow-sm ring-2 ring-purple-400 font-black'
                                : 'bg-purple-50/60 text-purple-950 border-purple-200/80 hover:bg-purple-100 font-bold'
                            }`}
                          >
                            <span className="text-sm font-black leading-tight">{m}</span>
                            <span
                              className={`text-[9px] xs:text-[10px] leading-none mt-0.5 truncate w-full ${
                                isSelected ? 'text-purple-200' : 'text-purple-700'
                              }`}
                            >
                              {m} ወር
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Decimal Input & Stage Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-bold text-purple-900 shrink-0">
                          Or exact month:
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="9"
                          value={pregnancyMonths}
                          onChange={(e) => setPregnancyMonths(e.target.value)}
                          placeholder="e.g. 5.5"
                          className="w-20 px-2.5 py-1 bg-gray-50 border border-purple-300 rounded-lg text-xs font-bold text-purple-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shrink-0"
                        />
                        <span className="text-xs font-semibold text-purple-800 shrink-0">ወራት</span>
                      </div>

                      {pregnancyMonths && (
                        <span className="text-purple-900 font-bold text-[11px] xs:text-xs bg-purple-100/80 px-2 py-0.5 rounded-md border border-purple-200">
                          {parseFloat(pregnancyMonths) <= 3
                            ? 'Early / 1st Trimester'
                            : parseFloat(pregnancyMonths) <= 6
                            ? 'Mid-term Gestation'
                            : 'Late Term / Near Calving'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Price & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-green-600" />
                <span>Price (ETB) *</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={100}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 165000"
                  className="w-full pl-3.5 pr-14 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-green-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                  ETB
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-green-600" />
                <span>Contact Phone *</span>
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+251 911 123456"
                className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition font-medium"
              />
            </div>
          </div>

          {/* Structured Location (100% Inside Mobile Boundary) */}
          <div className="space-y-3 sm:space-y-4 w-full max-w-full">
            {/* Region Selection */}
            <div className="space-y-1.5 w-full max-w-full">
              <div className="flex items-center justify-between text-xs font-black text-gray-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>Region / ክልል *</span>
                </span>
                <span className="text-[11px] xs:text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                  {region}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-full max-w-full">
                {['Oromia', 'Addis Ababa', 'Amhara', 'Sidama', 'Somali', 'Tigray'].map((r) => {
                  const isSelected = region === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRegion(r);
                        setCity('');
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer active:scale-95 text-left min-w-0 ${
                        isSelected
                          ? 'bg-green-50 border-green-600 text-green-900 shadow-xs ring-1 ring-green-600/30'
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="truncate">{r}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-green-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City / Town & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 w-full max-w-full">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  City / Town *
                </label>
                {availableCities.length > 0 ? (
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  >
                    <option value="">Select City</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Sululta, Bishoftu..."
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm"
                  />
                )}
              </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                Area / Kebele (Optional)
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Chancho, Babogaya"
                className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe health, lactation/yield, feeding ration, temperament, and inspection visiting hours..."
              className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          {/* Three Required Photos Section */}
          <div className="space-y-3 border-t border-gray-100 pt-4 sm:pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-green-600" />
                  <span>Three Required Livestock Photos</span>
                </h3>
                <p className="text-xs sm:text-xs text-gray-500">
                  Clear photos from all 3 angles allow buyers to properly verify your animal.
                </p>
              </div>
              <span className="self-start sm:self-auto text-[10px] xs:text-xs font-bold bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded-full">
                3 Angles Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {renderAngleUploader(
                'FRONT',
                '1. Profile / Front',
                'Face & body frontal view',
                frontUrl,
                setFrontUrl,
                frontInputRef
              )}
              {renderAngleUploader(
                'LEFT',
                '2. Left Side View',
                'Full left body profile',
                leftUrl,
                setLeftUrl,
                leftInputRef
              )}
              {renderAngleUploader(
                'RIGHT',
                '3. Right Side View',
                'Full right body profile',
                rightUrl,
                setRightUrl,
                rightInputRef
              )}
            </div>
          </div>

          {/* Physical Inspection Agreement */}
          <div
            onClick={() => setInspectedAgreed(!inspectedAgreed)}
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
              inspectedAgreed
                ? 'bg-green-50/80 border-green-400 text-green-950 shadow-xs'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition ${
                inspectedAgreed
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-amber-400 bg-white'
              }`}
            >
              {inspectedAgreed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="font-black flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-700 shrink-0" />
                <span>Physical Inspection Policy Agreement *</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                I understand buyers must inspect the livestock physically before purchasing. I agree not to ask for or accept any advance online deposits or wire transfers.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 sm:py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-md shadow-green-600/30 transition active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Publishing Listing...</span>
              </>
            ) : (
              <span>Publish Livestock Listing</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
