'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Loader2, Sparkles, Check } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '@/context/LanguageContext';

interface AutoTranslateTextProps {
  text: string;
  className?: string;
  defaultOpen?: boolean;
}

function cleanHtmlEntities(str: string): string {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

async function translateDirectClient(text: string, targetLang: string): Promise<string | null> {
  try {
    const pair = `en|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const result = data?.responseData?.translatedText;
      if (result && typeof result === 'string' && !result.includes('MYMEMORY WARNING')) {
        return cleanHtmlEntities(result);
      }
    }
  } catch {
    // client fetch fallback ignored
  }
  return null;
}

export default function AutoTranslateText({ text = '', className = '' }: AutoTranslateTextProps) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeText = typeof text === 'string' ? text.trim() : '';

  // Auto-translate if user switches overall site language
  useEffect(() => {
    if (language === 'am' || language === 'om') {
      if (currentLang !== language && safeText) {
        handleTranslate(language);
      }
    } else if (language === 'en' && currentLang) {
      setTranslated(null);
      setCurrentLang(null);
    }
  }, [language]);

  const handleTranslate = async (targetLang: SupportedLanguage) => {
    if (!safeText) return;

    if (targetLang === 'en') {
      setTranslated(null);
      setCurrentLang('en');
      setError(null);
      return;
    }

    if (currentLang === targetLang && translated) {
      return;
    }

    setLoading(true);
    setError(null);

    let resultText: string | null = null;

    // 1. Try server translation endpoint
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: safeText, targetLang }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translatedText && data.translatedText !== safeText) {
          resultText = cleanHtmlEntities(data.translatedText);
        }
      }
    } catch {
      // Server endpoint failed, proceed to direct client fallback
    }

    // 2. Direct browser fallback if server was throttled or returned original text
    if (!resultText) {
      resultText = await translateDirectClient(safeText, targetLang);
    }

    if (resultText) {
      setTranslated(resultText);
      setCurrentLang(targetLang);
    } else {
      setError('Translation unavailable for this text right now. Displaying original description.');
    }

    setLoading(false);
  };

  const handleShowOriginal = () => {
    setTranslated(null);
    setCurrentLang(null);
    setError(null);
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
              { code: 'om', label: 'Afaan Oromoo', flag: '🌳' },
            ] as const
          ).map((item) => (
            <button
              key={item.code}
              type="button"
              disabled={loading}
              onClick={() => handleTranslate(item.code)}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition active:scale-95 flex items-center gap-1 ${
                (currentLang === item.code) || (!currentLang && item.code === 'en')
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-green-50 hover:text-green-800 border border-slate-200/80'
              }`}
            >
              <span>{item.flag}</span>
              <span>{item.label}</span>
              {((currentLang === item.code) || (!currentLang && item.code === 'en')) && (
                <Check className="w-2.5 h-2.5 ml-0.5" />
              )}
            </button>
          ))}

          {translated && (
            <button
              type="button"
              onClick={handleShowOriginal}
              className="text-[11px] text-slate-500 hover:text-slate-800 px-2 py-0.5 font-medium underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 p-2.5 bg-green-50/70 border border-green-200 rounded-xl text-xs text-green-800">
          <Loader2 className="w-4 h-4 animate-spin text-green-600 shrink-0" />
          <span>Translating via AI Translator (በነፃ እየተተረጎመ ነው)...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
          {error}
        </p>
      )}

      {/* Text Box */}
      <div className="relative">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[50px]">
          {translated || safeText || 'No description provided.'}
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
