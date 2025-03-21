export const currencySymbol = '₹';

export const formatCurrency = (amount: number): string => {
  return `${currencySymbol}${amount.toLocaleString('en-IN')}`;
};

export const parseCurrency = (value: string): number => {
  return Number(value.replace(currencySymbol, '').replace(/,/g, '')) || 0;
};
