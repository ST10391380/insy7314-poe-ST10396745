import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { loginRules, registerRules } from "../middleware/validate.js";

const router = Router();
const ALLOW_REGISTER = process.env.ALLOW_REGISTER === "true";

// registration is disabled unless ALLOW_REGISTER=true
if (ALLOW_REGISTER) {
  router.post("/register", registerRules, async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
    const passwordHash = await bcrypt.hash(password, rounds);
    await User.create({ username, passwordHash, role: "EMPLOYEE" });
    res.status(201).json({ ok: true });
  });
} else {
  router.post("/register", (_req: Request, res: Response) =>
    res.status(403).json({ error: "Registration disabled" })
  );
}

router.post("/login", loginRules, async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { sub: user._id.toString(), username: user.username, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" }
  );
  res.json({ token, role: user.role });
});

export default router;
