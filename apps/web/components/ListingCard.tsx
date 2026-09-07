'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, CheckCircle, ShieldAlert } from 'lucide-react';
import { formatPriceETB } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';

export interface ListingCardData {
  id: string;
  title: string;
  price: number;
  weightKg?: number | null;
  milkYieldLiters?: number | null;
  hasGivenBirth?: boolean | null;
  calvingCount?: number | null;
  isPregnant?: boolean | null;
  pregnancyMonths?: number | null;
  age: string;
  gender: string;
  region: string;
  city: string;
  area?: string | null;
  contactPhone: string;
  status: string;
  category: {
    name: string;
    icon?: string | null;
  };
  breed?: {
    name: string;
  } | null;
  images: {
    imageUrl: string;
    imageType: string;
  }[];
  seller?: {
    fullName: string;
  };
}

export default function ListingCard({ listing }: { listing: ListingCardData }) {
  const { t } = useLanguage();
  const images = Array.isArray(listing?.images) ? listing.images : [];
  
  // Sort images to ensure FRONT/PROFILE is first
  const orderedImages = React.useMemo(() => {
    if (images.length === 0) return [];
    return [...images].sort((a, b) => {
      const order: Record<string, number> = { FRONT: 1, PROFILE: 1, LEFT: 2, RIGHT: 3 };
      return (order[a.imageType] || 4) - (order[b.imageType] || 4);
    });
  }, [images]);

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // Auto-cycle images every 1 second
  React.useEffect(() => {
    if (orderedImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % orderedImages.length);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [orderedImages.length]);

  const activeImage = orderedImages[currentImageIndex];
  const imageUrl = activeImage?.imageUrl || '/logo-emblem.png';

  const isSold = listing?.status === 'SOLD';
  const categoryName = listing?.category?.name || 'Livestock';

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      {/* Image & Badges */}
      <Link href={`/listings/${listing?.id || ''}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        {orderedImages.length > 0 ? (
          orderedImages.map((img, index) => (
            <Image
              key={img.imageUrl || index}
              src={img.imageUrl || '/logo-emblem.png'}
              alt={listing?.title || 'Livestock'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-500 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))
        ) : (
          <Image
            src="/logo-emblem.png"
            alt={listing?.title || 'Livestock'}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-opacity duration-500 opacity-100"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-wrap gap-1">
          <span className="bg-black/70 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md sm:rounded-full flex items-center">
            <span className="truncate max-w-[70px] sm:max-w-none">{categoryName}</span>
          </span>
          {listing?.weightKg && (
            <span className="bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full shadow-xs flex items-center gap-0.5">
              <span>⚖️</span>
              <span>{listing.weightKg} kg</span>
            </span>
          )}
          {listing?.milkYieldLiters && (
            <span className="bg-emerald-600 text-white font-black text-[9px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full shadow-xs flex items-center gap-0.5">
              <span>🥛</span>
              <span>{listing.milkYieldLiters} L/day</span>
            </span>
          )}
          {listing?.breed?.name && (
            <span className="hidden sm:inline-block bg-white/90 backdrop-blur-md text-gray-800 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-xs truncate max-w-[90px]">
              {listing.breed.name}
            </span>
          )}
        </div>

        {/* Sold Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3">
            <span className="bg-red-600 text-white font-black text-xs sm:text-sm px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              {t('sold_out')}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-2 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          {/* Price */}
          <div className="text-sm sm:text-lg font-black text-green-700 tracking-tight">
            {formatPriceETB(listing?.price || 0)}
          </div>

          {/* Title */}
          <Link href={`/listings/${listing?.id || ''}`} className="block group-hover:text-green-700 transition">
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1 leading-snug mt-0.5">
              {listing?.title || 'Livestock'}
            </h3>
          </Link>

          {/* Attributes Pills (Gender, Age, Weight, Milk Yield) */}
          <div className="flex flex-wrap gap-1 mt-1 sm:mt-1.5 text-[9px] sm:text-xs">
            <span className="bg-gray-100 text-gray-700 font-medium px-1.5 py-0.5 rounded">
              {listing?.gender === 'FEMALE' ? t('female') : t('male')}
            </span>
            {listing?.age && (
              <span className="bg-gray-100 text-gray-700 font-medium px-1.5 py-0.5 rounded">
                {listing.age}
              </span>
            )}
            {listing?.weightKg && (
              <span className="bg-amber-50 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <span>⚖️</span>
                <span>{listing.weightKg} kg</span>
              </span>
            )}
            {listing?.milkYieldLiters && (
              <span className="bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <span>🥛</span>
                <span>{listing.milkYieldLiters} {t('liters_day')}</span>
              </span>
            )}
            {listing?.isPregnant && (
              <span className="bg-purple-50 text-purple-900 border border-purple-200 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <span>🤰</span>
                <span>{listing.pregnancyMonths ? `${listing.pregnancyMonths}M ${t('in_calf')}` : t('in_calf')}</span>
              </span>
            )}
          </div>

          {/* Location & Direct Phone Tag */}
          <div className="flex items-center justify-between gap-1 text-[9px] sm:text-xs text-gray-500 mt-1 sm:mt-1.5">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">
                {listing?.city || ''}{listing?.city && listing?.region ? ', ' : ''}{listing?.region || ''}
              </span>
            </div>
            {listing?.contactPhone && (
              <span className="font-mono text-[9px] text-gray-500 shrink-0 bg-gray-50 px-1 py-0.2 rounded border border-gray-100 hidden xs:inline-block">
                📞 {listing.contactPhone.replace(/[^\d+]/g, '').slice(-4)}
              </span>
            )}
          </div>
        </div>

        {/* Actions (Call Seller direct dial) */}
        <div className="pt-1.5 sm:pt-2.5 mt-1.5 sm:mt-2 border-t border-gray-100 flex items-center gap-1.5">
          {!isSold && listing?.contactPhone ? (
            <a
              href={`tel:${listing.contactPhone}`}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-xs shadow-xs transition min-h-[36px]"
              title={`Call ${listing.contactPhone}`}
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{t('call')}</span>
            </a>
          ) : (
            <button
              disabled
              className="flex-1 py-2 px-2 rounded-xl bg-gray-100 text-gray-400 font-medium text-[11px] text-center cursor-not-allowed min-h-[36px]"
            >
              {isSold ? t('sold_out') : 'No Phone'}
            </button>
          )}

          <Link
            href={`/listings/${listing.id}`}
            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition text-center min-h-[36px] flex items-center justify-center shrink-0"
          >
            {t('details')}
          </Link>
        </div>
      </div>
    </div>
  );
}

