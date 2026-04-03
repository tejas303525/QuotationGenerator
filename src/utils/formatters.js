export const formatCurrency = (amount, currency = 'AED') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
};

export const formatNumber = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateISO = (date) => {
  return date.toISOString();
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isExpired = (expiryDate, status) => {
  if (status === 'Approved' || status === 'Rejected') return false;
  const now = new Date();
  const expiry = new Date(expiryDate);
  return expiry < now;
};

export const formatQuoteNumber = (prefix, number) => {
  const paddedNum = number.toString().padStart(4, '0');
  return `${prefix}${paddedNum}`;
};
