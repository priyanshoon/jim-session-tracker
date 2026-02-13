import type { Request, Response } from "express";
import WorkoutDatabaseService from "../database/workout-dbservice.ts";
import { requireAuth } from "../middleware/auth.ts";
import type {
  CreateWorkoutSessionDTO,
  UpdateWorkoutSessionDTO,
} from "../database/workout-dbservice.ts";

const workoutDb = new WorkoutDatabaseService();

export const createWorkoutSession = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const { template_id, performed_at }: CreateWorkoutSessionDTO = req.body;

      let normalizedTemplateId: number | undefined;
      if (template_id !== undefined && template_id !== null) {
        const parsedTemplateId = Number(template_id);
        if (!Number.isInteger(parsedTemplateId) || parsedTemplateId <= 0) {
          return res.status(400).json({
            success: false,
            message: "template_id must be a positive integer"
          });
        }
        normalizedTemplateId = parsedTemplateId;
      }

      if (performed_at !== undefined && performed_at !== null) {
        const parsedDate = Date.parse(performed_at);
        if (Number.isNaN(parsedDate)) {
          return res.status(400).json({
            success: false,
            message: "performed_at must be a valid date"
          });
        }
      }

      if (normalizedTemplateId) {
        const template = workoutDb.getWorkoutTemplatesById(normalizedTemplateId, userId);
        if (!template) {
          return res.status(400).json({
            success: false,
            message: "Template not found"
          });
        }
      }

      const newSession = workoutDb.createWorkoutSession(userId, {
        template_id: normalizedTemplateId,
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
      const rawLimit = req.query.limit as string | undefined;
      let limit = 50;

      if (rawLimit !== undefined) {
        const parsedLimit = Number.parseInt(rawLimit, 10);
        if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
          return res.status(400).json({
            success: false,
            message: "limit must be a positive integer"
          });
        }
        limit = Math.min(parsedLimit, 200);
      }

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
      const sessionId = Number(req.params.id);

      if (!Number.isInteger(sessionId) || sessionId <= 0) {
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
      const sessionId = Number(req.params.id);

      if (!Number.isInteger(sessionId) || sessionId <= 0) {
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

export const updateWorkoutSession = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const sessionId = Number(req.params.id);

      if (!Number.isInteger(sessionId) || sessionId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid session ID"
        });
      }

      const existingSession = workoutDb.getWorkoutSessionById(sessionId);
      if (!existingSession || existingSession.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: "Workout session not found or access denied"
        });
      }

      const payload = req.body as UpdateWorkoutSessionDTO;
      const updateData: UpdateWorkoutSessionDTO = {};

      if (Object.prototype.hasOwnProperty.call(payload, "template_id")) {
        const incomingTemplateId = payload.template_id;

        if (incomingTemplateId === null) {
          updateData.template_id = null;
        } else {
          const parsedTemplateId = Number(incomingTemplateId);
          if (!Number.isInteger(parsedTemplateId) || parsedTemplateId <= 0) {
            return res.status(400).json({
              success: false,
              message: "template_id must be a positive integer or null"
            });
          }

          const template = workoutDb.getWorkoutTemplatesById(parsedTemplateId, userId);
          if (!template) {
            return res.status(400).json({
              success: false,
              message: "Template not found"
            });
          }

          updateData.template_id = parsedTemplateId;
        }
      }

      if (Object.prototype.hasOwnProperty.call(payload, "performed_at")) {
        if (!payload.performed_at || Number.isNaN(Date.parse(payload.performed_at))) {
          return res.status(400).json({
            success: false,
            message: "performed_at must be a valid date"
          });
        }

        updateData.performed_at = payload.performed_at;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields to update"
        });
      }

      const updatedSession = workoutDb.updateWorkoutSession(sessionId, userId, updateData);

      if (!updatedSession || updatedSession.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: "Workout session not found or access denied"
        });
      }

      res.json({
        success: true,
        data: updatedSession
      });
    } catch (error) {
      console.error("Error updating workout session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update workout session"
      });
    }
  }
];

export const deleteWorkoutSession = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId!;
      const sessionId = Number(req.params.id);

      if (!Number.isInteger(sessionId) || sessionId <= 0) {
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
