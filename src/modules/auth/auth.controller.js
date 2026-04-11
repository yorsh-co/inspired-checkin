import * as sessionService from '../session/session.service.js';
import * as ticketService from '../ticket/ticket.service.js';
import { issueToken } from '../auth/auth.service.js';

const attachSessionCookie = (res, sessionId) => {
  res.cookie('session_id', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  });
};
