import { Router } from "express";

import { requireAuth } from "../middleware/auth.ts";
import {
  getExercise,
  getExerciseById,
} from "../controller/exercise-controller.ts";

const exerciseRoute = Router();

exerciseRoute.get("/", requireAuth, getExercise);
exerciseRoute.get("/:id", requireAuth, getExerciseById);
// exerciseRoute.post("/", requireAuth);

export default exerciseRoute;
