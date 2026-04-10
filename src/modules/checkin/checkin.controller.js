import { CheckinService } from './checkin.service.js';

export const submitTicket = async (req, res, next) => {
  try {
    const service = new CheckinService({ req, res });

    const result = await service.submitTicket(req.body.ticket);

    return res.json({
      success: true,
      code: 'TICKET_VALIDATED',
      meta: result.meta,
      data: result.data || {},
    });
  } catch (err) {
    next(err);
  }
};

export const submitVerification = async (req, res, next) => {
  try {
    const service = new CheckinService({ req, res });

    const result = await service.submitVerification(req.body.verificationCode);

    return res.json({
      success: true,
      code: 'USER_VERIFIED',
      meta: result.meta,
      data: result.data || {},
    });
  } catch (err) {
    next(err);
  }
};

export const submitQrCode = async (req, res, next) => {
  try {
    const service = new CheckinService({ req, res });

    const result = await service.submitQr(req.body.qrCode);

    return res.json({
      success: true,
      code: 'QR_PROCESSED',
      meta: result.meta,
      data: result.data || {},
    });
  } catch (err) {
    next(err);
  }
};
