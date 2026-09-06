'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Don't show bottom nav on single listing detail page or admin portal
  const isListingDetail = pathname.startsWith('/listings/') && pathname.split('/').length === 3;
  const isAdmin = pathname.startsWith('/admin');

  if (isListingDetail || isAdmin) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Browse', href: '/listings', icon: Search },
    { label: 'Sell Animal', href: '/seller/create', icon: PlusCircle, highlight: true },
    { label: 'Dashboard', href: '/seller/dashboard', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 md:hidden pb-safe">
      <div className="grid grid-cols-4 h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-3 text-center"
              >
                <div className="w-11 h-11 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md shadow-green-600/30 active:scale-95 transition">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-green-700 mt-0.5">Sell</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center text-center transition ${
                isActive ? 'text-green-600 font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

