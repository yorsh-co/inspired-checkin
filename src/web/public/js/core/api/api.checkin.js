export const submitTicket = async (ticket) => {
  const res = await fetch('/api/v1/checkin/ticket', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  console.log(data.code);

  return data;
};

export const submitVerification = async (verificationCode) => {
  const res = await fetch('/api/v1/checkin/verification', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationCode }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  console.log(data.code);

  return data;
};

export const submitQrCode = async (qrCode) => {
  const res = await fetch('/api/v1/checkin/qr', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrCode }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  console.log(data.code);

  return data;
};

export const reset = async () => {
  const res = await fetch('/api/v1/checkin/reset', {
    method: 'POST',
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  console.log(data.code);

  return data;
};

export const debugSession = async () => {
  const res = await fetch('/api/v1/checkin/debug', {
    method: 'GET',
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  console.log(data);

  return data;
};
