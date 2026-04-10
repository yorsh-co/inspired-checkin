export const maskName = (name) => {
  if (!name) return '';

  const parts = name.split(' ');

  return `${parts[0]}${parts.length > 2 ? ' ...' : ''} ${parts[parts.length - 1][0]}.`;
  //return parts.map((p, i) => (i === 0 ? p : p[0] + '...')).join(' ');
};

export const maskPhone = (phone) => {
  if (!phone) return '';

  return phone.slice(0, 9);
};
