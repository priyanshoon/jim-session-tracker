import { Router } from "express";

import { requireAuth } from "../middleware/auth.ts";
import {
  getExercise,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../controller/exercise-controller.ts";

const exerciseRoute = Router();

exerciseRoute.get("/", requireAuth, getExercise);
exerciseRoute.get("/:id", requireAuth, getExerciseById);
exerciseRoute.post("/", createExercise);
exerciseRoute.put("/:id", updateExercise);
exerciseRoute.delete("/:id", deleteExercise);

export default exerciseRoute;
