'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Maximize2, ShieldCheck } from 'lucide-react';

interface ImageItem {
  id?: string;
  imageUrl: string;
  imageType: string; // 'FRONT' | 'LEFT' | 'RIGHT'
}

interface ImageGalleryProps {
  images: ImageItem[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  // Order images by FRONT, LEFT, RIGHT if possible
  const orderedImages = [...images].sort((a, b) => {
    const order: Record<string, number> = { FRONT: 1, PROFILE: 1, LEFT: 2, RIGHT: 3 };
    return (order[a.imageType] || 4) - (order[b.imageType] || 4);
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const activeImage = orderedImages[activeIndex] || orderedImages[0];

  const getLabel = (type: string) => {
    switch (type) {
      case 'FRONT':
      case 'PROFILE':
        return 'Profile / Front';
      case 'LEFT':
        return 'Left Side View';
      case 'RIGHT':
        return 'Right Side View';
      default:
        return type;
    }
  };

  if (!orderedImages.length) {
    return (
      <div className="aspect-[4/3] w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
        No Photos Available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Large Image Container */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-950 border border-gray-200 shadow-md group">
        <Image
          src={activeImage.imageUrl}
          alt={`${title} - ${getLabel(activeImage.imageType)}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
          className="object-cover object-center transition-all duration-300 group-hover:scale-105"
        />

        {/* View Angle Pill Badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
          <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
          <span>{getLabel(activeImage.imageType)}</span>
        </div>

        {/* 3-View Complete Indicator */}
        {orderedImages.length >= 3 && (
          <div className="absolute top-3 right-3 bg-green-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
            3 Angles Verified
          </div>
        )}

        {/* Fullscreen Trigger */}
        <button
          onClick={() => setFullscreenOpen(true)}
          className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-xl backdrop-blur-sm transition"
          aria-label="View Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Required Angles Selectors / Thumbnails */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {orderedImages.map((img, index) => {
          const isSelected = index === activeIndex;
          return (
            <button
              key={img.id || index}
              onClick={() => setActiveIndex(index)}
              className={`relative flex flex-col items-center rounded-xl p-1.5 transition text-left border-2 ${
                isSelected
                  ? 'border-green-600 bg-green-50/60 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={img.imageUrl}
                  alt={getLabel(img.imageType)}
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              </div>
              <span
                className={`mt-1.5 text-[11px] sm:text-xs font-semibold truncate w-full text-center ${
                  isSelected ? 'text-green-800' : 'text-gray-600'
                }`}
              >
                {getLabel(img.imageType)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fullscreen Modal View */}
      {fullscreenOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setFullscreenOpen(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] h-full flex items-center justify-center">
            <Image
              src={activeImage.imageUrl}
              alt={`${title} fullscreen`}
              fill
              className="object-contain"
            />
          </div>
          <p className="text-white text-sm mt-4 font-medium">
            {getLabel(activeImage.imageType)} • Tap anywhere to close
          </p>
        </div>
      )}
    </div>
  );
}

