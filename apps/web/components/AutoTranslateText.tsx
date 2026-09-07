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

// Pre-computed instant translations for seeded listings (delivers 0ms instant display)
const PRESET_TRANSLATIONS: Record<string, Record<'am' | 'om', string>> = {
  holstein_22l: {
    am: 'ሁለተኛ ወሊድ ሆልስታይን ፍሪሲያን የወተት ላም በከፍተኛ የወተት ምርት ወቅት ላይ የምትገኝ። በአሁኑ ጊዜ በመደበኛ የወተት መኖ እና ድርቆሽ በቀን 22 ሊትር ወተት ትሰጣለች። በጣም የሰለጠነች፣ በእጅ ወይም በማሽን ለማለብ እጅግ ምቹ። በመደበኛነት የሆድ ጥገኛ መድኃኒት የተሰጣትና የተከተበች። ትክክለኛ ገዢዎች ሱሉልታ ጫንጮ ድረስ በመምጣት የጠዋትና የከሰዓት እለባን በአካል መመልከት ይችላሉ።',
    om: 'Sa’a aannanii Holstein Friesian lammataa kan yeroo ammaa aannan guddaa kennitu. Yeroo ammaa kana guyyaatti aannan liitira 22 raashina aannanii fi marga gogaa waliin oomishaa jirti. Baayyee kan ajajamtu, harkaanis ta’ee maashiniin aannan baasuuf kan mijattu. Talaallii fi qoricha raammoo kan fudhatte. Bitamtoonni dhugaa Sululta Caanchootti dhiyaachuun sakatta’iinsa elma ganamaa fi galgalaa qaamaan ilaaluu dandeessu.',
  },
  borana_bull: {
    am: 'በቢሾፍቱ በፋብሪካ መኖ እና በጭድ ለ4 ወራት በሚገባ የተደለበ ምርጥ የቦረና በሬ። የጎላ የጡንቻ እና የክብደት አቋም (በግምት 460 ኪ.ግ) ያለው። ጤነኛ እና ንጹህ የጤና ታሪክ ያለው። በቦታው ድረስ መጥቶ መመርመር ይቻላል።',
    om: 'Korma Booranaa Bishooftuutti furdatee ji’a 4f marga fi furdaan soorame. Qaama cimaa fi ulfaatina (tilmaamaan 460kg) kan qabu. Fayyaa qulqulluu qaba. Qophii bakka jiruutti qaamaan ilaaluun ni danda’ama.',
  },
  dorper_ram: {
    am: 'ከፍተኛ የዘር አቅም ያለው የዶርፐር አውራ በግ። ግሩም የሰውነት ቅርጽና ክብደት ያለው፣ ለበግ መንጋ ዝርያ ማሻሻያ ፈጣን የእድገት ባህሪ የሚያስተላልፍ። ጤናማ፣ ጠንካራ ሰኮና ያለውና ለአገልግሎት ዝግጁ።',
    om: 'Kormaa hoolaa Dorper dandeettii sanyii olaanaa qabu. Qaama cimaa, guddina saffisaa kan qabu. Fayyaa guutuu fi tajaajilaaf qophii kan ta’e.',
  },
  boer_buck: {
    am: 'ጥሩ የአጥንት መዋቅር እና ሰፊ ደረት ያለው ጠንካራ እና ጤናማ የቦየር ድቅል የፍየል ሙክት። በግርግም ውስጥ በአልፋልፋ ሳር እና በፋጉሎ ያደገ። በአካል ለመጎብኘት በቀጥታ ይደውሉ።',
    om: 'Re’ee kormaa Boer fayyaalessa ta’e, lafee cimaa fi qoma bal’aa kan qabu. Marga alfalfaa fi faagulloon mana keessatti kan guddate. Qaamaan ilaaluuf kallattiin bilbilaa.',
  },
  holstein_heifer: {
    am: 'በሰው ሰራሽ ማዳቀል (AI) የተወለደች ንፁህ የሆልስታይን ጊደር። በእንስሳት ሐኪም አልትራሳውንድ የ4 ወር እርግዝናዋ የተረጋገጠ። የዋህ ባህሪ ያላት እና ጥሩ የጡት ተስፋ ያላት።',
    om: 'Raada Holstein sanyii qulqulluu kan seelii kormaan dhalatte. Ulfi ji’a 4 ogeessa fayyaa beelladaatiin kan mirkanaa’e. Amala gaarii fi harma gaarii kan qabdu.',
  },
  jersey_cow: {
    am: 'ወፍራም እና ቅባት ያለው ወተት የምትሰጥ ጤናማ የቤተሰብ የወተት ላም። ለልጆች እና ለቤተሰብ አያያዝ በጣም የተረጋጋች። በሱሉልታ በአካል ለመመርመር ዝግጁ።',
    om: 'Sa’a aannanii maatii fayyaalettii aannan furdaa fi dhadhaa qabu kennitu. Maatiif baayyee kan mijattu. Sulultaatti qaamaan sakatta’uuf qophii kan taate.',
  },
};

function getPresetTranslation(text: string, lang: 'am' | 'om'): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('second calving') || lower.includes('22 liters') || lower.includes('chancho')) {
    return PRESET_TRANSLATIONS.holstein_22l[lang];
  }
  if (lower.includes('borana bull') || lower.includes('460kg') || lower.includes('fattened for 4 months')) {
    return PRESET_TRANSLATIONS.borana_bull[lang];
  }
  if (lower.includes('dorper') || lower.includes('breeding ram') || lower.includes('sheep flock')) {
    return PRESET_TRANSLATIONS.dorper_ram[lang];
  }
  if (lower.includes('boer') || lower.includes('buck') || lower.includes('lucerne')) {
    return PRESET_TRANSLATIONS.boer_buck[lang];
  }
  if (lower.includes('heifer') || lower.includes('artificial insemination') || lower.includes('4 months pregnant')) {
    return PRESET_TRANSLATIONS.holstein_heifer[lang];
  }
  if (lower.includes('jersey') || lower.includes('creamy milk') || lower.includes('butterfat')) {
    return PRESET_TRANSLATIONS.jersey_cow[lang];
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

  // Auto-translate when global language changes
  useEffect(() => {
    if (language === 'am' || language === 'om') {
      if (currentLang !== language && safeText) {
        handleTranslate(language);
      }
    } else if (language === 'en' && currentLang) {
      setTranslated(null);
      setCurrentLang(null);
    }
  }, [language, safeText]);

  const handleTranslate = async (targetLang: SupportedLanguage) => {
    if (!safeText) return;

    if (targetLang === 'en') {
      setTranslated(null);
      setCurrentLang('en');
      setError(null);
      return;
    }

    // 1. Instant Preset Check (0ms response)
    const preset = getPresetTranslation(safeText, targetLang);
    if (preset) {
      setTranslated(preset);
      setCurrentLang(targetLang);
      setError(null);
      return;
    }

    // 2. Check localStorage cache
    const cacheKey = `axum_trans_${targetLang}_${encodeURIComponent(safeText.slice(0, 40))}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setTranslated(cached);
        setCurrentLang(targetLang);
        setError(null);
        return;
      }
    } catch {
      // ignore
    }

    setLoading(true);
    setError(null);

    let resultText: string | null = null;

    // 3. Direct Client Fetch to MyMemory (Fast ~300ms, avoids Vercel datacenter block)
    try {
      resultText = await translateDirectClient(safeText, targetLang);
    } catch {
      // ignore
    }

    // 4. Server API Fallback if client direct fetch failed
    if (!resultText) {
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
        // ignore
      }
    }

    if (resultText) {
      setTranslated(resultText);
      setCurrentLang(targetLang);
      try {
        localStorage.setItem(cacheKey, resultText);
      } catch {
        // ignore
      }
    } else {
      setError('Translation could not be completed at this moment. Showing original text.');
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
              { code: 'en', label: 'English' },
              { code: 'am', label: 'አማርኛ' },
              { code: 'om', label: 'Afaan Oromoo' },
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
