export const APP_NAME = 'AxumMarket Admin';

export function formatPriceETB(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace('ETB', 'ETB ');
}

