export const verifyTicket = async ticket => {
  const res = await fetch('/api/checkin/ticket', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket })
  });

  if (!res.ok) throw new Error('invalid');

  alert(res.json());
  return res.json();
};

export const verifyQr = async qrCode => {
  const res = await fetch('/api/checkin/qr', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrCode })
  });

  if (!res.ok) throw new Error('invalid');

  alert(res.json());
  return res.json();
};
