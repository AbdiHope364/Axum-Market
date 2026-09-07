import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@axum/database';
import ImageGallery from '@/components/ImageGallery';
import CallSellerButton from '@/components/CallSellerButton';
import SafetyNotice from '@/components/SafetyNotice';
import AutoTranslateText from '@/components/AutoTranslateText';
import { formatPriceETB } from '@/lib/constants';
import { MapPin, Shield, Calendar, User, Flag, ArrowLeft, CheckCircle2, Milk, Baby, Activity } from 'lucide-react';
import ListingDetailClientActions from './ListingDetailClientActions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;

  let rawListing = null;
  try {
    rawListing = await prisma.listing.findUnique({
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
  } catch (err) {
    console.error(`ListingDetailPage DB error for id ${id}:`, err);
  }

  if (!rawListing) {
    notFound();
  }

  const listing = rawListing as typeof rawListing & {
    milkYieldLiters?: number | null;
    hasGivenBirth?: boolean | null;
    calvingCount?: number | null;
    udderHealth?: string | null;
    isPregnant?: boolean | null;
    pregnancyMonths?: number | null;
  };

  const isSold = listing.status === 'SOLD';

  return (
    <div className="max-w-6xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-3 sm:space-y-6 pb-24 md:pb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
        {/* Left 2 Cols: 3-Photo Gallery & Specs */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-6">
          {/* 3-view Image Gallery */}
          <div className="bg-white p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs">
            <ImageGallery images={listing.images} title={listing.title} />
          </div>

          {/* Title & Price Header (Mobile only) */}
          <div className="lg:hidden bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-md">
                {listing.category.name}
              </span>
              {listing.breed && (
                <span className="bg-gray-100 text-gray-800 font-semibold px-2 py-0.5 rounded-md">
                  {listing.breed.name}
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-gray-900 leading-tight">
              {listing.title}
            </h1>

            <div className="text-xl sm:text-2xl font-black text-green-700">
              {formatPriceETB(listing.price)}
            </div>
          </div>

          {/* Detailed Attributes Grid */}
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 space-y-3 sm:space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Livestock Details & Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="p-2 sm:p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-[11px]">Animal Category</span>
                <span className="font-bold text-gray-900">{listing.category.name}</span>
              </div>

              <div className="p-2 sm:p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-[11px]">Breed</span>
                <span className="font-bold text-gray-900">{listing.breed?.name || 'Cross / Local'}</span>
              </div>

              <div className="p-2 sm:p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-[11px]">Gender</span>
                <span className="font-bold text-gray-900">
                  {listing.gender === 'FEMALE' ? 'Female' : 'Male'}
                </span>
              </div>

              <div className="p-2 sm:p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-[11px]">Age</span>
                <span className="font-bold text-gray-900">{listing.age}</span>
              </div>

              {listing.weightKg && (
                <div className="p-2 sm:p-3 bg-amber-50/90 border border-amber-200 rounded-xl">
                  <span className="text-amber-800 block text-[11px] font-semibold">Live Weight / ክብደት</span>
                  <span className="font-black text-amber-950 text-xs sm:text-base flex items-center gap-1 mt-0.5">
                    <span>⚖️</span>
                    <span>{listing.weightKg} kg</span>
                  </span>
                </div>
              )}

              <div className={`p-2 sm:p-3 bg-gray-50 rounded-xl ${listing.weightKg ? 'sm:col-span-1' : 'sm:col-span-2'}`}>
                <span className="text-gray-500 block text-[11px]">Inspection Location</span>
                <span className="font-bold text-gray-900 flex items-center gap-1 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  {listing.city}, {listing.region} {listing.area ? `(${listing.area})` : ''}
                </span>
              </div>
            </div>

            {/* Dairy & Maternal Profile (የማልዳ / የወተት ላም ዝርዝር መረጃ) */}
            {(listing.milkYieldLiters !== null ||
              listing.calvingCount !== null ||
              listing.hasGivenBirth !== null ||
              listing.udderHealth ||
              listing.isPregnant !== null) && (
              <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-green-50/40 to-teal-50/30 border border-emerald-200/90 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Milk className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                        <span>Dairy & Maternal Profile</span>
                        <span className="text-[11px] font-bold text-emerald-700 font-sans">(የማልዳ / የወተት ላም መረጃ)</span>
                      </h3>
                      <p className="text-[11px] text-emerald-800/80">
                        Verified dairy productivity & maternal characteristics
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300/60">
                    Dairy Profile
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Daily Milk Yield */}
                  {listing.milkYieldLiters !== null && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Daily Milk (የቀን ወተት)
                      </span>
                      <span className="font-black text-emerald-950 text-sm sm:text-base mt-1 flex items-baseline gap-1">
                        <span>{listing.milkYieldLiters}</span>
                        <span className="text-xs font-semibold text-emerald-700">L/day</span>
                      </span>
                    </div>
                  )}

                  {/* Calving Parity */}
                  {(listing.calvingCount !== null || listing.hasGivenBirth !== null) && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Calvings (የወለደችው)
                      </span>
                      <span className="font-bold text-emerald-950 text-xs sm:text-sm mt-1 block truncate">
                        {listing.calvingCount === 0 || listing.hasGivenBirth === false
                          ? 'Heifer (ያልወለደች)'
                          : `${listing.calvingCount} Calvings (${listing.calvingCount} ጊዜ)`}
                      </span>
                    </div>
                  )}

                  {/* Pregnancy Status */}
                  {listing.isPregnant !== null && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Pregnancy (እርግዝና)
                      </span>
                      <span className="font-bold text-emerald-950 text-xs sm:text-sm mt-1 block truncate">
                        {listing.isPregnant
                          ? listing.pregnancyMonths
                            ? `${listing.pregnancyMonths} Months (የ${listing.pregnancyMonths} ወር)`
                            : 'Pregnant (ያረገዘች)'
                          : 'Not Pregnant (ክፍት)'}
                      </span>
                      {listing.isPregnant && listing.pregnancyMonths && (
                        <span className="text-[9px] text-purple-700 font-semibold block mt-0.5 truncate">
                          🤰 Month {listing.pregnancyMonths} of 9
                        </span>
                      )}
                    </div>
                  )}

                  {/* Udder & Teats Health */}
                  {listing.udderHealth && (
                    <div className={`p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs ${
                      listing.milkYieldLiters !== null && listing.isPregnant !== null && (listing.calvingCount !== null || listing.hasGivenBirth !== null) ? 'col-span-2 sm:col-span-1' : 'col-span-2'
                    }`}>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Udder Health (የጡት ጤንነት)
                      </span>
                      <span className="font-bold text-emerald-950 text-xs sm:text-sm mt-1 block truncate" title={listing.udderHealth}>
                        {listing.udderHealth}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="pt-2 space-y-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Seller&rsquo;s Description
              </h3>
              <AutoTranslateText text={listing.description} />
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
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Seller Information
              </span>
              <span className="text-[10px] bg-green-50 text-green-800 font-bold px-2 py-0.5 rounded-md border border-green-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                Verified Seller
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-green-100 text-green-800 font-bold text-sm flex items-center justify-center shrink-0">
                {listing.seller.fullName[0]}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                  {listing.seller.fullName}
                </h4>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
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

          {/* Direct Seller Safety Reminder Callout */}
          <SafetyNotice variant="warning-box" />
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

