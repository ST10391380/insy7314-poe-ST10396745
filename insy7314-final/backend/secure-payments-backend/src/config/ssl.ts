import fs from 'fs';
import { env } from './env.js';

export function loadSsl() {
  const key = fs.readFileSync(env.sslKeyPath);
  const cert = fs.readFileSync(env.sslCertPath);
  return { key, cert };
}
