import type { Request, Response, NextFunction } from "express";
import WorkoutDatabaseService from "../database/workout-dbservice.ts";

const db = new WorkoutDatabaseService();

export async function getExerciseById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const exercise = db.getExerciseById(+id);
    res.status(200).json({
      data: exercise,
    });
  } catch (error) {
    next(error);
  }
}

export async function getExercise(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const exercise = db.getExercise();
    res.status(200).json({
      data: exercise,
    });
  } catch (error) {
    next(error);
  }
}
