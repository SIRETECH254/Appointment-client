export const formatCurrency = (amount: number | string | undefined, currency: string = 'KES') => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (value === undefined || isNaN(value)) return `${currency} 0.00`;
  
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
