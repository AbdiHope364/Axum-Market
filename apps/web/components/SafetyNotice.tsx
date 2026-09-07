'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Search,
  Ban,
  ShieldOff,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SafetyNoticeProps {
  variant?: 'banner' | 'card' | 'compact' | 'warning-box';
  className?: string;
  defaultLanguage?: 'en' | 'am' | 'om' | 'all';
}

type Language = 'en' | 'am' | 'om' | 'all';

interface DisclaimerContent {
  title: string;
  badge: string;
  subtitle: string;
  points: {
    title: string;
    description: string;
    icon: 'info' | 'map' | 'inspect' | 'ban' | 'shield';
  }[];
  alertBox: {
    prefix: string;
    text: string;
  };
}

const DISCLAIMERS: Record<'en' | 'am' | 'om', DisclaimerContent> = {
  en: {
    badge: 'Official Safety Warning',
    title: 'Marketplace Safety & Transaction Disclaimer',
    subtitle: 'This platform is for information only to connect buyers and sellers — all transactions happen 100% offline.',
    points: [
      {
        title: 'For Information Only',
        description: 'Axum Market is solely an advertising directory to connect buyers and sellers. We do not process payments, broker deals, or verify transactions.',
        icon: 'info',
      },
      {
        title: 'Meet in a Public Marketplace',
        description: 'Always arrange meetings in person at an official livestock market or safe, well-lit public location.',
        icon: 'map',
      },
      {
        title: 'Inspect the Livestock Thoroughly',
        description: 'Always inspect the animal physically in person (health, teeth, udder, breed, age, and records) before agreeing to buy.',
        icon: 'inspect',
      },
      {
        title: 'Never Pay Money Online',
        description: 'Do NOT pay any money online. Never send advance deposits, transport fees, or wire transfers before physical handover.',
        icon: 'ban',
      },
      {
        title: 'Platform Is Not Responsible',
        description: 'We are not responsible for any monetary transactions, financial losses, or agreements made between buyers and sellers.',
        icon: 'shield',
      },
    ],
    alertBox: {
      prefix: 'Critical Warning:',
      text: "Please do NOT send money based on online information alone. Always meet in a public marketplace and inspect the animal in person before buying.",
    },
  },
  am: {
    badge: 'ይፋዊ የደህንነት ማስጠንቀቂያ',
    title: 'የገበያ ቦታ የደህንነት እና የግብይት ማስጠንቀቂያ',
    subtitle: 'ይህ መድረክ ለመረጃ እና ገዥና ሻጭን በቀጥታ ለማገናኘት ብቻ የተዘጋጀ ነው — ግብይት የሚፈጸመው በአካል ብቻ ነው።',
    points: [
      {
        title: 'ለመረጃ አገልግሎት ብቻ',
        description: 'አክሱም ማርኬት ገዥና ሻጭን በቀጥታ ለማገናኘት ብቻ የሚሰራ የመረጃ መድረክ ነው። ምንም አይነት ክፍያ አንቀበልም፤ ለግብይትም ዋስትና አንሰጥም።',
        icon: 'info',
      },
      {
        title: 'በይፋዊ ገበያ ወይም በህዝብ ቦታ ይገናኙ',
        description: 'ሁልጊዜ ከሻጩ ጋር በይፋዊ የእንስሳት ገበያ ወይም ደህንነቱ በተጠበቀ የህዝብ ቦታ በአካል ተገናኝተው ይነጋገሩ።',
        icon: 'map',
      },
      {
        title: 'ከመግዛትዎ በፊት እንስሳውን ይመርምሩ',
        description: 'ገንዘብ ከመክፈልዎ ወይም ከመግዛትዎ በፊት የእንስሳውን ጤንነት፣ ጥርስ፣ የጡት ሁኔታ እና ዝርያ በአካል በሚገባ ያረጋግጡ።',
        icon: 'inspect',
      },
      {
        title: 'በኦንላይን ምንም ዓይነት ገንዘብ እንዳይከፍሉ',
        description: 'በኦንላይን ምንም ዓይነት የቅድመ ክፍያ፣ የዲፖዚት ወይም የትራንስፖርት ገንዘብ እንዳይልኩ። ክፍያ የሚፈጸመው እንስሳውን በአካል ተረክበው ሲያረጋግጡ ብቻ ነው።',
        icon: 'ban',
      },
      {
        title: 'ድርጅታችን ምንም ኃላፊነት አይወስድም',
        description: 'በዚህ መድረክ በሚደረግ ማንኛውም የገንዘብ ዝውውር፣ ስምምነት ወይም አለመግባባት ድርጅታችን ተጠያቂ አይሆንም።',
        icon: 'shield',
      },
    ],
    alertBox: {
      prefix: 'አስፈላጊ ማሳሰቢያ፦',
      text: 'እባክዎ በኦንላይን መረጃ ላይ ብቻ ተመስርተው ገንዘብ እንዳይልኩ! ሁልጊዜ በገበያ ቦታ ተገናኝተው ከመግዛትዎ በፊት እንስሳውን በአካል ይመርምሩ።',
    },
  },
  om: {
    badge: 'Akeekkachiisa Nageenyaa Seeraa',
    title: 'Akeekkachiisa Nageenyaa fi Daldala Gabaa',
    subtitle: 'Waltajjiin kun odeeffannoo qofaaf kan qophaa\'ee fi bittaa fi gurguraa walitti fiduuf qofa — daldalli hundi qaamaan raawwatama.',
    points: [
      {
        title: 'Odeeffannoo Qofaaf',
        description: 'Axum Market bittaa fi gurguraa walitti fiduuf qofa kan qophaa\'eedha. Kaffaltii hin raawwatu, daldala keessatti hirmaannaa hin qabu.',
        icon: 'info',
      },
      {
        title: 'Bakka Gabaa Uummataatti Wal-argaa',
        description: 'Yeroo hunda gurguraa wajjin iddoo gabaa beelladaa ifa ta\'etti yookiin bakka uummataa nageenyi isaa eegametti qaamaan wal argaa.',
        icon: 'map',
      },
      {
        title: 'Bittaa Dura Beelladicha Sakatta\'aa',
        description: 'Maallaqa kaffaluun dura fayyummaa, ilkaan, muchaa fi sanyii beelladichaa qaamaan sirriitti mirkaneeffadhaa.',
        icon: 'inspect',
      },
      {
        title: 'Toora Interneetii Irratti Kaffaltii Hin Raawwatinaa',
        description: 'Toora interneetii irratti maallaqa kamiyyuu hin kaffalinaa. Kaffaltii dursaa, qabsiisaa yookiin geejjibaa duraan hin erginaa.',
        icon: 'ban',
      },
      {
        title: 'Itti Gaafatamummaa Hin Fudhannu',
        description: 'Daldala, waliigaltee yookiin dabarsa maallaqaa isin gidduutti raawwatamuuf dhaabbanni keenya gonkumaa itti gaafatamummaa hin fudhatu.',
        icon: 'shield',
      },
    ],
    alertBox: {
      prefix: 'Akeekkachiisa Cimaa፦',
      text: 'Mee odeeffannoo toora interneetii qofa irratti hundaa\'uun maallaqa hin erginaa! Yeroo hunda bakka gabaatti wal arguun dura beelladicha sakatta\'aa.',
    },
  },
};

export default function SafetyNotice({
  variant = 'card',
  className = '',
  defaultLanguage,
}: SafetyNoticeProps) {
  const { language } = useLanguage();
  const [activeLang, setActiveLang] = useState<Language>(defaultLanguage || language);

  useEffect(() => {
    if (!defaultLanguage && activeLang !== 'all') {
      setActiveLang(language);
    }
  }, [language, defaultLanguage]);

  const renderIcon = (icon: 'info' | 'map' | 'inspect' | 'ban' | 'shield') => {
    switch (icon) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
      case 'map':
        return <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      case 'inspect':
        return <Search className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      case 'ban':
        return <Ban className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
      case 'shield':
        return <ShieldOff className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
    }
  };

  const languagesList: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'am', label: 'አማርኛ' },
    { code: 'om', label: 'Afaan Oromoo' },
    { code: 'all', label: '🌐 All (ሁሉ/Hunda)' },
  ];

  // Compact Variant (Inline warning banner or footer)
  if (variant === 'compact') {
    return (
      <div
        className={`bg-amber-50/95 border border-amber-200/90 rounded-2xl p-3 sm:p-4 text-amber-950 shadow-xs space-y-2 ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-black text-xs uppercase tracking-wider text-amber-900">
              Safety Warning • ማስጠንቀቂያ • Akeekkachiisa
            </span>
          </div>

          <div className="flex items-center gap-1">
            {(['en', 'am', 'om'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setActiveLang(l)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                  activeLang === l
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-100/80 text-amber-800 hover:bg-amber-200'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {activeLang === 'en' && (
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>For Info Only:</strong> Meet the seller in a public marketplace and inspect the animal before buying. <strong>Do NOT pay any money online.</strong> We are not responsible for private transactions between users.
          </p>
        )}
        {activeLang === 'am' && (
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>ለመረጃ አገልግሎት ብቻ፦</strong> ከሻጩ ጋር በገበያ ወይም በህዝብ ቦታ ተገናኝተው ከመግዛትዎ በፊት እንስሳውን በአካል ይመርምሩ። <strong>በኦንላይን ምንም ገንዘብ እንዳይከፍሉ!</strong> በመካከላችሁ ለሚደረግ ማንኛውም ግብይት ኃላፊነት አንወስድም።
          </p>
        )}
        {activeLang === 'om' && (
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>Odeeffannoo Qofaaf፦</strong> Gurguraa wajjin bakka gabaa uummataatti qaamaan wal arguun dura beelladicha sakatta&apos;aa. <strong>Toora interneetii irratti kaffaltii hin raawwatinaa!</strong> Daldala isin gidduutti raawwatamuuf itti gaafatamummaa hin fudhannu.
          </p>
        )}
      </div>
    );
  }

  // Warning Box (Compact callout for sticky or next to contact buttons)
  if (variant === 'warning-box') {
    return (
      <div className={`p-3 bg-red-50/90 border border-red-200/90 rounded-xl text-xs text-red-950 space-y-1.5 ${className}`}>
        <div className="flex items-center gap-1.5 font-bold text-red-900">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>Notice: Offline Marketplace Inspection Only</span>
        </div>
        <p className="text-[11px] text-red-800 leading-relaxed">
          Meet in a public market. Inspect the animal before buying. <strong>Never pay online in advance.</strong> Axum Market is not responsible for transactions.
        </p>
        <div className="pt-1 text-[10px] text-red-700/90 border-t border-red-200/70">
          <span>አማርኛ፦ በገበያ ቦታ ተገናኝተው በአካል ይመርምሩ፤ በኦንላይን ገንዘብ እንዳይከፍሉ።</span>
        </div>
      </div>
    );
  }

  // Banner Variant (Top of browse or create pages)
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white p-4 rounded-2xl shadow-md space-y-3 ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base leading-tight">
                Offline Marketplace Safety Notice • የገበያ ደህንነት ማሳሰቢያ
              </h4>
              <p className="text-xs text-amber-100 mt-0.5">
                For connection &amp; info only. Inspect livestock in person before paying.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl self-end sm:self-center">
            {(['en', 'am', 'om'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setActiveLang(l)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition ${
                  activeLang === l ? 'bg-white text-amber-950 shadow-xs' : 'text-amber-100 hover:text-white'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-black/15 p-2.5 rounded-xl text-xs text-amber-50 leading-relaxed border border-white/10">
          {activeLang === 'en' && (
            <span>
              Always meet sellers in public marketplaces and inspect animals physically before buying. <strong>Do NOT pay money online.</strong> Axum Market does not guarantee or take responsibility for financial transactions.
            </span>
          )}
          {activeLang === 'am' && (
            <span>
              ሁልጊዜ ከሻጩ ጋር በይፋዊ ገበያ በአካል ተገናኝተው እንስሳውን ይመርምሩ። <strong>በኦንላይን ምንም ዓይነት ገንዘብ እንዳይከፍሉ!</strong> በመድረኩ በሚደረግ ማንኛውም ግብይት ድርጅቱ ኃላፊነት አይወስድም።
            </span>
          )}
          {activeLang === 'om' && (
            <span>
              Yeroo hunda gurguraa wajjin bakka gabaa uummataatti qaamaan wal arguun beelladicha sakatta&apos;aa. <strong>Toora interneetii irratti maallaqa hin kaffalinaa!</strong> Daldala raawwatamuuf itti gaafatamummaa hin fudhannu.
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full Rich Card Variant (Used on Listing Detail Page and prominent sections)
  const currentContent = activeLang === 'all' ? DISCLAIMERS.en : DISCLAIMERS[activeLang];

  return (
    <div
      className={`bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-amber-50/90 border-2 border-amber-300/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 ${className}`}
    >
      {/* Header & Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md mb-0.5">
              {currentContent.badge}
            </span>
            <h3 className="font-black text-sm sm:text-base text-amber-950 leading-tight">
              {currentContent.title}
            </h3>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1 bg-amber-200/60 p-1 rounded-xl self-start sm:self-center">
          {languagesList.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActiveLang(lang.code)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition active:scale-95 ${
                activeLang === lang.code
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-amber-900 hover:bg-amber-300/60'
              }`}
            >
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-medium">
        {currentContent.subtitle}
      </p>

      {/* 5 Core Rules (If not 'all') */}
      {activeLang !== 'all' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
          {currentContent.points.map((point, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition flex items-start gap-2.5 ${
                point.icon === 'ban'
                  ? 'bg-red-50/80 border-red-200/80 text-red-950'
                  : 'bg-white/85 border-amber-200/70 text-amber-950'
              }`}
            >
              {renderIcon(point.icon)}
              <div className="space-y-0.5 min-w-0">
                <h4
                  className={`text-xs font-bold ${
                    point.icon === 'ban' ? 'text-red-900' : 'text-amber-950'
                  }`}
                >
                  {point.title}
                </h4>
                <p
                  className={`text-[11px] sm:text-xs leading-relaxed ${
                    point.icon === 'ban' ? 'text-red-800' : 'text-amber-900/80'
                  }`}
                >
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Trilingual All-in-One View */
        <div className="space-y-3 pt-1">
          {(['en', 'am', 'om'] as const).map((langKey) => {
            const data = DISCLAIMERS[langKey];
            return (
              <div
                key={langKey}
                className="bg-white/90 border border-amber-200/80 rounded-xl p-3 sm:p-4 space-y-2"
              >
                <div className="flex items-center justify-between border-b border-amber-100 pb-1.5">
                  <span className="text-xs font-black text-amber-900 uppercase">
                    {langKey === 'en'
                      ? '🇬🇧 English'
                      : langKey === 'am'
                      ? '🇪🇹 አማርኛ (Amharic)'
                      : '🌳 Afaan Oromoo'}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    {data.badge}
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-amber-950">
                  {data.points.map((p, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold shrink-0">•</span>
                      <span>
                        <strong>{p.title}:</strong> {p.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Critical Highlight Warning Box */}
      <div className="p-3.5 sm:p-4 bg-red-100/90 border-2 border-red-300 rounded-2xl text-red-950 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1 text-xs sm:text-sm">
          <span className="font-black text-red-900 block">
            {currentContent.alertBox.prefix}
          </span>
          <p className="leading-relaxed font-semibold text-red-900">
            {currentContent.alertBox.text}
          </p>
        </div>
      </div>

      {/* Footer Offline Confirmation */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-amber-800/80 border-t border-amber-200/60">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% In-Person Physical Inspection Recommended</span>
        </div>
        <div className="flex items-center gap-1 font-bold text-amber-900">
          <span>Axum Market • አክሱም ማርኬት</span>
        </div>
      </div>
    </div>
  );
}


