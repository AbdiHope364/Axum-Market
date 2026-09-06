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
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            ) : (
              <span className="shrink-0 text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                Required
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mb-2 leading-tight">{subtitle}</p>
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
                  className="px-2.5 py-1 bg-white/90 hover:bg-white text-gray-900 text-[11px] font-bold rounded-lg shadow-xs flex items-center gap-1 active:scale-95 transition"
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
                  <span className="text-[11px] font-bold">Uploading...</span>
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
                  className="text-[10px] text-gray-400 hover:text-gray-600"
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
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-24 md:pb-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 px-2 py-1 -ml-1 text-xs sm:text-sm font-bold text-gray-600 hover:text-green-700 hover:bg-gray-100 rounded-lg transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Seller Dashboard</span>
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-4 sm:p-7 md:p-8 shadow-xs space-y-5 sm:space-y-6">
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

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Category & Breed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-green-600" />
                <span>Animal Category *</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setBreedId('');
                }}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span>Breed (Optional)</span>
              </label>
              <select
                value={breedId}
                onChange={(e) => setBreedId(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                <option value="">Select Breed (or Cross / Local)</option>
                {availableBreeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
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
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Weight (kg)</span>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">Optional</span>
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

          {/* Price & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
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
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
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

          {/* Structured Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-green-600" />
                <span>Region *</span>
              </label>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setCity('');
                }}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                <option value="Oromia">Oromia</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Amhara">Amhara</option>
                <option value="Sidama">Sidama</option>
                <option value="Somali">Somali</option>
                <option value="Tigray">Tigray</option>
              </select>
            </div>

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
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Clear photos from all 3 angles allow buyers to properly verify your animal.
                </p>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-bold bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded-full">
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
              <p className="text-[11px] leading-relaxed opacity-90">
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
