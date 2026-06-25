import express from 'express';

import { requireRole } from '../middleware/auth.middleware.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import userRoutes from '../modules/user/user.routes.js';

/** @import { SessionType } from '../../types/session.js' */

const router = express.Router();

// feature modules
router.use('/admin', requireRole('admin'), adminRoutes);

router.use('/', requireRole('user'), userRoutes);

export default router;
