const express = require('express');
const controller = require('../controllers/authController');

const router = express.Router();

router.get('/start', controller.start);
router.get('/scan', controller.scan);
router.post('/validate-ticket', controller.validateTicket);

module.exports = router;