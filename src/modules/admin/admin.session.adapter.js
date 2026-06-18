import { createSessionAdapter } from '../session/session.adapter.js';
import { createAdminSession } from './admin.session.model.js';

export const adminSession = createSessionAdapter(
  'admin_session_id',
  createAdminSession,
);
