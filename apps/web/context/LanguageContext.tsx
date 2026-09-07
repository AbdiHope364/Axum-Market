'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'am' | 'om';

export const DICTIONARY: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navigation
    home: 'Home',
    browse_animals: 'Browse Animals',
    post_animal: 'Post Animal',
    sell: 'Sell',
    login: 'Seller Login',
    register: 'Register',
    dashboard: 'Dashboard',
    admin_portal: 'Admin',
    select_language: 'Language',
    // Hero & Search
    hero_title_1: 'Buy & Sell Livestock',
    hero_title_2: 'Directly',
    hero_subtitle: 'Connect directly with Ethiopian cattle & sheep farmers by phone. 100% offline inspection.',
    classifieds_badge: 'Ethiopia Livestock Classifieds',
    direct_call_badge: 'Direct Call • 0% Online Fee',
    search_placeholder: 'Search dairy cow, Borana bull, sheep...',
    filter_by_region: 'Filter by Region',
    all_ethiopia: 'All Ethiopia',
    filters: 'Filters',
    quick_tags: 'Quick:',
    all_animals: 'All Animals',
    all_animals_sub: 'All Livestock',
    choose_category: 'Choose Animal Category',
    active: 'Active',
    show_all: 'Show All',
    // Mood Tabs
    tab_all: 'All',
    tab_dairy: 'Dairy Cattle',
    tab_beef: 'Beef Cattle',
    tab_sheep_goat: 'Sheep & Goats',
    tab_budget: '< 60k ETB',
    // Feed Header
    recent_listings: 'Recent Livestock Listings',
    showing: 'Showing',
    animals_found: 'animals found',
    no_animals: 'No animals found matching criteria',
    reset_filters: 'Reset All Filters',
    // Listing Card
    call: 'Call',
    details: 'Details',
    sold_out: 'Sold Out',
    female: 'Female',
    male: 'Male',
    in_calf: 'In-Calf',
    liters_day: 'L/day',
    // How It Works
    how_it_works_badge: 'Safe & Simple',
    how_it_works_title: 'How Buyers Trade on AxumMarket',
    step1_title: 'Browse Photos',
    step1_desc: 'Inspect 3 verified photo angles and live weight.',
    step2_title: 'Direct Call',
    step2_desc: 'Dial the seller directly to discuss price.',
    step3_title: 'Physical Visit',
    step3_desc: 'Inspect animal health and teeth in person.',
    step4_title: 'In-Person Pay',
    step4_desc: 'Pay in cash/transfer only after complete satisfaction.',
    // Checklist
    checklist_title: 'Buyer In-Person Physical Inspection Checklist',
    check1: 'Never pay online in advance. Meet the seller at an official livestock marketplace.',
    check2: 'Check teeth (dentition) to verify the true age of the animal.',
    check3: 'For dairy cows, inspect the udder, test all 4 teats for milk, and check for mastitis.',
    check4: 'Zero advance deposits or transport fees. Pay only upon physical handover.',
    // CTA
    seller_cta_title: 'Selling Cattle or Sheep?',
    seller_cta_subtitle: 'Post in 2 minutes. Receive direct calls from buyers across Ethiopia with 0% commission.',
    post_livestock_now: 'Post Livestock Now',
    // Footer
    footer_tagline: "Ethiopia's dedicated livestock classifieds and marketplace platform. Connecting dairy farmers, cattle fatteners, and pastoralists directly with buyers.",
    footer_offline_tag: 'Direct offline transactions only • Zero online checkout',
    explore_livestock: 'Explore Livestock',
    sellers_safety: 'Sellers & Safety',
    safety_disclaimer_link: 'Safety & Offline Warning',
    safety_reminder: 'Safety Reminder: Axum Market does not process payments or guarantee transactions. Inspect animals in person at an official marketplace before purchasing. Never send money in advance.',
  },
  am: {
    // Navigation
    home: 'መነሻ',
    browse_animals: 'እንስሳትን ይመልከቱ',
    post_animal: 'እንስሳ ይለጥፉ',
    sell: 'ሽጥ',
    login: 'የሻጭ መግቢያ',
    register: 'ይመዝገቡ',
    dashboard: 'ዳሽቦርድ',
    admin_portal: 'አድሚን',
    select_language: 'ቋንቋ',
    // Hero & Search
    hero_title_1: 'እንስሳትን በቀጥታ',
    hero_title_2: 'ይግዙ እና ይሽጡ',
    hero_subtitle: 'ከኢትዮጵያ የወተት ላም እና የበሬ አርቢዎች ጋር በስልክ በቀጥታ ይገናኙ። ግብይቱ 100% በአካል በገበያ ቦታ የሚፈጸም ነው።',
    classifieds_badge: 'የኢትዮጵያ የቀጥታ እንስሳት ማስታወቂያ',
    direct_call_badge: 'ቀጥታ ጥሪ • 0% የኦንላይን ክፍያ',
    search_placeholder: 'የወተት ላም፣ ቦረና በሬ፣ በግ፣ ፍየል ይፈልጉ...',
    filter_by_region: 'በክልል ይምረጡ',
    all_ethiopia: 'መላው ኢትዮጵያ',
    filters: 'ማጣሪያዎች',
    quick_tags: 'ፈጣን ፍለጋ፦',
    all_animals: 'ሁሉም እንስሳት',
    all_animals_sub: 'ሁሉም ከብቶች',
    choose_category: 'የእንስሳት ዓይነት ይምረጡ',
    active: 'የተመረጠ',
    show_all: 'ሁሉንም አሳይ',
    // Mood Tabs
    tab_all: 'ሁሉም',
    tab_dairy: 'የወተት ከብቶች',
    tab_beef: 'የስጋ በሬዎች',
    tab_sheep_goat: 'በጎችና ፍየሎች',
    tab_budget: '< 60ሺህ ብር',
    // Feed Header
    recent_listings: 'የቀረቡ የቅርብ ጊዜ እንስሳት',
    showing: 'የሚታዩት',
    animals_found: 'የተገኙ እንስሳት',
    no_animals: 'በዚህ ፍለጋ ምንም እንስሳ አልተገኘም',
    reset_filters: 'ማጣሪያዎችን አጽዳ',
    // Listing Card
    call: 'ደውል',
    details: 'ዝርዝር',
    sold_out: 'ተሽጧል',
    female: 'ሴት',
    male: 'ወንድ',
    in_calf: 'እርጉዝ',
    liters_day: 'ሊ/ቀን',
    // How It Works
    how_it_works_badge: 'ቀላል እና ደህንነቱ የተጠበቀ',
    how_it_works_title: 'በአክሱም ማርኬት ግብይት እንዴት ይፈጸማል?',
    step1_title: 'ፎቶዎችን ይመልከቱ',
    step1_desc: 'የተረጋገጡ 3 የፎቶ አቅጣጫዎችን እና የቀጥታ ክብደትን ያረጋግጡ።',
    step2_title: 'በቀጥታ ይደውሉ',
    step2_desc: 'ዋጋውን ለመደራደር በቀጥታ ለሻጩ ስልክ ይደውሉ።',
    step3_title: 'በአካል ይጎብኙ',
    step3_desc: 'በይፋዊ ገበያ ወይም በህዝብ ቦታ ተገናኝተው የእንስሳውን ጤንነት እና ጥርስ በአካል ይመርምሩ።',
    step4_title: 'በአካል ይክፈሉ',
    step4_desc: 'ሙሉ በሙሉ ሲረኩ እና ሲያረጋግጡ ብቻ ክፍያ ይፈጽሙ።',
    // Checklist
    checklist_title: 'ለገዢዎች በአካል የመመርመሪያ መመሪያ',
    check1: 'በኦንላይን ምንም ዓይነት ገንዘብ እንዳይከፍሉ! ሁልጊዜ ከሻጩ ጋር በይፋዊ ገበያ በአካል ይገናኙ።',
    check2: 'ትክክለኛውን እድሜ ለማረጋገጥ የእንስሳውን ጥርስ (ጥርሱን) በአካል ይመልከቱ።',
    check3: 'ለወተት ላሞች፣ የጡት ጤንነትን እና 4ቱንም ጡቶች ወተት መሥራታቸውን ያረጋግጡ።',
    check4: 'ምንም ዓይነት የቅድመ ክፍያ ወይም የትራንስፖርት ገንዘብ እንዳይልኩ። ክፍያ የሚፈጸመው በአካል ሲረከቡ ብቻ ነው።',
    // CTA
    seller_cta_title: 'ከብት ወይም በግ ለመሸጥ ይፈልጋሉ?',
    seller_cta_subtitle: 'በ2 ደቂቃ ውስጥ በነፃ ይለጥፉ። ያለ ምንም ኮሚሽን ከገዢዎች ቀጥታ የስልክ ጥሪ ይቀበሉ።',
    post_livestock_now: 'አሁን እንስሳ ይለጥፉ',
    // Footer
    footer_tagline: 'የኢትዮጵያ የእንስሳት ማስታወቂያ እና የቀጥታ የገበያ መድረክ። የወተት አርሶ አደሮችን፣ የበሬ አደላቢዎችን እና ገዢዎችን በቀጥታ ያገናኛል።',
    footer_offline_tag: 'ቀጥታ በአካል የሚደረግ ግብይት ብቻ • በኦንላይን ምንም ክፍያ አይፈጸምም',
    explore_livestock: 'እንስሳትን ያስሱ',
    sellers_safety: 'ሻጮች እና ደህንነት',
    safety_disclaimer_link: 'የደህንነት እና የግብይት ማስጠንቀቂያ',
    safety_reminder: 'የደህንነት ማሳሰቢያ፦ አክሱም ማርኬት ክፍያዎችን አያከናውንም፤ ለግብይትም ዋስትና አይሰጥም። ከመግዛትዎ በፊት እንስሳትን በይፋዊ ገበያ በአካል ይመርምሩ። በኦንላይን ምንም ዓይነት ገንዘብ እንዳይከፍሉ።',
  },
  om: {
    // Navigation
    home: 'Fuula Duraa',
    browse_animals: 'Beellada Daawwadhaa',
    post_animal: 'Beellada Galchaa',
    sell: 'Gurguri',
    login: 'Seensa Gurguraa',
    register: 'Galmaa’aa',
    dashboard: 'Daashboordii',
    admin_portal: 'Bulchaa',
    select_language: 'Afaan',
    // Hero & Search
    hero_title_1: 'Beellada Kallattiin',
    hero_title_2: 'Bitaa fi Gurguraa',
    hero_subtitle: 'Hormattota loon aannanii fi gabbistoota kormaa wajjin bilbilaan kallattiin wal qunnamaa. Sakatta’insi 100% qaamaan bakka gabaatti ta’a.',
    classifieds_badge: 'Beeksisa Beelladaa Kallattii Itoophiyaa',
    direct_call_badge: 'Bilbila Kallattii • Kaffaltiin Tooraa 0%',
    search_placeholder: 'Sa’a aannanii, korma Booranaa, hoolaa, re’ee barbaadaa...',
    filter_by_region: 'Naannoodhaan Filtarii',
    all_ethiopia: 'Guutuu Itoophiyaa',
    filters: 'Filtarii',
    quick_tags: 'Saffisaan:',
    all_animals: 'Beellada Hunda',
    all_animals_sub: 'Beelladoota Hunda',
    choose_category: 'Gosa Beelladaa Filadhaa',
    active: 'Kan Filatame',
    show_all: 'Hunda Agarsiisi',
    // Mood Tabs
    tab_all: 'Hunda',
    tab_dairy: 'Loon Aannanii',
    tab_beef: 'Korma Foonii',
    tab_sheep_goat: 'Hoolaa fi Re’ee',
    tab_budget: '< 60k Qarshii',
    // Feed Header
    recent_listings: 'Beellada Dhiyoo Dhihaatan',
    showing: 'Kan Agarsiifamu',
    animals_found: 'beelladoota argaman',
    no_animals: 'Ulaagaa kanaan beelladni hin argamne',
    reset_filters: 'Filtarii Hunda Haqaa',
    // Listing Card
    call: 'Bilbilaa',
    details: 'Bal’ina',
    sold_out: 'Gurgurameera',
    female: 'Dhalaa',
    male: 'Korma',
    in_calf: 'Rimaa',
    liters_day: 'L/guyyaa',
    // How It Works
    how_it_works_badge: 'Salphaa fi Nageenya Qabu',
    how_it_works_title: 'Aksum Maarkeet Irratti Daldalli Akkamitti Ta’a?',
    step1_title: 'Suuraa Daawwadhaa',
    step1_desc: 'Kallattii suuraa 3 mirkanaa’ee fi ulfaatina kallattiin sakatta’aa.',
    step2_title: 'Kallattiin Bilbilaa',
    step2_desc: 'Gatii irratti walii galuuf kallattiin gurguraaf bilbilaa.',
    step3_title: 'Qaamaan Daawwadhaa',
    step3_desc: 'Bakka gabaa uummataatti wal arguun fayyaa fi ilkaan beelladichaa qaamaan sakatta’aa.',
    step4_title: 'Qaamaan Kaffalaa',
    step4_desc: 'Guutummaatti yoo jaallattan fi mirkaneeffattan qofa kaffaltii raawwadhaa.',
    // Checklist
    checklist_title: 'Qajeelfama Sakatta’iinsa Qaamaa Bittootaaf',
    check1: 'Toora interneetii irratti maallaqa hin kaffalinaa! Yeroo hunda bakka gabaatti wal argaa.',
    check2: 'Umurii isaa mirkaneeffachuuf ilkaan beelladichaa qaamaan ilaalaa.',
    check3: 'Sa’a aannaniif, fayyaa harmaa fi muchi 4n aannan qabaachuu isaanii mirkaneeffadhaa.',
    check4: 'Kaffaltii duraa ykn baasii geejjibaa hin erginaa. Beelladicha yoo harkaan fudhattan qofa kaffalaa.',
    // CTA
    seller_cta_title: 'Loon ykn Hoolaa Gurguruu Barbaadduu?',
    seller_cta_subtitle: 'Daqiiqaa 2 keessatti tolaan galchaa. Komishinii malee bittoota irraa bilbila kallattii fudhadhaa.',
    post_livestock_now: 'Amma Beellada Galchaa',
    // Footer
    footer_tagline: 'Platformii beeksisa beelladaa fi gabaa kallattii Itoophiyaa. Hormattota loon aannanii fi gabbistoota kormaa kallattiin bittoota wajjin wal qunnamsiisa.',
    footer_offline_tag: 'Daldala kallattii qaamaan qofa • Kaffaltiin toora interneetii hin jiru',
    explore_livestock: 'Beellada Qoradhaa',
    sellers_safety: 'Gurgurtoota fi Nageenya',
    safety_disclaimer_link: 'Akeekkachiisa Nageenya Gabaa',
    safety_reminder: 'Akeekkachiisa Nageenyaa: Aksum Maarkeet kaffaltii hin raawwatu, daldalaafis wabii hin ta’u. Bituu dura bakka gabaa uummataatti beelladicha qaamaan sakatta’aa. Toora interneetii irratti maallaqa hin kaffalinaa.',
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translateText: (text: string, targetLang?: SupportedLanguage) => Promise<string>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  translateText: async (text) => text,
  t: (key: string) => key,
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

  const t = (key: string): string => {
    const langDict = DICTIONARY[language] || DICTIONARY.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return DICTIONARY.en[key] || key;
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
    <LanguageContext.Provider value={{ language, setLanguage, translateText, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
