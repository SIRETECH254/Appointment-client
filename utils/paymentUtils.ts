export const formatCurrency = (amount: number | string | undefined, currency: string = 'KES') => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (value === undefined || isNaN(value)) return `${currency} 0.00`;
  
  // Use 'en-US' locale to ensure consistent formatting without currency symbols
  // Only format as number, not as currency, to avoid adding $ or other symbols
  return `${currency} ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
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

/**
 * Normalizes and validates phone number for M-Pesa
 * Kenyan phone numbers must follow strict formats:
 * - 07XXXXXXXX (10 digits starting with 07 for mobile)
 * - 01XXXXXXXX (10 digits starting with 01 for landline)
 * - 2547XXXXXXXX (12 digits starting with 2547 for mobile with country code)
 * - 2541XXXXXXXX (12 digits starting with 2541 for landline with country code)
 * Returns normalized format: 2547XXXXXXXX or 2541XXXXXXXX (without +)
 */
export const normalizePhoneNumber = (phone: string): { isValid: boolean; normalized: string; error?: string } => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, normalized: '', error: 'Phone number is required' };
  }

  // Remove all spaces, dashes, and other non-digit characters except +
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Remove leading + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Check if it's all digits
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, normalized: '', error: 'Phone number must contain only digits' };
  }

  // Handle 10-digit format (starting with 0)
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Must start with 07 (mobile) or 01 (landline)
    if (cleaned.startsWith('07')) {
      // Mobile: 07XXXXXXXX -> 2547XXXXXXXX
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('01')) {
      // Landline: 01XXXXXXXX -> 2541XXXXXXXX
      cleaned = '254' + cleaned.substring(1);
    } else {
      return {
        isValid: false,
        normalized: '',
        error: 'Phone number must start with 07 (mobile) or 01 (landline). Example: 0757429010 or 0123456789'
      };
    }
  }
  // Handle 12-digit format (with country code)
  else if (cleaned.length === 12) {
    // Must start with 2547 (mobile) or 2541 (landline)
    if (!cleaned.startsWith('2547') && !cleaned.startsWith('2541')) {
      return {
        isValid: false,
        normalized: '',
        error: 'Phone number with country code must start with 2547 (mobile) or 2541 (landline). Example: 254757429010 or 254112345678'
      };
    }
  } else {
    return {
      isValid: false,
      normalized: '',
      error: 'Phone number must be 10 digits (starting with 07 or 01) or 12 digits (starting with 2547 or 2541). Example: 0757429010 or 254757429010'
    };
  }

  // Final validation: ensure it's exactly 12 digits and starts with 2547 or 2541
  if (cleaned.length !== 12) {
    return {
      isValid: false,
      normalized: '',
      error: 'Invalid phone number format'
    };
  }

  if (!cleaned.startsWith('2547') && !cleaned.startsWith('2541')) {
    return {
      isValid: false,
      normalized: '',
      error: 'Phone number must start with 2547 (mobile) or 2541 (landline)'
    };
  }

  return { isValid: true, normalized: cleaned };
};

/**
 * Validates email address format
 * Returns validation result with normalized email (lowercase)
 */
export const validateEmail = (email: string): { isValid: boolean; normalized: string; error?: string } => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, normalized: '', error: 'Email is required' };
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  // Basic email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, normalized: '', error: 'Please enter a valid email address (e.g., name@example.com)' };
  }

  // Additional validation: check for valid domain
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return { isValid: false, normalized: '', error: 'Invalid email format' };
  }

  const [localPart, domain] = parts;
  
  if (localPart.length === 0 || localPart.length > 64) {
    return { isValid: false, normalized: '', error: 'Email local part must be between 1 and 64 characters' };
  }

  if (domain.length === 0 || !domain.includes('.')) {
    return { isValid: false, normalized: '', error: 'Email must have a valid domain (e.g., example.com)' };
  }

  return { isValid: true, normalized: trimmedEmail };
};
