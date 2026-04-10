import express from 'express';
import { CheckinService } from '../checkin/checkin.service.js';
import { env } from '../../config/env.js';

const router = express.Router();

router.get('/checkin/debug', async (req, res) => {
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

router.post('/checkin/debug/reset', async (req, res) => {
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
