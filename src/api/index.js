import express from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import checkinRoutes from '../modules/checkin/checkin.routes.js';

const router = express.Router();

// feature modules
router.use('/auth', authRoutes);
router.use('/checkin', checkinRoutes);

export default router;
