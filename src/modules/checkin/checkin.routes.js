import express from 'express';

import * as controller from './checkin.controller.js';

import { checkinSessionLimiter } from '../../middleware/rate.middleware.js';
import { requireCaptchaIfFlagged } from '../../middleware/captcha.middleware.js';

const router = express.Router();

router.use(checkinSessionLimiter);

router.post('/ticket', requireCaptchaIfFlagged, controller.submitTicket);
router.post('/verification', controller.submitVerification);
router.post('/qr', controller.submitQrCode);
router.post('/reset', controller.reset);

export default router;
