import express from 'express';
import { CheckinService } from '../checkin/checkin.service.js';
import { env } from '../../config/env.js';
import { createSessionAdapter } from '../session/session.adapter.js';

const router = express.Router();

router.get('/session', async (req, res) => {
  try {
    if (env.nodeEnv === 'production') {
      return res.status(404).end();
    }

    const sessionType = req.query.type;
    if (!sessionType) {
      return res.status(400).end();
    }

    const cookieNames = {
      checkin: 'checkin_session_id',
      user: 'user_session_id',
      admin: 'admin_session_id',
    };

    const cookieName = cookieNames[sessionType];
    if (!cookieName) {
      return res.status(400).end();
    }

    const session = createSessionAdapter(cookieName);

    const data = await session.get(req);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Debug failed' });
  }
});

router.delete('/session', async (req, res) => {
  try {
    if (env.nodeEnv === 'production') {
      return res.status(404).end();
    }

    const sessionType = req.query.type;
    if (!sessionType) {
      return res.status(400).end();
    }

    const cookieNames = {
      checkin: 'checkin_session_id',
      user: 'user_session_id',
      admin: 'admin_session_id',
    };

    const cookieName = cookieNames[sessionType];
    if (!cookieName) {
      return res.status(400).end();
    }

    const session = createSessionAdapter(cookieName);

    await session.destroy(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Debug failed' });
  }
});

export default router;
