import express from 'express';

import { requireWebAuth } from '../../middleware/auth.middleware.js';
import { CheckinService } from '../../modules/checkin/checkin.service.js';
import { env } from '../../config/env.js';

const router = express.Router();

// privacy and terms
router.get('/terms', (_req, res) => {
  res.redirect('https://yorsh.co/privacy');
});
router.get('/privacy', (_req, res) => {
  res.redirect('https://yorsh.co/terms');
});

// checkin
// FIXME: on error, set initial step to ticket with a new session
// FIXME: check for an auth session cookie, just in case
// a verified user accidentally access /checkin
// OR, use the database flag when verifying the ticket TODO:
router.get('/checkin', async (req, res, next) => {
  try {
    const service = new CheckinService({ req, res });

    const result = await service.init({
      qrToken: req.query.k,
      ticketToken: req.query.t,
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
});

// app
router.get('/', requireWebAuth, (req, res) => {
  try {
    res.render('pages/app', {
      title: env.appTitle,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
