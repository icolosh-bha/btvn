import type { Request } from "express";

export interface SessionData {
  userId: number;
  username: string;
}

declare module "express" {
  interface Request {
    session?: SessionData;
  }
}

const COOKIE_NAME = "session";
const COOKIE_SECRET = process.env["SESSION_SECRET"] || "shopping-secret";

export function signData(data: string): string {
  const buf = Buffer.from(`${data}.${COOKIE_SECRET}`);
  return Buffer.from(buf.toString("base64")).toString("base64url");
}

export function setSession(res: import("express").Response, data: SessionData): void {
  const payload = JSON.stringify(data);
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = signData(encoded);
  res.cookie(COOKIE_NAME, `${encoded}.${sig}`, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearSession(res: import("express").Response): void {
  res.clearCookie(COOKIE_NAME);
}

export function getSession(req: Request): SessionData | null {
  const raw = req.cookies?.[COOKIE_NAME];
  if (!raw || typeof raw !== "string") return null;
  const parts = raw.split(".");
  if (parts.length < 2) return null;
  const sig = parts.pop()!;
  const encoded = parts.join(".");
  const expectedSig = signData(encoded);
  if (sig !== expectedSig) return null;
  try {
    const payload = Buffer.from(encoded, "base64url").toString("utf8");
    return JSON.parse(payload) as SessionData;
  } catch {
    return null;
  }
}
