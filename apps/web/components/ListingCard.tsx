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
    <div className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      {/* Image & Badges */}
      <Link href={`/listings/${listing.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-wrap gap-1">
          <span className="bg-black/70 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full flex items-center gap-1">
            <span>{listing.category.icon || '🐾'}</span>
            <span className="truncate max-w-[70px] sm:max-w-none">{listing.category.name}</span>
          </span>
          {listing.weightKg && (
            <span className="bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full shadow-xs flex items-center gap-0.5">
              <span>⚖️</span>
              <span>{listing.weightKg} kg</span>
            </span>
          )}
          {listing.breed && (
            <span className="hidden sm:inline-block bg-white/90 backdrop-blur-md text-gray-800 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-xs truncate max-w-[90px]">
              {listing.breed.name}
            </span>
          )}
        </div>

        {/* Sold Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-widest px-3 py-1 rounded-lg rotate-[-6deg] shadow-lg border border-white">
              SOLD
            </span>
          </div>
        )}

        {/* 3 Photos Indicator */}
        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded">
          {listing.images.length || 3} Photos
        </div>
      </Link>

      {/* Body Content */}
      <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between gap-1 mb-0.5">
            <span className="text-sm sm:text-lg font-black text-green-700 tracking-tight">
              {formatPriceETB(listing.price)}
            </span>
          </div>

          {/* Title */}
          <Link href={`/listings/${listing.id}`} className="block">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-green-600 transition-colors">
              {listing.title}
            </h3>
          </Link>

          {/* Attributes Pills (Gender, Age, Weight) */}
          <div className="flex flex-wrap gap-1 mt-1 sm:mt-1.5 text-[9px] sm:text-xs">
            <span className="bg-gray-100 text-gray-700 font-medium px-1.5 py-0.5 rounded">
              {listing.gender === 'FEMALE' ? 'Female' : 'Male'}
            </span>
            <span className="bg-gray-100 text-gray-700 font-medium px-1.5 py-0.5 rounded">
              {listing.age}
            </span>
            {listing.weightKg && (
              <span className="bg-amber-50 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <span>⚖️</span>
                <span>{listing.weightKg} kg</span>
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-500 text-[9px] sm:text-xs mt-1.5 sm:mt-2">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="truncate">
              {listing.city}, {listing.region}
            </span>
          </div>
        </div>

        {/* Actions (Call Seller direct dial) */}
        <div className="pt-2 sm:pt-3 mt-1.5 sm:mt-2.5 border-t border-gray-100 flex items-center gap-1 sm:gap-2">
          {!isSold ? (
            <a
              href={`tel:${listing.contactPhone}`}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-lg sm:rounded-xl bg-green-600 hover:bg-green-700 active:scale-98 text-white font-bold text-[11px] sm:text-xs shadow-xs transition"
              title={`Call ${listing.contactPhone}`}
            >
              <Phone className="w-3 h-3 shrink-0" />
              <span>Call</span>
            </a>
          ) : (
            <button
              disabled
              className="flex-1 py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl bg-gray-100 text-gray-400 font-medium text-[10px] sm:text-xs text-center cursor-not-allowed"
            >
              Sold
            </button>
          )}

          <Link
            href={`/listings/${listing.id}`}
            className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[10px] sm:text-xs transition text-center"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

