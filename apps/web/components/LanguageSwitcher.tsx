'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '@/context/LanguageContext';

const LANGUAGES: { code: SupportedLanguage; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English (Default)', native: 'English', flag: '🇬🇧' },
  { code: 'am', label: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', label: 'Afaan Oromoo', native: 'Oromoo', flag: '🌳' },
];

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown' | 'inline';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'dropdown', className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  if (variant === 'pill') {
    return (
      <div className={`flex items-center gap-1 bg-gray-100/90 p-1 rounded-xl border border-gray-200/80 ${className}`}>
        {LANGUAGES.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition active:scale-95 flex items-center gap-1 ${
              language === item.code
                ? 'bg-white text-green-800 shadow-xs ring-1 ring-green-600/20'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <span>{item.flag}</span>
            <span>{item.native}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`space-y-1 ${className}`}>
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block px-1">
          Language / ቋንቋ / Afaan
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setLanguage(item.code)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold border transition active:scale-95 ${
                language === item.code
                  ? 'bg-green-50 border-green-400 text-green-900 shadow-xs'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-base leading-none mb-1">{item.flag}</span>
              <span className="text-[11px] truncate">{item.native}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500/40"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-green-700 shrink-0" />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="font-medium text-xs">{current.native}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-gray-200 py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
            Choose Language / ቋንቋ
          </div>
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLanguage(item.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition hover:bg-green-50/70 ${
                language === item.code ? 'font-bold text-green-800 bg-green-50/50' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{item.flag}</span>
                <div>
                  <span className="block leading-tight font-medium">{item.native}</span>
                  <span className="text-[10px] text-gray-400">{item.label}</span>
                </div>
              </div>
              {language === item.code && <Check className="w-3.5 h-3.5 text-green-700 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
