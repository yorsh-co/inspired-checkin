import express from 'express';
import * as controller from './checkin.controller.js';

const router = express.Router();

router.post('/ticket', controller.validateTicket);
router.post('/verification', controller.verifyUser);
router.post('/qr', controller.processQrCode);

export default router;
