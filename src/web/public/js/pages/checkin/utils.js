export const formatTicket = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 5);

export const isValidTicket = (value) => /^[a-z0-9]{5}$/.test(value);
