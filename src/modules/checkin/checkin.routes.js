import express from 'express';
import * as controller from './checkin.controller.js';

const router = express.Router();

router.post('/ticket', controller.submitTicket);
router.post('/verification', controller.submitVerification);
router.post('/qr', controller.submitQrCode);

router.get('/debug', async (req, res) => {
  try {
    if (env.nodeEnv === 'production') {
      return res.status(404).end();
    }

    const service = new CheckinService({ req, res });

    const debug = await service.debug();

    res.json(debug);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Debug failed' });
  }
});

router.post('/debug/reset', async (req, res) => {
  if (env.nodeEnv === 'production') {
    return res.status(404).end();
  }

  const sessionId = req.cookies['checkin_session_id'];

  if (sessionId) {
    await destroySession(sessionId);
  }

  res.clearCookie('checkin_session_id');

  res.json({ ok: true });
});

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
