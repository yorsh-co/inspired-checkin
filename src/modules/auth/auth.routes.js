const express = require('express');
const controller = require('./auth.controller.js');

const router = express.Router();

router.get('/start', controller.start);
router.get('/scan', controller.scan);
router.post('/validate-ticket', controller.validateTicket);

export default router;
