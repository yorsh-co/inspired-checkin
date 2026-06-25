import { createSessionAdapter } from '../session/session.adapter.js';
import { createCheckinSession } from './checkin.session.model.js';

export const checkinSession = createSessionAdapter(
  'checkin_session_id',
  createCheckinSession,
);
