import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, CheckCircle, ShieldAlert } from 'lucide-react';
import { formatPriceETB } from '@/lib/constants';

export interface ListingCardData {
  id: string;
  title: string;
  price: number;
  weightKg?: number | null;
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
  const frontImage =
    listing.images.find((img) => img.imageType === 'FRONT' || img.imageType === 'PROFILE') ||
    listing.images[0];
  const imageUrl =
    frontImage?.imageUrl ||
    'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80';

  const isSold = listing.status === 'SOLD';

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      {/* Image & Badges */}
      <Link href={`/listings/${listing.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span className="bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span>{listing.category.icon || '🐾'}</span>
            <span>{listing.category.name}</span>
          </span>
          {listing.weightKg && (
            <span className="bg-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <span>⚖️</span>
              <span>{listing.weightKg} kg</span>
            </span>
          )}
          {listing.breed && (
            <span className="bg-white/90 backdrop-blur-md text-gray-800 text-[11px] font-semibold px-2 py-1 rounded-full shadow-sm">
              {listing.breed.name}
            </span>
          )}
        </div>

        {/* Sold Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-extrabold text-sm uppercase tracking-widest px-4 py-1.5 rounded-lg rotate-[-6deg] shadow-lg border border-white">
              SOLD
            </span>
          </div>
        )}

        {/* 3 Photos Indicator */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
          {listing.images.length || 3} Photos
        </div>
      </Link>

      {/* Body Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between gap-1 mb-1">
            <span className="text-base sm:text-2xl font-black text-green-700 tracking-tight">
              {formatPriceETB(listing.price)}
            </span>
          </div>

          {/* Title */}
          <Link href={`/listings/${listing.id}`} className="block">
            <h3 className="font-bold text-gray-900 text-xs sm:text-base line-clamp-1 group-hover:text-green-600 transition-colors">
              {listing.title}
            </h3>
          </Link>

          {/* Attributes Pills (Gender, Age, Weight) */}
          <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-xs">
            <span className="bg-gray-100 text-gray-700 font-medium px-1.5 sm:px-2 py-0.5 rounded-md">
              {listing.gender === 'FEMALE' ? 'Female' : 'Male'}
            </span>
            <span className="bg-gray-100 text-gray-700 font-medium px-1.5 sm:px-2 py-0.5 rounded-md">
              Age: {listing.age}
            </span>
            {listing.weightKg && (
              <span className="bg-amber-50 text-amber-900 border border-amber-300 font-bold px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1">
                <span>⚖️</span>
                <span>{listing.weightKg} kg (ኪ.ግ)</span>
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs mt-2 sm:mt-3">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">
              {listing.city}, {listing.region}
            </span>
          </div>
        </div>

        {/* Actions (Call Seller direct dial) */}
        <div className="pt-2.5 sm:pt-4 mt-2 sm:mt-3 border-t border-gray-100 flex items-center gap-1.5 sm:gap-2">
          {!isSold ? (
            <a
              href={`tel:${listing.contactPhone}`}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl bg-green-600 hover:bg-green-700 active:scale-98 text-white font-bold text-[11px] sm:text-sm shadow-sm transition"
              title={`Call ${listing.contactPhone}`}
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Call</span>
            </a>
          ) : (
            <button
              disabled
              className="flex-1 py-2 sm:py-2.5 px-2 rounded-xl bg-gray-100 text-gray-400 font-medium text-[10px] sm:text-xs text-center cursor-not-allowed"
            >
              Sold
            </button>
          )}

          <Link
            href={`/listings/${listing.id}`}
            className="px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[11px] sm:text-sm transition text-center"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

