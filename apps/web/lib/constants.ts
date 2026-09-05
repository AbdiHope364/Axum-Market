export const APP_NAME = 'AxumMarket';
export const APP_TAGLINE = 'Ethiopian Livestock Marketplace & Classifieds';
export const CURRENCY = 'ETB';

export const SAFETY_MESSAGES = [
  'Never transfer money or make advance payments online.',
  'Inspect the livestock in person and verify animal health before any transaction.',
  'Meet sellers in safe, public agricultural markets or verified farm locations.',
  'AxumMarket is a classifieds broker connecting buyers & sellers. The platform does not process payments.',
];

export const REPORT_REASONS = [
  { id: 'FAKE', label: 'Fake listing / Scammer suspicion' },
  { id: 'ALREADY_SOLD', label: 'Animal is already sold' },
  { id: 'WRONG_INFO', label: 'Inaccurate breed, age, or price information' },
  { id: 'SUSPICIOUS', label: 'Suspicious seller activity / Unreachable phone' },
  { id: 'DUPLICATE', label: 'Duplicate listing' },
  { id: 'OTHER', label: 'Other violation' },
];

export function formatPriceETB(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace('ETB', 'ETB ');
}

export function formatPhoneNumber(phone: string): string {
  // Normalize Ethiopian numbers e.g. 0911234567 or +251911234567
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
  return cleaned;
}

