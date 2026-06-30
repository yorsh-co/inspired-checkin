import express from 'express';

import { env } from '../../config/env.js';

import {
  resolveSessions,
  requireWebAuth,
  requireNoSession,
} from '../../middleware/auth.middleware.js';
import {
  checkinEntryIpLimiter,
  ipLimiter,
  webLimiter,
} from '../../middleware/rate.middleware.js';

import {
  CheckinService,
  CheckinEntryRateLimitError,
} from '../../modules/checkin/checkin.service.js';

const router = express.Router();

router.use(webLimiter);

// privacy and terms
router.get('/terms', (_req, res) => {
  res.redirect('https://yorsh.co/terms');
});
router.get('/privacy', (_req, res) => {
  res.redirect('https://yorsh.co/privacy');
});

// load sessions
router.use(resolveSessions);

// checkin
router.get(
  '/checkin',
  checkinEntryIpLimiter,
  requireNoSession('user', '/'),
  async (req, res, next) => {
    try {
      const service = new CheckinService({ req, res });

      const result = await service.init({
        qrToken: req.query.k,
        ticketCode: req.query.t,
      });

      res.render('pages/user/checkin', {
        title: `Check-in | ${env.appTitle}`,

        turnstileSiteKey: env.captcha.siteKey,

        initialData: {
          ...result,
        },
      });
    } catch (err) {
      if (err instanceof CheckinEntryRateLimitError) {
        if (err.retryAfterSeconds) {
          res.set('Retry-After', String(err.retryAfterSeconds));
        }
        return res
          .status(429)
          .send('Too many requests. Please try again shortly.');
      }
      next(err);
    }
  },
);

// admin
router.get('/admin/login', (req, res, next) => {
  try {
    res.render('pages/admin/login', { title: 'Admin Login' });
  } catch (err) {
    next(err);
  }
});

router.get(
  '/admin',
  requireWebAuth('admin', '/admin/login'),
  (req, res, next) => {
    try {
      res.render('pages/admin/dashboard', { title: 'Admin' });
    } catch (err) {
      next(err);
    }
  },
);

// app
router.get('/', requireWebAuth('user', '/checkin'), (req, res, next) => {
  try {
    res.render('pages/user/dashboard', {
      title: env.appTitle,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
