import express from 'express';

import { requireWebAuth } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/checkin', (req, res) => {
  res.render('pages/user/checkin', {
    title: 'Check-in'
  });
});

router.get('/', requireWebAuth, (req, res) => {
  res.render('pages/app', {
    title: 'Inspire'
  });
});

export default router;
