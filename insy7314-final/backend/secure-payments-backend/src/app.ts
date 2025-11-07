import "./db/mongoose";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

import authRoutes from "./auth/auth.routes";
import paymentRoutes from "./payments/payments.routes";

const app = express();

app.use(helmet({
  frameguard: { action: "deny" },
  noSniff: true,
  // note: xssFilter is legacy, helmet removes it, modern browsers handle XSS with CSP
  // you can add a CSP here if you want to go extra
  hsts: { maxAge: 15552000, includeSubDomains: true, preload: false }
}));

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "200kb" }));

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, try again later" }
});
const loginSlowdown = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 3,
  delayMs: () => 500,
  validate: { delayMs: false }
});

app.use("/auth", loginLimiter, loginSlowdown, authRoutes);
app.use("/payments", paymentRoutes);

export default app;

