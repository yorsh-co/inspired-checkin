import express from 'express';
import * as controller from './checkin.controller.js';

const router = express.Router();

router.post('/ticket', controller.submitTicket);
router.post('/verification', controller.submitVerification);
router.post('/qr', controller.submitQrCode);

export default router;

/*
router.post('/api/v1/checkin/ticket', async (req, res) => {
  const service = new CheckinService({ req, res });

  const result = await service.submitTicket(req.body.ticket);

  res.json(result);
});

router.post('/api/v1/checkin/verification', async (req, res) => {
  const service = new CheckinService({ req, res });

  const result = await service.submitVerification(
    req.body.verificationCode
  );

  res.json(result);
});

router.post('/api/v1/checkin/qr', async (req, res) => {
  const service = new CheckinService({ req, res });

  const result = await service.scanQr(req.body.qrCode);

  res.json(result);
});




*/
