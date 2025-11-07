import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { config } from "dotenv";
config();

import "./db/mongoose";

async function getUserModel() {
  const mod: any = await import("./models/User.js").catch(async () => await import("./models/User"));
  return mod.default ?? mod.User ?? mod.user ?? mod.UserModel ?? mod.model ?? mod.userModel;
}

async function run() {
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  const users = [
    { username: "employee1", role: "EMPLOYEE", password: "P@ssw0rd!123" },
    { username: "auditor",   role: "EMPLOYEE", password: "P@ssw0rd!123" }
  ];

  const User = await getUserModel();
  if (!User) throw new Error("Could not resolve User model export from ./models/User");

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, rounds);
    await User.updateOne(
      { username: u.username },
      { $set: { username: u.username, role: u.role, passwordHash: hash } },
      { upsert: true }
    );
  }
  console.log("Seeded users:", users.map(u => u.username).join(", "));
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
