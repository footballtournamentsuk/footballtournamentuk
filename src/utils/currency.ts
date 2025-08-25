/**
 * Get the currency symbol for a given currency code
 * @param currency The ISO currency code (e.g., 'GBP', 'EUR', 'USD')
 * @returns The currency symbol (e.g., '£', '€', '$')
 */
export const getCurrencySymbol = (currency: string): string => {
  switch (currency?.toUpperCase()) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'GBP':
    default:
      return '£';
  }
};

/**
 * Format a price with the correct currency symbol
 * @param amount The price amount
 * @param currency The ISO currency code
 * @returns Formatted price string (e.g., '€450', '$100', '£50')
 */
export const formatPrice = (amount: number | string, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount}`;
};