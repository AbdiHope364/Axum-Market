import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@axum/database';
import ImageGallery from '@/components/ImageGallery';
import CallSellerButton from '@/components/CallSellerButton';
import SafetyNotice from '@/components/SafetyNotice';
import { formatPriceETB } from '@/lib/constants';
import { MapPin, Shield, Calendar, User, Flag, ArrowLeft, CheckCircle2 } from 'lucide-react';
import ListingDetailClientActions from './ListingDetailClientActions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      category: true,
      breed: true,
      images: true,
      seller: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          city: true,
          region: true,
          createdAt: true,
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const isSold = listing.status === 'SOLD';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-green-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>

        {isSold && (
          <span className="bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-red-200">
            Animal Sold
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: 3-Photo Gallery & Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3-view Image Gallery */}
          <div className="bg-white p-3 sm:p-5 rounded-3xl border border-gray-200 shadow-sm">
            <ImageGallery images={listing.images} title={listing.title} />
          </div>

          {/* Title & Price Header (Mobile only) */}
          <div className="lg:hidden bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-green-100 text-green-800 font-semibold px-2.5 py-0.5 rounded-full">
                {listing.category.name}
              </span>
              {listing.breed && (
                <span className="bg-gray-100 text-gray-800 font-semibold px-2.5 py-0.5 rounded-full">
                  {listing.breed.name}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              {listing.title}
            </h1>

            <div className="text-2xl font-black text-green-700">
              {formatPriceETB(listing.price)}
            </div>
          </div>

          {/* Detailed Attributes Grid */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Livestock Details & Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-xs">Animal Category</span>
                <span className="font-bold text-gray-900">{listing.category.name}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-xs">Breed</span>
                <span className="font-bold text-gray-900">{listing.breed?.name || 'Cross / Local'}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-xs">Gender</span>
                <span className="font-bold text-gray-900">
                  {listing.gender === 'FEMALE' ? 'Female' : 'Male'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-xs">Age</span>
                <span className="font-bold text-gray-900">{listing.age}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl sm:col-span-2">
                <span className="text-gray-500 block text-xs">Inspection Location</span>
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-green-600" />
                  {listing.city}, {listing.region} {listing.area ? `(${listing.area})` : ''}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-2 space-y-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Seller&rsquo;s Description
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                {listing.description}
              </p>
            </div>
          </div>

          {/* Safety Notice Box */}
          <SafetyNotice variant="card" />
        </div>

        {/* Right Col: Price, Seller & Call Action (Desktop) */}
        <div className="space-y-6">
          {/* Desktop Summary Card */}
          <div className="hidden lg:block bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-green-100 text-green-800 font-semibold px-2.5 py-0.5 rounded-full">
                {listing.category.name}
              </span>
              {listing.breed && (
                <span className="bg-gray-100 text-gray-800 font-semibold px-2.5 py-0.5 rounded-full">
                  {listing.breed.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-gray-900 leading-tight">
              {listing.title}
            </h1>

            <div className="text-3xl font-black text-green-700">
              {formatPriceETB(listing.price)}
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>
                {listing.city}, {listing.region} {listing.area ? `• ${listing.area}` : ''}
              </span>
            </div>

            {/* Call Seller Button */}
            {!isSold ? (
              <div className="pt-3">
                <CallSellerButton
                  phoneNumber={listing.contactPhone}
                  sellerName={listing.seller.fullName}
                  variant="primary"
                />
              </div>
            ) : (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-center font-bold text-sm">
                This animal has already been marked as sold.
              </div>
            )}
          </div>

          {/* Seller Profile Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Seller Information
              </span>
              <span className="text-[11px] bg-green-50 text-green-800 font-bold px-2 py-0.5 rounded-md border border-green-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                Verified Seller
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 font-black text-lg flex items-center justify-center shrink-0">
                {listing.seller.fullName[0]}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-base text-gray-900 truncate">
                  {listing.seller.fullName}
                </h4>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {listing.seller.city}, {listing.seller.region}
                </p>
              </div>
            </div>

            {/* Mobile Call Buttons */}
            <div className="lg:hidden pt-2">
              {!isSold ? (
                <CallSellerButton
                  phoneNumber={listing.contactPhone}
                  sellerName={listing.seller.fullName}
                  variant="primary"
                />
              ) : (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-center font-bold text-xs">
                  Sold
                </div>
              )}
            </div>

            {/* Report listing trigger */}
            <div className="border-t border-gray-100 pt-3">
              <ListingDetailClientActions
                listingId={listing.id}
                listingTitle={listing.title}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Call Button for Mobile Phones */}
      {!isSold && (
        <CallSellerButton
          phoneNumber={listing.contactPhone}
          sellerName={listing.seller.fullName}
          variant="sticky"
        />
      )}
    </div>
  );
}

