import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export function handleValidation(req: Request, res: Response, next: NextFunction) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array().map(e => ({ field: e.param, msg: 'Invalid value' })) });
  }
  next();
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
}
