'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'am' | 'om';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translateText: (text: string, targetLang?: SupportedLanguage) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  translateText: async (text) => text,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English as requested, with Amharic and Afaan Oromoo as optional choices
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('axum_lang') as SupportedLanguage;
      if (saved && (saved === 'en' || saved === 'am' || saved === 'om')) {
        setLanguageState(saved);
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('axum_lang', lang);
    } catch {
      // ignore
    }
  };

  const translateText = async (text: string, targetLang?: SupportedLanguage): Promise<string> => {
    const target = targetLang || language;
    if (!text || target === 'en') return text;
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: target }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.translatedText || text;
      }
    } catch (err) {
      console.error('Translation error:', err);
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translateText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
