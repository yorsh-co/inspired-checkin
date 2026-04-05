import * as qr from '../qr/qr.service.js';

export const validateTicket = async (req, res) => {
  console.log(req.body);
  return res.status(200).json({
    ok: true,
    message: 'Ticket endpoint working',
    body: {
      req: req.body,
      qrValidated: false
    },
    headers: req.headers
  });

  // TODO:
};

export const validateQr = async (req, res) => {
  console.log(req.body);
  return res.status(200).json({
    ok: true,
    message: 'QR endpoint working',
    body: { req: req.body, ticketValidated: true },
    headers: req.headers
  });

  // TODO:
};
