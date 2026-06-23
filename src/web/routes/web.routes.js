import express from 'express';

import {
  resolveSessions,
  requireWebAuth,
  requireNoSession,
} from '../../middleware/auth.middleware.js';
import { CheckinService } from '../../modules/checkin/checkin.service.js';
import { env } from '../../config/env.js';

const router = express.Router();

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

        initialData: {
          ...result,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// admin
router.get('/admin/login', (req, res) => {
  res.render('pages/admin/login', { title: 'Admin Login' });
});

router.get('/admin', requireWebAuth('admin', '/admin/login'), (req, res) => {
  res.render('pages/admin/dashboard', { title: 'Admin' });
});

// app
router.get('/', requireWebAuth('user', '/checkin'), (req, res) => {
  try {
    res.render('pages/user/dashboard', {
      title: env.appTitle,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
