export const verifyTicket = async (ticket) => {
  const res = await fetch('/api/checkin', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket }),
  });

  if (!res.ok) throw new Error('invalid');

  return res.json();
};

export const verifyQR = async (qrCode) => {
  const res = await fetch('/api/verify-presence', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrCode }),
  });

  if (!res.ok) throw new Error('invalid');

  return res.json();
};
