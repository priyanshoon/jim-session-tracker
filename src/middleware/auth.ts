import type { Request, Response, NextFunction } from "express";
import "../types/express-session.d.ts"
import UserDatabaseService from "../database/user-dbservice.ts";

const userDb = new UserDatabaseService();

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "not authenticated" });
  }

  const user = userDb.readUserInfo(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ message: "invalid session, please login again" });
  }

  next();
}
