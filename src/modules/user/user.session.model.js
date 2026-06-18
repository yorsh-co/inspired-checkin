import { hashUA } from '../../shared/utils/hash.js';

export const createUserSession = (req) => ({
  type: 'user',

  version: 1,
  progress: { qr: true, ticket: true, verified: true },

  //currentStep: 'init',
  //source: 'direct',

  ticketId: null,
  eventId: null,

  //phoneHash: null,
  //phoneLast4Hash: null,

  //userPreview: null,

  ua: hashUA(req.headers['user-agent']),
});
