import { hashUA } from "../../shared/utils/hash.js";

export const createCheckinSession = (req) => ({
  type: 'checkin',

  version: 1,
  progress: { qr: false, ticket: false, verified: false },

  currentStep: 'init',
  source: 'direct',

  ticketId: null,
  eventId: null,

  phoneHash: null,
  phoneLast4Hash: null,

  userPreview: null,

  ua: hashUA(req.headers['user-agent']),
});