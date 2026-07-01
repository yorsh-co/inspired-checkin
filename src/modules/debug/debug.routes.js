import express from 'express';

import { createSessionAdapter } from '../session/session.adapter.js';
import { env } from '../../config/env.js';
import {
  NotFoundError,
  ValidationError,
} from '../../shared/errors/app-error.js';

const router = express.Router();

const COOKIE_NAMES = {
  checkin: 'checkin_session_id',
  user: 'user_session_id',
  admin: 'admin_session_id',
};

/**
 * @param {import('express').Request} req
 * @returns {string}
 */
const resolveCookieName = (req) => {
  if (env.nodeEnv === 'production') {
    throw new NotFoundError();
  }

  const cookieName = COOKIE_NAMES[req.query.type];
  if (!cookieName) {
    throw new ValidationError('Invalid or missing session type');
  }

  return cookieName;
};

router.get('/session', async (req, res, next) => {
  try {
    const cookieName = resolveCookieName(req);

    const session = createSessionAdapter(cookieName);

    const data = await session.get(req);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/session', async (req, res) => {
  try {
    const cookieName = resolveCookieName(req);

    const session = createSessionAdapter(cookieName);

    await session.destroy(req, res);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
