import helmet from 'helmet';
import { env } from '../config/env.js';
import type { Express } from 'express';

export function applySecurity(app: Express) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://apis.google.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],   
          objectSrc: ["'none'"],        // block all plugins/objects
          upgradeInsecureRequests: []   // auto-upgrade http -> https
        }
      },
      referrerPolicy: { policy: 'no-referrer' },
      frameguard: { action: 'deny' }
    })
  );

  // HSTS only when not in development
  if (env.nodeEnv !== 'development') {
    app.use(
      helmet.hsts({
        maxAge: env.hstsMaxAge,
        includeSubDomains: true,
        preload: false
      })
    );
  }
}
