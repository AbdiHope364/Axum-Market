'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Phone, MapPin, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-20 md:pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
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
              <span className="text-xl font-black tracking-tight text-white">
                Axum<span className="text-green-500">Market</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              {t('footer_tagline')}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-xs text-amber-400">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('footer_offline_tag')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {t('explore_livestock')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/listings?category=dairy-cattle" className="hover:text-green-400 transition">
                  Dairy Cattle (የወተት ከብቶች)
                </Link>
              </li>
              <li>
                <Link href="/listings?category=beef-cattle" className="hover:text-green-400 transition">
                  Beef Cattle / Bulls (የስጋ በሬዎች)
                </Link>
              </li>
              <li>
                <Link href="/listings?category=calves-heifers" className="hover:text-green-400 transition">
                  Calves & Heifers (ጥጃዎችና ጊደሮች)
                </Link>
              </li>
              <li>
                <Link href="/listings?category=sheep" className="hover:text-green-400 transition">
                  Sheep (በጎች)
                </Link>
              </li>
              <li>
                <Link href="/listings?category=goats" className="hover:text-green-400 transition">
                  Goats (ፍየሎች)
                </Link>
              </li>
              <li>
                <Link href="/listings" className="hover:text-green-400 transition">
                  {t('all_animals')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Sellers & Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {t('sellers_safety')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/seller/create" className="text-green-400 font-semibold hover:underline">
                  + {t('post_animal')}
                </Link>
              </li>
              <li>
                <Link href="/seller/login" className="hover:text-green-400 transition">
                  {t('login')}
                </Link>
              </li>
              <li>
                <Link href="/seller/register" className="hover:text-green-400 transition">
                  {t('register')}
                </Link>
              </li>
              <li>
                <Link href="/#safety" className="hover:text-green-400 transition">
                  {t('safety_disclaimer_link')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-4 text-xs text-amber-300/90 leading-relaxed mb-6">
          <p>{t('safety_reminder')}</p>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} AxumMarket. Dedicated to Ethiopian Agricultural Livestock.</p>
          <p className="flex items-center gap-1">
            Built for Ethiopian farmers & buyers with direct phone connectivity.
          </p>
        </div>
      </div>
    </footer>
  );
}

