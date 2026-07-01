import { env } from '../config/env.js';
import { TurnstileValidator } from '../modules/captcha/captcha.service.js';
import { clearCaptchaRequirement } from '../modules/checkin/checkin.attempts.js';
import { checkinSession } from '../modules/checkin/checkin.session.adapter.js';
import { CaptchaRequiredError } from '../shared/errors/app-error.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const requireCaptchaIfFlagged = async (req, res, next) => {
  try {
    const existing = await checkinSession.get(req);

    if (!existing) return next();

    const { sessionId, session } = existing;

    if (!session.captchaRequired) return next();

    const captcha = new TurnstileValidator(env.captcha.secret);

    const result = await captcha.validate(req.body?.captchaToken, {
      remoteIp: req.ip,
    });

    if (!result.success) {
      console.error('Required captcha invalid:', result);

      return next(new CaptchaRequiredError());
    }

    await checkinSession.persist(sessionId, clearCaptchaRequirement(session));

    next();
  } catch (err) {
    next(err);
  }
};
