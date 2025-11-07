import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessJwt(sub: string) {
  return jwt.sign({ sub }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}
