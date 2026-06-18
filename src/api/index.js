import express from 'express';

import checkinRoutes from '../modules/checkin/checkin.routes.js';

const router = express.Router();

// feature modules
router.use('/checkin', checkinRoutes);

export default router;
