import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' }
});

export const loginSlowdown = slowDown({
  validate: { delayMs: false },
  windowMs: 60 * 1000,
  delayAfter: 3,
  delayMs: () => 500
});

