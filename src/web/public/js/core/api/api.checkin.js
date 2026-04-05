export const verifyTicket = async ticket => {
  const res = await fetch('/api/v1/checkin/ticket', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket })
  });

  //if (!res.ok) throw new Error('invalid');
  alert(await res.text());
  const data = await res.json();

  alert(data);
  return data;
};

export const verifyQr = async qrCode => {
  const res = await fetch('/api/v1/checkin/qr', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrCode })
  });

  //if (!res.ok) throw new Error('invalid');
  alert(await res.text());
  const data = await res.json();

  alert(data);
  return data;
};
