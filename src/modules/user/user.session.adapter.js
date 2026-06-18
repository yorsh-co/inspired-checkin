import { createSessionAdapter } from '../session/session.adapter.js';
import { createUserSession } from './user.session.model.js';

export const userSession = createSessionAdapter(
  'user_session_id',
  createUserSession,
);
