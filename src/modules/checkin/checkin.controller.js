import * as qr from '../qr/qr.service.js';

export const validateTicket = async (req, res) => {
  console.log(req.body);
  return res.status(200).json({
    code: 'TICKET_VALID',
    message: 'Ticket endpoint working',
    request: { body: req.body, headers: req.headers }, // FIXME:
    data: { ticketValidated: true, qrValidated: false, checkinComplete: false }
  });

  // TODO:
};

export const validateQr = async (req, res) => {
  console.log(req.body);
  return res.status(200).json({
    code: 'QR_VALID',
    message: 'QR endpoint working',
    request: { body: req.body, headers: req.headers }, // FIXME:
    data: { ticketValidated: true, qrValidated: true, checkinComplete: true }
  });

  // TODO:
};
