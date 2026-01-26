import { Router } from "express";

import { requireAuth } from "../middleware/auth.ts";
import {
  getWorkoutTemplates,
  getWorkoutTemplatesById,
  getWorkoutExercise,
} from "../controller/templates-controller.ts";

const templateRoute = Router();

templateRoute.get("/", requireAuth, getWorkoutTemplates);
templateRoute.get("/:id", requireAuth, getWorkoutTemplatesById);
templateRoute.get("/:id/exercises", requireAuth, getWorkoutExercise);

export default templateRoute;
