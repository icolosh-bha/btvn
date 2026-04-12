import type { Request, Response, NextFunction } from "express";
import { getSession } from "../lib/session";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  req.session = session;
  next();
}
