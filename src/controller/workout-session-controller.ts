import type { Request, Response } from "express";
import WorkoutDatabaseService from "../database/workout-dbservice.ts";
import { requireAuth } from "../middleware/auth.ts";
import type { CreateWorkoutSessionDTO } from "../database/workout-dbservice.ts";

const workoutDb = new WorkoutDatabaseService();

export const createWorkoutSession = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const { template_id, performed_at }: CreateWorkoutSessionDTO = req.body;

      const newSession = workoutDb.createWorkoutSession(userId, {
        template_id,
        performed_at
      });

      res.status(201).json({
        success: true,
        data: newSession
      });
    } catch (error) {
      console.error('Error creating workout session:', error);
      res.status(500).json({
        success: false,
        message: "Failed to create workout session"
      });
    }
  }
];

export const getWorkoutSessions = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const limit = parseInt(req.query.limit as string) || 50;

      const sessions = workoutDb.getUserWorkoutSessions(userId, limit);

      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('Error fetching workout sessions:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch workout sessions"
      });
    }
  }
];

export const getWorkoutSession = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const sessionId = parseInt(req.params.id as string);

      if (isNaN(sessionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid session ID"
        });
      }

      const session = workoutDb.getWorkoutSessionById(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Workout session not found"
        });
      }

      // Verify user owns this session
      if (session.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Error fetching workout session:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch workout session"
      });
    }
  }
];

export const getWorkoutSessionWithSets = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const sessionId = parseInt(req.params.id as string);

      if (isNaN(sessionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid session ID"
        });
      }

      const session = workoutDb.getWorkoutSessionWithSets(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Workout session not found"
        });
      }

      // Verify user owns this session
      if (session.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Error fetching workout session with sets:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch workout session"
      });
    }
  }
];

export const deleteWorkoutSession = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const sessionId = parseInt(req.params.id as string);

      if (isNaN(sessionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid session ID"
        });
      }

      const deleted = workoutDb.deleteWorkoutSession(sessionId, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Workout session not found or access denied"
        });
      }

      res.json({
        success: true,
        message: "Workout session deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting workout session:', error);
      res.status(500).json({
        success: false,
        message: "Failed to delete workout session"
      });
    }
  }
];