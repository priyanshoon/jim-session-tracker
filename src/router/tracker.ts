import { Router } from "express";
import type { Request, Response } from "express";

const tracker = Router();

tracker.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

tracker.post("/push", (req: Request, res: Response) => {
  console.log("something is cooking!");
});

export default tracker;
