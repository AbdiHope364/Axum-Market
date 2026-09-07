import { NextResponse } from 'next/server';

// In-memory translation cache to save bandwidth and deliver instant responses
const translationCache = new Map<string, string>();

export async function POST(req: Request) {
  try {
    const { text, targetLang = 'en', sourceLang = 'auto' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text string is required' }, { status: 400 });
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return NextResponse.json({ translatedText: '' });
    }

    // Map common language aliases
    let lang = targetLang.toLowerCase();
    if (lang === 'oromo' || lang === 'afan_oromo' || lang === 'afaan_oromoo') lang = 'om';
    if (lang === 'amharic' || lang === 'amh') lang = 'am';
    if (lang === 'english' || lang === 'eng') lang = 'en';

    // Check cache
    const cacheKey = `${lang}:${sourceLang}:${trimmed}`;
    if (translationCache.has(cacheKey)) {
      return NextResponse.json({
        translatedText: translationCache.get(cacheKey),
        sourceLang,
        targetLang: lang,
        cached: true,
      });
    }

    // If source and target are the same, return as is
    if (sourceLang === lang) {
      return NextResponse.json({ translatedText: trimmed, targetLang: lang });
    }

    // Free Google Translate endpoint (gtx client)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      sourceLang
    )}&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(trimmed)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Translate endpoint returned ${response.status}`);
    }

    const data = await response.json();
    let translatedText = '';

    if (Array.isArray(data) && Array.isArray(data[0])) {
      translatedText = data[0].map((item: any) => (Array.isArray(item) ? item[0] : '')).join('');
    } else {
      translatedText = trimmed;
    }

    if (translatedText) {
      translationCache.set(cacheKey, translatedText);
      // Keep cache bounded
      if (translationCache.size > 2000) {
        const firstKey = translationCache.keys().next().value;
        if (firstKey) translationCache.delete(firstKey);
      }
    }

    return NextResponse.json({
      translatedText: translatedText || trimmed,
      targetLang: lang,
      sourceLang: data[2] || sourceLang,
      cached: false,
    });
  } catch (error) {
    console.error('Translation error:', error);
    // Graceful fallback: return original text instead of 500 error
    try {
      const body = await req.clone().json().catch(() => ({}));
      return NextResponse.json({
        translatedText: body.text || '',
        targetLang: body.targetLang || 'en',
        fallback: true,
      });
    } catch {
      return NextResponse.json({ translatedText: '', fallback: true });
    }
  }
}
