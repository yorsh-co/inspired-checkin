import express from 'express';

import checkinRoutes from '../modules/checkin/checkin.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import debugRoutes from '../modules/debug/debug.routes.js';

import { requireRole, resolveSessions } from '../middleware/auth.middleware.js';
import {
  adminSessionLimiter,
  ipLimiter,
  userSessionLimiter,
} from '../middleware/rate.middleware.js';

/** @import { SessionType } from '../../types/session.js' */

const router = express.Router();

router.use(ipLimiter);

router.use('/checkin', checkinRoutes);

router.use(resolveSessions);

router.use('/debug', requireRole('admin'), debugRoutes);

router.use('/admin', requireRole('admin'), adminSessionLimiter, adminRoutes);
router.use('/', requireRole('user'), userSessionLimiter, userRoutes);

export default router;
