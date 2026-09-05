'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  PlusCircle,
  User,
  LogOut,
  ShieldCheck,
  Compass,
  ChevronRight,
  LogIn,
  UserPlus,
  PhoneCall,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  // Lock body scroll when mobile menu is open to prevent background scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  const categories = [
    { name: 'Dairy Cattle', icon: '🐄', query: 'dairy-cattle' },
    { name: 'Beef Cattle', icon: '🐂', query: 'beef-cattle' },
    { name: 'Calves & Heifers', icon: '🐮', query: 'calves-and-heifers' },
    { name: 'Sheep', icon: '🐑', query: 'sheep' },
    { name: 'Goats', icon: '🐐', query: 'goats' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5 group-hover:scale-105 transition-transform bg-emerald-800 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="AxumMarket Logo"
                    fill
                    sizes="40px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-1">
                    Axum<span className="text-green-600">Market</span>
                  </span>
                  <span className="hidden sm:block text-[10px] uppercase tracking-wider font-bold text-gray-400 -mt-1">
                    Ethiopian Livestock Classifieds
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/listings"
                className={`text-sm font-semibold transition-colors hover:text-green-600 flex items-center gap-1.5 ${
                  pathname === '/listings' ? 'text-green-600' : 'text-gray-700'
                }`}
              >
                <Compass className="w-4 h-4" />
                Browse Animals
              </Link>

              <div className="h-4 w-px bg-gray-200" />

              <Link
                href="/seller/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                Post Animal
              </Link>

              {user ? (
                <div className="relative flex items-center gap-3">
                  <Link
                    href={user.role === 'ADMIN' ? '/admin/dashboard' : '/seller/dashboard'}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-green-600 bg-gray-50 hover:bg-green-50 px-3.5 py-1.5 rounded-xl border border-gray-200 transition"
                  >
                    <User className="w-4 h-4 text-green-600" />
                    <span className="max-w-[120px] truncate">{user.fullName.split(' ')[0]}</span>
                    {user.role === 'ADMIN' && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        Admin
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Log out"
                    className="p-2 text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/seller/login"
                    className="text-sm font-semibold text-gray-700 hover:text-green-600 px-3 py-1.5"
                  >
                    Seller Login
                  </Link>
                  <Link
                    href="/seller/register"
                    className="text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3.5 py-1.5 rounded-xl border border-green-200 transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Actions: Sell CTA + Comfortable Touch Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/seller/create"
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Sell
              </Link>

              {/* Large, comfortable thumb-friendly toggle button (44x44px minimum touch target) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  mobileMenuOpen
                    ? 'bg-green-50 border-green-300 text-green-700 shadow-inner'
                    : 'bg-gray-100/90 hover:bg-gray-200 border-gray-200/80 text-gray-800 shadow-xs'
                }`}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 transition-transform duration-200 rotate-90 scale-110" />
                ) : (
                  <Menu className="w-5 h-5 transition-transform duration-200" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Mobile Slide-Over Drawer with Dimmed Blur Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop Overlay - tap outside to close */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-[85vw] w-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideLeft">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50/50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-sm bg-emerald-800 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="AxumMarket Logo"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-base font-black text-gray-900 tracking-tight">
                    Axum<span className="text-green-600">Market</span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">
                    Menu & Navigation
                  </div>
                </div>
              </div>

              {/* Comfortable close button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-90 flex items-center justify-center text-gray-600 hover:text-gray-900 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 space-y-5 flex-1">
              {/* Account Section */}
              {user ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/80 rounded-2xl p-3.5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 leading-tight">
                          {user.fullName}
                        </div>
                        <div className="text-[11px] font-semibold text-green-700 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {user.role === 'ADMIN' ? 'Administrator' : 'Registered Seller'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={user.role === 'ADMIN' ? '/admin/dashboard' : '/seller/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white text-gray-800 text-xs font-bold border border-green-200 shadow-2xs hover:bg-green-50 active:scale-95 transition"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-green-600" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white text-red-600 text-xs font-bold border border-red-200 hover:bg-red-50 active:scale-95 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 space-y-2.5">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Seller Account
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/seller/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 shadow-2xs active:scale-95 transition"
                    >
                      <LogIn className="w-3.5 h-3.5 text-gray-500" />
                      Login
                    </Link>
                    <Link
                      href="/seller/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold shadow-xs hover:bg-green-700 active:scale-95 transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Register
                    </Link>
                  </div>
                </div>
              )}

              {/* Primary Actions */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                  Explore Platform
                </div>

                <Link
                  href="/seller/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-green-600 text-white font-black text-sm shadow-md shadow-green-600/20 active:scale-[0.98] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                      <PlusCircle className="w-5 h-5 text-white" />
                    </div>
                    <span>Post Animal (Sell)</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-80" />
                </Link>

                <Link
                  href="/listings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold text-sm border border-gray-200/80 active:scale-[0.98] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    <span>Browse All Livestock</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>

              {/* Quick Categories */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                  Popular Categories
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat.query}
                      href={`/listings?category=${cat.query}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm font-semibold text-gray-700 active:scale-95 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Safety & Direct Calling Banner */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Direct Classifieds Protection</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  AxumMarket does <strong>not process payments</strong>. Buyers call sellers directly to arrange physical inspection and payment in person.
                </p>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/70 text-center space-y-1">
              <div className="text-[11px] font-bold text-gray-500">
                🇪🇹 AxumMarket Ethiopia
              </div>
              <div className="text-[10px] text-gray-400">
                Connecting Ethiopian Farmers & Buyers
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

