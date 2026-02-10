import { Router } from "express";

import { requireAuth } from "../middleware/auth.ts";
import {
  getWorkoutTemplates,
  getWorkoutTemplatesById,
  getWorkoutExercise,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  addExerciseToTemplate,
  removeExerciseFromTemplate,
} from "../controller/templates-controller.ts";

const templateRoute = Router();

templateRoute.get("/", requireAuth, getWorkoutTemplates);
templateRoute.get("/:id", requireAuth, getWorkoutTemplatesById);
templateRoute.get("/:id/exercises", requireAuth, getWorkoutExercise);
templateRoute.post("/", createWorkoutTemplate);
templateRoute.put("/:id", updateWorkoutTemplate);
templateRoute.delete("/:id", deleteWorkoutTemplate);
templateRoute.post("/:id/exercises", addExerciseToTemplate);
templateRoute.delete("/:id/exercises/:exerciseId", removeExerciseFromTemplate);

export default templateRoute;
