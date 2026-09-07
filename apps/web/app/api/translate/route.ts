import { NextResponse } from 'next/server';

// In-memory translation cache to deliver instant responses
const translationCache = new Map<string, string>();

function cleanText(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

async function translateWithGoogle(text: string, targetLang: string, sourceLang: string = 'auto'): Promise<string | null> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      sourceLang
    )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0].map((item: any) => (Array.isArray(item) ? item[0] : '')).join('');
      return cleanText(translated) || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function translateWithMyMemory(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string | null> {
  try {
    const from = sourceLang === 'auto' ? 'en' : sourceLang;
    const pair = `${from}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.responseData?.translatedText;
    if (result && typeof result === 'string' && !result.includes('MYMEMORY WARNING')) {
      return cleanText(result);
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let bodyText = '';
  let target = 'en';

  try {
    const body = await req.json();
    bodyText = typeof body.text === 'string' ? body.text.trim() : '';
    const rawTarget = typeof body.targetLang === 'string' ? body.targetLang.toLowerCase().trim() : 'en';

    // Map common aliases
    target =
      rawTarget === 'oromo' || rawTarget === 'afan_oromo' || rawTarget === 'afaan_oromoo'
        ? 'om'
        : rawTarget === 'amharic' || rawTarget === 'amh'
        ? 'am'
        : 'en';

    if (!bodyText) {
      return NextResponse.json({ translatedText: '' });
    }

    if (target === 'en') {
      return NextResponse.json({ translatedText: bodyText, targetLang: 'en' });
    }

    // Check cache
    const cacheKey = `${target}:${bodyText}`;
    if (translationCache.has(cacheKey)) {
      return NextResponse.json({
        translatedText: translationCache.get(cacheKey),
        targetLang: target,
        cached: true,
      });
    }

    // Try Google Translate first
    let result = await translateWithGoogle(bodyText, target);

    // Fallback to MyMemory if Google is blocked or fails
    if (!result) {
      result = await translateWithMyMemory(bodyText, target);
    }

    // If both return null, fallback to original text
    const finalTranslation = result || bodyText;

    if (result) {
      translationCache.set(cacheKey, result);
      if (translationCache.size > 2000) {
        const firstKey = translationCache.keys().next().value;
        if (firstKey) translationCache.delete(firstKey);
      }
    }

    return NextResponse.json({
      translatedText: finalTranslation,
      targetLang: target,
      cached: false,
    });
  } catch (error) {
    console.error('Translate API error:', error);
    return NextResponse.json({
      translatedText: bodyText,
      targetLang: target,
      fallback: true,
    });
  }
}
