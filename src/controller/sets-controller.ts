import type { Request, Response } from "express";
import WorkoutDatabaseService from "../database/workout-dbservice.ts";
import { requireAuth } from "../middleware/auth.ts";
import type { CreateSetDTO, UpdateSetDTO } from "../database/workout-dbservice.ts";

const workoutDb = new WorkoutDatabaseService();

export const createSet = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const sessionId = parseInt(req.params.sessionId as string);
      const { exercise_id, set_number, reps, weight }: CreateSetDTO = req.body;

      if (isNaN(sessionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid session ID"
        });
      }

      // Validate required fields
      if (!exercise_id || set_number === undefined || reps === undefined || weight === undefined) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: exercise_id, set_number, reps, weight"
        });
      }

      // Validate numbers
      if (isNaN(exercise_id) || isNaN(set_number) || isNaN(reps) || isNaN(weight)) {
        return res.status(400).json({
          success: false,
          message: "exercise_id, set_number, reps, and weight must be numbers"
        });
      }

      // Validate positive values
      if (reps <= 0 || weight < 0 || set_number <= 0) {
        return res.status(400).json({
          success: false,
          message: "reps and set_number must be positive, weight must be non-negative"
        });
      }

      // Verify user owns the session
      const session = workoutDb.getWorkoutSessionById(sessionId);
      if (!session || session.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: "Workout session not found or access denied"
        });
      }

      // Verify exercise exists
      const exercise = workoutDb.getExerciseById(exercise_id, userId);
      if (!exercise) {
        return res.status(400).json({
          success: false,
          message: "Exercise not found"
        });
      }

      if (session.template_id) {
        const templateExercises = workoutDb.getWorkoutExerciseById(session.template_id, userId) as Array<{ id: number }>;
        const isExerciseInTemplate = templateExercises.some((templateExercise) => templateExercise.id === exercise_id);

        if (!isExerciseInTemplate) {
          return res.status(400).json({
            success: false,
            message: "Exercise is not part of this session template"
          });
        }
      }

      const newSet = workoutDb.createSet(sessionId, {
        exercise_id,
        set_number,
        reps,
        weight
      });

      res.status(201).json({
        success: true,
        data: newSet
      });
    } catch (error) {
      console.error('Error creating set:', error);
      res.status(500).json({
        success: false,
        message: "Failed to create set"
      });
    }
  }
];

export const getSets = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const sessionId = parseInt(req.params.sessionId as string);

      if (isNaN(sessionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid session ID"
        });
      }

      // Verify user owns the session
      const session = workoutDb.getWorkoutSessionById(sessionId);
      if (!session || session.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: "Workout session not found or access denied"
        });
      }

      const sets = workoutDb.getSetsBySession(sessionId);

      res.json({
        success: true,
        data: sets
      });
    } catch (error) {
      console.error('Error fetching sets:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch sets"
      });
    }
  }
];

export const updateSet = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const setId = parseInt(req.params.setId as string);
      const { reps, weight }: UpdateSetDTO = req.body;

      if (isNaN(setId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid set ID"
        });
      }

      // Validate numbers if provided
      if (reps !== undefined && (isNaN(reps) || reps <= 0)) {
        return res.status(400).json({
          success: false,
          message: "reps must be a positive number"
        });
      }

      if (weight !== undefined && (isNaN(weight) || weight < 0)) {
        return res.status(400).json({
          success: false,
          message: "weight must be a non-negative number"
        });
      }

      // Get the set to verify ownership
      const set = workoutDb.getSetById(setId);
      if (!set) {
        return res.status(404).json({
          success: false,
          message: "Set not found"
        });
      }

      // Verify user owns the session this set belongs to
      const session = workoutDb.getWorkoutSessionById(set.session_id);
      if (!session || session.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      const updatedSet = workoutDb.updateSet(setId, { reps, weight });

      if (!updatedSet) {
        return res.status(400).json({
          success: false,
          message: "No valid fields to update"
        });
      }

      res.json({
        success: true,
        data: updatedSet
      });
    } catch (error) {
      console.error('Error updating set:', error);
      res.status(500).json({
        success: false,
        message: "Failed to update set"
      });
    }
  }
];

export const deleteSet = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const setId = parseInt(req.params.setId as string);

      if (isNaN(setId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid set ID"
        });
      }

      // Get the set to verify ownership
      const set = workoutDb.getSetById(setId);
      if (!set) {
        return res.status(404).json({
          success: false,
          message: "Set not found"
        });
      }

      // Verify user owns the session this set belongs to
      const session = workoutDb.getWorkoutSessionById(set.session_id);
      if (!session || session.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      const deleted = workoutDb.deleteSet(setId);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete set"
        });
      }

      res.json({
        success: true,
        message: "Set deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting set:', error);
      res.status(500).json({
        success: false,
        message: "Failed to delete set"
      });
    }
  }
];
