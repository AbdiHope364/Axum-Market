'use client';

import React, { useState } from 'react';
import { Globe, Loader2, Sparkles, RefreshCw, Check } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '@/context/LanguageContext';

interface AutoTranslateTextProps {
  text: string;
  className?: string;
  defaultOpen?: boolean;
}

export default function AutoTranslateText({ text, className = '' }: AutoTranslateTextProps) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async (targetLang: SupportedLanguage) => {
    if (currentLang === targetLang && translated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang }),
      });

      if (!res.ok) {
        throw new Error('Translation service unavailable');
      }

      const data = await res.json();
      if (data.translatedText) {
        setTranslated(data.translatedText);
        setCurrentLang(targetLang);
      } else {
        throw new Error('Empty response');
      }
    } catch {
      setError('Could not translate text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowOriginal = () => {
    setTranslated(null);
    setCurrentLang(null);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Translation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-1.5 px-1.5 text-slate-600 font-semibold text-[11px]">
          <Globe className="w-3.5 h-3.5 text-green-700" />
          <span>Translate / ተርጉም / Hiikaa:</span>
        </div>

        <div className="flex items-center gap-1">
          {(
            [
              { code: 'en', label: 'English', flag: '🇬🇧' },
              { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
              { code: 'om', label: 'Oromoo', flag: '🌳' },
            ] as const
          ).map((item) => (
            <button
              key={item.code}
              type="button"
              disabled={loading}
              onClick={() => handleTranslate(item.code)}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition active:scale-95 flex items-center gap-1 ${
                currentLang === item.code
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-green-50 hover:text-green-800 border border-slate-200/80'
              }`}
            >
              <span>{item.flag}</span>
              <span>{item.label}</span>
              {currentLang === item.code && <Check className="w-2.5 h-2.5 ml-0.5" />}
            </button>
          ))}

          {translated && (
            <button
              type="button"
              onClick={handleShowOriginal}
              className="text-[11px] text-slate-500 hover:text-slate-800 px-2 py-0.5 font-medium underline"
            >
              Original
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 p-3 bg-green-50/70 border border-green-200 rounded-xl text-xs text-green-800">
          <Loader2 className="w-4 h-4 animate-spin text-green-600" />
          <span>Translating via AI Translator (በነፃ እየተተረጎመ ነው)...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
          {error}
        </p>
      )}

      {/* Text Box */}
      <div className="relative">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
          {translated || text}
        </p>
        {translated && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold text-green-800 bg-green-100/90 border border-green-200/90 px-2 py-0.5 rounded-md backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-green-600" />
            <span>Translated ({currentLang === 'am' ? 'አማርኛ' : currentLang === 'om' ? 'Afaan Oromoo' : 'English'})</span>
          </div>
        )}
      </div>
    </div>
  );
}
