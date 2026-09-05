import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SafetyNoticeProps {
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
}

export default function SafetyNotice({ variant = 'banner', className = '' }: SafetyNoticeProps) {
  if (variant === 'compact') {
    return (
      <div className={`p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 ${className}`}>
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-800">Buyer Safety:</span>
          <span>Never send advance payments or deposits online. Inspect livestock physically before purchase.</span>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-amber-50 to-orange-50/50 border-2 border-amber-300/80 rounded-2xl p-5 shadow-sm ${className}`}>
        <div className="flex items-center gap-2.5 mb-3 text-amber-900">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-amber-950">Important Buyer Safety Notice</h3>
        </div>
        
        <ul className="space-y-2 text-xs sm:text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span><strong>Never transfer money online:</strong> No deposits, advance fees, or transport wire transfers.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span><strong>Physical Inspection:</strong> Always inspect the animal in daylight and confirm its health, teeth, udder, and vaccination history.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span><strong>Meet in Safe Locations:</strong> Meet at public livestock markets, reputable dairy cooperatives, or the seller's verified farm.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span><strong>Zero Online Processing:</strong> AxumMarket is a direct classifieds broker. All deals happen offline between buyer and seller.</span>
          </li>
        </ul>
      </div>
    );
  }

  // Default Banner
  return (
    <div className={`bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-4 rounded-2xl shadow-md ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base leading-tight">
              Direct Livestock Classifieds — 100% Offline Transactions
            </h4>
            <p className="text-xs sm:text-sm text-amber-100 mt-0.5">
              Never transfer money before seeing the animal in person. Always inspect livestock on-site before payment.
            </p>
          </div>
        </div>
        <div className="self-end sm:self-center shrink-0">
          <span className="inline-block text-[11px] font-bold bg-white text-amber-900 uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            Zero Online Checkout
          </span>
        </div>
      </div>
    </div>
  );
}

