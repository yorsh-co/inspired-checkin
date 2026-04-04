const express = require('express');
const controller = require('./checkin.controller.js');

const router = express.Router();

router.post('/ticket', controller.validateTicket);
router.post('/qr', controller.validateQr);

module.exports = router;
