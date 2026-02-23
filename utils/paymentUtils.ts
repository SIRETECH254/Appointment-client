export const formatCurrency = (amount: number | string | undefined, currency: string = 'KES') => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (value === undefined || isNaN(value)) return `${currency} 0.00`;
  
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPaymentStatus = (status: string | undefined) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const getPaymentStatusVariant = (status: string | undefined) => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS':
    case 'COMPLETED':
      return 'badge-success';
    case 'PENDING':
    case 'PROCESSING':
      return 'badge-soft';
    case 'FAILED':
    case 'CANCELLED':
      return 'badge-error';
    default:
      return 'badge-soft';
  }
};

export const formatPaymentMethod = (method: string | undefined) => {
  if (!method) return 'N/A';
  switch (method.toUpperCase()) {
    case 'MPESA': return 'M-Pesa';
    case 'PAYSTACK': return 'Card/Paystack';
    case 'CASH': return 'Cash';
    default: return method;
  }
};

export const formatPaymentType = (type: string | undefined) => {
  if (!type) return 'N/A';
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};
