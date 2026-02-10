import { Router } from "express";
import {
  createSet,
  getSets,
  updateSet,
  deleteSet,
} from "../controller/sets-controller.ts";

const setsRouter = Router();

setsRouter.post("/:sessionId/sets", createSet);
setsRouter.get("/:sessionId/sets", getSets);
setsRouter.put("/:setId", updateSet);
setsRouter.delete("/:setId", deleteSet);

export default setsRouter;