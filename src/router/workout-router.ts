import { Router } from "express";
import {
  createWorkoutSession,
  getWorkoutSessions,
  getWorkoutSession,
  getWorkoutSessionWithSets,
  updateWorkoutSession,
  deleteWorkoutSession,
} from "../controller/workout-session-controller.ts";

const workoutRouter = Router();

workoutRouter.post("/", createWorkoutSession);
workoutRouter.get("/", getWorkoutSessions);
workoutRouter.get("/:id", getWorkoutSession);
workoutRouter.get("/:id/sets", getWorkoutSessionWithSets);
workoutRouter.put("/:id", updateWorkoutSession);
workoutRouter.delete("/:id", deleteWorkoutSession);

export default workoutRouter;
