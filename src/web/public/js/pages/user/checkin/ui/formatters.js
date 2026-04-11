export const formatTicket = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 5);

export const isValidTicket = (value) => /^[a-z0-9]{5}$/.test(value);

export const formatVerificationCode = (value) =>
  value.replace(/[^0-9]/g, '').slice(0, 4);

export const isValidVerificationCode = (value) => /^[0-9]{4}$/.test(value);

export const formatter = {
  ticketCode: {
    format: formatTicket,
    isValid: isValidTicket,
  },
  verificationCode: {
    format: formatVerificationCode,
    isValid: isValidVerificationCode,
  },
};
