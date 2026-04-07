export const verifyTicket = async ticket => {
  const res = await fetch('/api/v1/checkin/ticket', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  console.log(data.code);

  return data;
};

export const verifyQr = async qrCode => {
  const res = await fetch('/api/v1/checkin/qr', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrCode })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  console.log(data.code);

  return data;
};
