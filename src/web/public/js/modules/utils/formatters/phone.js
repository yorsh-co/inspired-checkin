const formatLocalePhone = (phone, locale) => {
  const formatters = {
    'pt-BR': (phoneStr) => {
      if (!phoneStr) return '';
      console.error(phoneStr);
      const original = phoneStr;
      let digits = phoneStr.replace(/\D/g, '');

      if (digits.startsWith('55')) digits = digits.slice(2);

      const ddd = digits.slice(0, 2);
      let number = digits.slice(2);

      // If no DDD yet, just return masked partial
      if (digits.length <= 2) {
        return `(${ddd}${'•'.repeat(2 - ddd.length)}) ••••-••••`;
      }

      // Validate DDD when complete
      if (ddd.length === 2 && !/^[1-9][0-9]$/.test(ddd)) {
        return original;
      }

      // Decide type (mobile vs landline)
      const isMobile = number.startsWith('9') || number.length > 8;

      const maxLen = isMobile ? 9 : 8;
      const padded = (number + '•'.repeat(maxLen)).slice(0, maxLen);

      if (isMobile) {
        return `(${ddd}) ${padded.slice(0, 5)}-${padded.slice(5)}`;
      }

      return `(${ddd}) ${padded.slice(0, 4)}-${padded.slice(4)}`;
    },
  };

  return formatters[locale](phone);
};

const formatInternationalPhone = (phone) => {
  if (!phone) return '';

  const original = phone;
  const digits = phone.replace(/\D/g, '');

  if (!digits) return original;

  // Pad to minimum (10 digits: 2 DDD + 8 number)
  const padded = (digits + '•'.repeat(13)).slice(0, 13);

  return '+' + padded;
};

// ===============
// Export
// ===============

export const formatPhone = {
  locale: formatLocalePhone,
  international: formatInternationalPhone,
};
