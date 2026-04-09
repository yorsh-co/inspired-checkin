import express from 'express';

import { requireWebAuth } from '../../middleware/auth.middleware.js';

const router = express.Router();

// privacy and terms
router.get('/terms', (_req, res) => {
  res.redirect('https://yorsh.co/privacy');
});
router.get('/privacy', (_req, res) => {
  res.redirect('https://yorsh.co/terms');
});

// checkin
router.get('/checkin', (req, res) => {
  res.render('pages/user/checkin', {
    title: 'Check-in',
  });
});

// app
router.get('/', requireWebAuth, (req, res) => {
  res.render('pages/app', {
    title: 'Inspire',
  });
});

export default router;
