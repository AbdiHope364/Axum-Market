'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, CheckCircle2, AlertCircle, ArrowLeft, Camera, ShieldCheck } from 'lucide-react';

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-green-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2 border-b border-gray-100 pb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
            Livestock Classifieds Form
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Add New Livestock Listing
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Please fill in accurate details and provide clear photos from all 3 angles so buyers can inspect properly.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category & Breed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Animal Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setBreedId('');
                }}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Breed (Optional / Dropdown)
              </label>
              <select
                value={breedId}
                onChange={(e) => setBreedId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Listing Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2nd Calving Holstein Friesian Dairy Cow (20L daily)"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Gender, Age & Optional Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Gender *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('FEMALE')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    gender === 'FEMALE'
                      ? 'bg-green-600 text-white border-green-600 shadow-sm'
                      : 'border-gray-300 text-gray-700 bg-gray-50'
                  }`}
                >
                  Female ♀
                </button>
                <button
                  type="button"
                  onClick={() => setGender('MALE')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    gender === 'MALE'
                      ? 'bg-green-600 text-white border-green-600 shadow-sm'
                      : 'border-gray-300 text-gray-700 bg-gray-50'
                  }`}
                >
                  Male ♂
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Age *
              </label>
              <input
                type="text"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 4 years, 18 months, or 4 teeth"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Weight (kg) / ክብደት</span>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">Optional</span>
              </label>
              <input
                type="number"
                step="0.5"
                min={5}
                max={2500}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 460 kg (Bulls/በሬ)"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Price & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Price in ETB (Ethiopian Birr) *
              </label>
              <input
                type="number"
                required
                min={100}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 165000"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-green-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Contact Phone (For Buyer Calls) *
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+251 911 123456"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Structured Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Region *
              </label>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setCity('');
                }}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                City / Town *
              </label>
              {availableCities.length > 0 ? (
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Area / Kebele (Optional)
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Chancho, Babogaya"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe health, lactation/yield, feeding ration, temperament, and inspection visiting hours..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Three Required Photos Section */}
          <div className="space-y-3 border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Three Required Livestock Photos
                </h3>
                <p className="text-xs text-gray-500">
                  Per platform guidelines, provide exactly the 3 essential inspection views.
                </p>
              </div>
              <span className="text-[11px] font-bold bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded-md">
                3 Angles Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Front Photo */}
              <div className="space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="font-bold text-xs text-gray-800 block">
                  1. Profile / Front View *
                </span>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
                  {frontUrl ? (
                    <Image src={frontUrl} alt="Front View" fill className="object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'FRONT')}
                  className="text-xs w-full"
                />
                <input
                  type="url"
                  value={frontUrl}
                  onChange={(e) => setFrontUrl(e.target.value)}
                  placeholder="Or paste image URL"
                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                />
              </div>

              {/* Left Side Photo */}
              <div className="space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="font-bold text-xs text-gray-800 block">
                  2. Left Side View *
                </span>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
                  {leftUrl ? (
                    <Image src={leftUrl} alt="Left Side" fill className="object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'LEFT')}
                  className="text-xs w-full"
                />
                <input
                  type="url"
                  value={leftUrl}
                  onChange={(e) => setLeftUrl(e.target.value)}
                  placeholder="Or paste image URL"
                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                />
              </div>

              {/* Right Side Photo */}
              <div className="space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="font-bold text-xs text-gray-800 block">
                  3. Right Side View *
                </span>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
                  {rightUrl ? (
                    <Image src={rightUrl} alt="Right Side" fill className="object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'RIGHT')}
                  className="text-xs w-full"
                />
                <input
                  type="url"
                  value={rightUrl}
                  onChange={(e) => setRightUrl(e.target.value)}
                  placeholder="Or paste image URL"
                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setFrontUrl('https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80');
                  setLeftUrl('https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80');
                  setRightUrl('https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=800&q=80');
                }}
                className="text-xs text-green-700 hover:underline font-semibold"
              >
                + Fill Sample 3-Angle Demo Images
              </button>
            </div>
          </div>

          {/* Physical Inspection Agreement */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={inspectedAgreed}
                onChange={(e) => setInspectedAgreed(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded mt-0.5"
              />
              <span className="text-xs text-amber-950 font-medium">
                I understand buyers must inspect the livestock physically before purchasing. I agree not to ask for or accept any online deposits or advance money transfers.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-base shadow-md transition active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Publishing Listing...' : 'Publish Livestock Listing'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

