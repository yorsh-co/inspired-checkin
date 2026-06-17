import { createSessionAdapter } from '../session/session.adapter.js';
import { createAuthSession } from './auth.session.model.js';

export const authSession = createSessionAdapter(
  'auth_session_id',
  createAuthSession,
);
