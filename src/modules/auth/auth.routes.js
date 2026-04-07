import express from 'express';
import * as controller from './auth.controller.js';

const router = express.Router();

router.get('/start', controller.start);
router.get('/scan', controller.scan);
router.post('/validate-ticket', controller.validateTicket);

export default router;
