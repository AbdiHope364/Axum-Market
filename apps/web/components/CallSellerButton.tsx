'use client';

import React, { useState } from 'react';
import { Phone, PhoneCall, Check, Eye, Copy } from 'lucide-react';

interface CallSellerButtonProps {
  phoneNumber: string;
  sellerName?: string;
  variant?: 'primary' | 'card' | 'sticky';
  className?: string;
}

function formatDisplayPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+251') && clean.length === 13) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
  }
  if ((clean.startsWith('09') || clean.startsWith('07')) && clean.length === 10) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  return clean || phone;
}

export default function CallSellerButton({
  phoneNumber,
  sellerName,
  variant = 'primary',
  className = '',
}: CallSellerButtonProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayPhone = formatDisplayPhone(phoneNumber);
  const rawDialPhone = phoneNumber.replace(/[^\d+]/g, '');
  const telHref = `tel:${rawDialPhone}`;

  const maskedPhone = () => {
    if (displayPhone.length > 6) {
      return displayPhone.slice(0, 6) + ' ••• •••';
    }
    return displayPhone;
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(rawDialPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sticky Mobile Bottom Bar
  if (variant === 'sticky') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-2 pb-safe shadow-lg md:hidden">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-semibold rounded-xl text-xs transition"
            >
              <Eye className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span className="truncate font-mono">{maskedPhone()}</span>
            </button>
          ) : (
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-between h-10 px-2.5 bg-green-50 border border-green-200 rounded-xl text-left transition"
            >
              <div className="min-w-0 pr-1">
                <span className="block text-[9px] text-gray-500 leading-none">Seller Phone</span>
                <span className="font-mono text-xs font-bold text-green-950 tracking-tight truncate block">
                  {displayPhone}
                </span>
              </div>
              <span className="text-[10px] font-bold text-green-800 bg-green-200/80 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5">
                {copied ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3 text-green-700" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </span>
            </button>
          )}

          <a
            href={telHref}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs active:scale-95 transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Seller</span>
          </a>
        </div>
      </div>
    );
  }

  // Card Variant (for Listing card preview)
  if (variant === 'card') {
    return (
      <div className="flex items-center gap-1.5 w-full">
        <a
          href={telHref}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition"
          title={`Call ${sellerName || 'Seller'}`}
        >
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span>Call</span>
        </a>
      </div>
    );
  }

  // Primary Detail Page Variant
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <a
          href={telHref}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs active:scale-98 transition"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call {sellerName ? sellerName.split(' ')[0] : 'Seller'}</span>
        </a>

        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl border border-gray-200 transition"
          >
            <Eye className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="font-mono text-xs">{maskedPhone()}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex items-center justify-between py-2 px-3 bg-green-50/90 hover:bg-green-100/90 text-green-950 rounded-xl border border-green-200 transition"
          >
            <span className="font-mono text-xs sm:text-sm font-bold tracking-tight">{displayPhone}</span>
            <span className="text-[10px] bg-green-200/80 text-green-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </span>
          </button>
        )}
      </div>

      <p className="text-[10px] sm:text-[11px] text-gray-500 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1">
        <span>💡 Clicking &ldquo;Call&rdquo; directly opens your device dialer.</span>
      </p>
    </div>
  );
}

