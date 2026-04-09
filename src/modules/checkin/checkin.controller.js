import * as qr from '../qr/qr.service.js';

export const validateTicket = async (req, res) => {
  console.log(req.body);
  return res.status(200).json({
    code: 'TICKET_VALIDATED',
    nextStep: 'verification',
    checkinStatus: 'pending_verification',
    data: {
      user: { ticket: 't35t3', name: 'João ... Barros', telStart: '11912' },
    },
  });

  // TODO:
};

export const verifyUser = async (req, res) => {
  console.log(req.body);
  return res.status(200).json({
    code: 'USER_VERIFIED',
    nextStep: 'qr',
    checkinStatus: 'pending_qr',
  });

  // TODO:
};

export const processQrCode = async (req, res) => {
  console.log(req.body);
  return res.status(200).json({
    code: 'QR_PROCESSED',
    nextStep: 'success',
    checkinStatus: 'checked_in',
  });

  // TODO:
};
