/**
 * Formats a number into Indian Rupee (INR) currency format.
 * Example: 120000 -> ₹1,20,000
 */
export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a number with Indian thousand separators but no currency symbol.
 * Example: 120000 -> 1,20,000
 */
export const formatNumberIN = (num) => {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};
