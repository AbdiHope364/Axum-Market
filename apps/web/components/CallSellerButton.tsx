'use client';

import React, { useState } from 'react';
import { Phone, PhoneCall, Check, Eye } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/constants';

interface CallSellerButtonProps {
  phoneNumber: string;
  sellerName?: string;
  variant?: 'primary' | 'card' | 'sticky';
  className?: string;
}

export default function CallSellerButton({
  phoneNumber,
  sellerName,
  variant = 'primary',
  className = '',
}: CallSellerButtonProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanPhone = formatPhoneNumber(phoneNumber);
  const telHref = `tel:${cleanPhone}`;

  const maskedPhone = () => {
    if (cleanPhone.length > 7) {
      return cleanPhone.slice(0, 4) + ' ••• •••';
    }
    return cleanPhone;
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(cleanPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Sticky Mobile Bottom Bar
  if (variant === 'sticky') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-3 pb-safe shadow-2xl md:hidden">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-sm transition"
            >
              <Eye className="w-4 h-4 text-gray-600" />
              <span>Show Phone ({maskedPhone()})</span>
            </button>
          ) : (
            <div className="flex-1 flex flex-col justify-center px-3 py-1 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-[10px] text-gray-500 font-medium">Seller Phone</span>
              <span className="text-xs font-bold text-gray-900 tracking-wide select-all">{cleanPhone}</span>
            </div>
          )}

          <a
            href={telHref}
            className="flex-1 flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl text-base shadow-lg shadow-green-600/30 active:scale-98 transition-transform"
          >
            <PhoneCall className="w-5 h-5 animate-pulse" />
            <span>Call Seller</span>
          </a>
        </div>
      </div>
    );
  }

  // Card Variant (for Listing card preview)
  if (variant === 'card') {
    return (
      <div className="flex items-center gap-2 w-full">
        <a
          href={telHref}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-green-600 hover:bg-green-700 active:scale-98 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition"
          title={`Call ${sellerName || 'Seller'}`}
        >
          <Phone className="w-4 h-4 shrink-0" />
          <span>Call Seller</span>
        </a>
      </div>
    );
  }

  // Primary Detail Page Variant
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={telHref}
          className="flex items-center justify-center gap-2.5 py-3.5 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg shadow-green-600/25 active:scale-98 transition transform"
        >
          <PhoneCall className="w-5 h-5" />
          <span>Call {sellerName ? sellerName.split(' ')[0] : 'Seller'}</span>
        </a>

        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="flex items-center justify-center gap-2 py-3.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm sm:text-base rounded-2xl border border-gray-200 transition"
          >
            <Eye className="w-4 h-4 text-gray-600" />
            <span>Show Number ({maskedPhone()})</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex items-center justify-between py-3.5 px-5 bg-green-50 hover:bg-green-100 text-green-900 font-bold text-sm sm:text-base rounded-2xl border border-green-300 transition"
          >
            <span className="tracking-wider">{cleanPhone}</span>
            <span className="text-xs bg-green-200/80 text-green-800 px-2 py-0.5 rounded-md flex items-center gap-1">
              {copied ? <Check className="w-3.5 h-3.5" /> : null}
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-gray-500 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1">
        <span>💡 Clicking &ldquo;Call Seller&rdquo; directly opens your phone&rsquo;s dialer app.</span>
      </p>
    </div>
  );
}

