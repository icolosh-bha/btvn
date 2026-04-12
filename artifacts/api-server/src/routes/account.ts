import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/account", async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session!.userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    username: user.username,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
    phone: user.phone ?? undefined,
    age: user.age ?? undefined,
  });
});

router.put("/account", async (req, res) => {
  const { name, email, phone, age } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    age?: number;
  };

  await db
    .update(usersTable)
    .set({ name: name ?? null, email: email ?? null, phone: phone ?? null, age: age ?? null })
    .where(eq(usersTable.id, req.session!.userId));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session!.userId)).limit(1);
  res.json({
    id: user!.id,
    username: user!.username,
    name: user!.name ?? undefined,
    email: user!.email ?? undefined,
    phone: user!.phone ?? undefined,
    age: user!.age ?? undefined,
  });
});

export default router;
