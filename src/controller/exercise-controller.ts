import type { Request, Response, NextFunction } from "express";
import WorkoutDatabaseService from "../database/workout-dbservice.ts";
import { requireAuth } from "../middleware/auth.ts";

const db = new WorkoutDatabaseService();

export async function getExerciseById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const userId = req.session.userId as number;
    const exercise = db.getExerciseById(+id, userId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found"
      });
    }
    res.status(200).json({
      success: true,
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
    const userId = req.session.userId as number;
    const exercise = db.getExercise(userId);
    res.status(200).json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    next(error);
  }
}

export const createExercise = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Exercise name is required and must be a non-empty string"
        });
      }

      const trimmedName = name.trim();

      // Check if exercise already exists
      const existingExercise = db.getExercise(userId).find(ex => 
        ex.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingExercise) {
        return res.status(409).json({
          success: false,
          message: "Exercise with this name already exists"
        });
      }

      const newExercise = db.createExercise(trimmedName, userId);

      res.status(201).json({
        success: true,
        data: newExercise
      });
    } catch (error) {
      console.error('Error creating exercise:', error);
      res.status(500).json({
        success: false,
        message: "Failed to create exercise"
      });
    }
  }
];

export const updateExercise = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { id } = req.params;
      const { name } = req.body;
      const exerciseId = parseInt(id as string);

      if (isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid exercise ID"
        });
      }

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Exercise name is required and must be a non-empty string"
        });
      }

      const trimmedName = name.trim();

      // Check if exercise exists
      const existingExercise = db.getExerciseById(exerciseId, userId);
      if (!existingExercise) {
        return res.status(404).json({
          success: false,
          message: "Exercise not found"
        });
      }

      // Check if another exercise with this name already exists
      const duplicateExercise = db.getExercise(userId).find(ex => 
        ex.id !== exerciseId && ex.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (duplicateExercise) {
        return res.status(409).json({
          success: false,
          message: "Another exercise with this name already exists"
        });
      }

      const updatedExercise = db.updateExercise(exerciseId, trimmedName, userId);

      res.json({
        success: true,
        data: updatedExercise
      });
    } catch (error) {
      console.error('Error updating exercise:', error);
      res.status(500).json({
        success: false,
        message: "Failed to update exercise"
      });
    }
  }
];

export const deleteExercise = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { id } = req.params;
      const exerciseId = parseInt(id as string);

      if (isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid exercise ID"
        });
      }

      // Check if exercise exists
      const existingExercise = db.getExerciseById(exerciseId, userId);
      if (!existingExercise) {
        return res.status(404).json({
          success: false,
          message: "Exercise not found"
        });
      }

      const deleted = db.deleteExercise(exerciseId, userId);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete exercise"
        });
      }

      res.json({
        success: true,
        message: "Exercise deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      res.status(500).json({
        success: false,
        message: "Failed to delete exercise"
      });
    }
  }
];
