import express from 'express';

import * as controller from './checkin.controller.js';

import { checkinSessionLimiter } from '../../middleware/rate.middleware.js';
import { requireCaptchaIfFlagged } from '../../middleware/captcha.middleware.js';
import {
  requireRole,
  resolveSessions,
} from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(checkinSessionLimiter);

router.post('/ticket', requireCaptchaIfFlagged, controller.submitTicket);
router.post('/qr', controller.submitQrCode);

router.use(resolveSessions);
router.use(requireRole('checkin'));

router.post('/verification', controller.submitVerification);
router.post('/reset', controller.reset);

export default router;
