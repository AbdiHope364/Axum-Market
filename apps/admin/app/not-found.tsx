import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-3xl font-black">
          🛡️
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-gray-800">Admin Page Not Found</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            The requested administration page does not exist.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs sm:text-sm shadow-sm transition"
          >
            <Home className="w-4 h-4" />
            <span>Admin Console</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

