import React from 'react';
import Link from 'next/link';
import { Search, Home, ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center mx-auto shadow-xs">
          <Compass className="w-8 h-8 stroke-[2]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-gray-800">Livestock Listing Not Found</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            The page or animal listing you are looking for does not exist or may have been removed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>

          <Link
            href="/listings"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Browse Livestock</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

