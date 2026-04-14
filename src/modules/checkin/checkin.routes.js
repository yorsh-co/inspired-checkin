import express from 'express';
import * as controller from './checkin.controller.js';

const router = express.Router();

router.post('/ticket', controller.submitTicket);
router.post('/verification', controller.submitVerification);
router.post('/qr', controller.submitQrCode);
router.post('/reset', controller.reset);

// =========================
// DEBUG
// =========================

import { env } from '../../config/env.js';
import { CheckinService } from './checkin.service.js';

router.get('/debug', async (req, res) => {
  try {
    console.log('SESSION DEBUG REQUEST');
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

export default router;
