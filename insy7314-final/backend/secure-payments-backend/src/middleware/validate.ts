import { Request, Response, NextFunction } from "express";

export const patterns = {
  username: /^[a-zA-Z0-9_.-]{3,32}$/,
  password: /^.{8,128}$/,
  accountNumber: /^[0-9]{6,18}$/,
  amount: /^(?:\d{1,9})(?:\.\d{1,2})?$/,
  currency: /^(USD|EUR|GBP|ZAR|JPY|AUD|CAD)$/,
  swift: /^[A-Z0-9]{8}(?:[A-Z0-9]{3})?$/
};

export function requireMatch(field: string, re: RegExp) {
  return (req: Request, res: Response, next: NextFunction) => {
    const v = (req.body?.[field] ?? req.query?.[field] ?? "") as string;
    if (typeof v !== "string" || !re.test(v)) {
      return res.status(400).json({ error: `Invalid ${field}` });
    }
    next();
  };
}

export function requireStrongPassword(field = "password") {
  return (req: Request, res: Response, next: NextFunction) => {
    const v = String(req.body?.[field] ?? "");
    const strong = /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v) && v.length >= 10;
    if (!strong) return res.status(400).json({ error: "Password does not meet strength policy" });
    next();
  };
}

/* what auth.routes.ts expects */
export const loginRules = [
  requireMatch("username", patterns.username),
  requireMatch("password", patterns.password)
];

export const registerRules = [
  requireMatch("username", patterns.username),
  requireStrongPassword("password")
];
