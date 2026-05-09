export const generateReservationId = () => {
  return `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const calculatePrice = (tierRate, duration) => {
  return (tierRate * duration).toFixed(2);
};

export const formatCardNumber = (value) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Add space every 4 digits
  const groups = digits.match(/.{1,4}/g);

  return groups ? groups.join(' ') : digits;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCardNumber = (cardNumber) => {
  const digits = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(digits);
};

export const validateExpiry = (expiry) => {
  // Check format MM/YY
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return false;
  }

  const [month, year] = expiry.split('/').map(Number);

  // Check valid month
  if (month < 1 || month > 12) {
    return false;
  }

  // Check if date is in the future
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Get last 2 digits
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  return true;
};

export const validateCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

export const formatExpiry = (value) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Add slash after 2 digits
  if (digits.length >= 2) {
    return digits.slice(0, 2) + '/' + digits.slice(2, 4);
  }

  return digits;
};

export const getCardLast4 = (cardNumber) => {
  const digits = cardNumber.replace(/\s/g, '');
  return digits.slice(-4);
};
