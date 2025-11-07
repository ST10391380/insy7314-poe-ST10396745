import { Router, Request, Response } from "express";
import Payment from "../models/Payment.js";
import { requireMatch, patterns } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// list payments for staff
router.get("/", async (_req: Request, res: Response) => {
  const items = await Payment.find().sort({ createdAt: -1 }).limit(200);
  res.json(items);
});

// helper for ObjectId format
const isObjectId = /^[a-f0-9]{24}$/i;

// verify payment
router.post("/verify/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!isObjectId.test(id)) return res.status(400).json({ error: "Invalid id" });

  const p = await Payment.findByIdAndUpdate(
    id,
    { $set: { status: "VERIFIED", verifiedAt: new Date() } },
    { new: true }
  );
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

// submit to SWIFT
router.post("/submit/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!isObjectId.test(id)) return res.status(400).json({ error: "Invalid id" });

  const p = await Payment.findByIdAndUpdate(
    id,
    { $set: { status: "SUBMITTED", submittedAt: new Date() } },
    { new: true }
  );
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

export default router;
