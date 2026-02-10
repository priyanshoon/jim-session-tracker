import type { Request, Response, NextFunction } from "express";
import "../types/express-session.d.ts"

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "not authenticated" });
  }
  next();
}
