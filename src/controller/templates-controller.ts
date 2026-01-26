import type { Request, Response, NextFunction } from "express";
import WorkoutDatabaseService from "../database/workout-dbservice.ts";

const db = new WorkoutDatabaseService();

export async function getWorkoutExercise(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id;

    const workoutExercise = db.getWorkoutExerciseById(+id as number);

    if (workoutExercise === null) {
      return res.status(404).json({ message: "exercise not found" });
    }

    return res.status(200).json({ data: workoutExercise });
  } catch (error) {
    next(error);
  }
}

export async function getWorkoutTemplatesById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id;

    const workoutTemplates = db.getWorkoutTemplatesById(+id as number);

    if (workoutTemplates === null) {
      return res.status(404).json({ message: "template not found" });
    }

    res.status(200).json({
      data: workoutTemplates,
    });
  } catch (error) {
    next(error);
  }
}

export async function getWorkoutTemplates(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const workoutTemplates = db.getWorkoutTemplate();
    res.status(200).json({ data: workoutTemplates });
  } catch (error) {
    next(error);
  }
}
