import type { Request, Response, NextFunction } from "express";
import WorkoutDatabaseService from "../database/workout-dbservice.ts";
import { requireAuth } from "../middleware/auth.ts";

const db = new WorkoutDatabaseService();

export async function getWorkoutExercise(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id;
    const userId = req.session.userId as number;
    const templateId = parseInt(id as string);

    if (isNaN(templateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid template ID"
      });
    }

    const workoutExercise = db.getWorkoutExerciseById(templateId, userId);

    if (workoutExercise === null || workoutExercise.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "template or exercises not found" 
      });
    }

    return res.status(200).json({ 
      success: true,
      data: workoutExercise 
    });
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
    const userId = req.session.userId as number;
    const templateId = parseInt(id as string);

    if (isNaN(templateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid template ID"
      });
    }

    const workoutTemplates = db.getWorkoutTemplatesById(templateId, userId);

    if (workoutTemplates === null) {
      return res.status(404).json({ 
        success: false,
        message: "template not found" 
      });
    }

    res.status(200).json({
      success: true,
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
    const userId = req.session.userId as number;
    const workoutTemplates = db.getWorkoutTemplate(userId);
    res.status(200).json({ 
      success: true,
      data: workoutTemplates 
    });
  } catch (error) {
    next(error);
  }
}

export const createWorkoutTemplate = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Template name is required and must be a non-empty string"
        });
      }

      const trimmedName = name.trim();

      // Check if template already exists
      const existingTemplate = db.getWorkoutTemplate(userId).find(template => 
        template.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingTemplate) {
        return res.status(409).json({
          success: false,
          message: "Template with this name already exists"
        });
      }

      const newTemplate = db.createWorkoutTemplate(trimmedName, userId);

      res.status(201).json({
        success: true,
        data: newTemplate
      });
    } catch (error) {
      console.error('Error creating workout template:', error);
      res.status(500).json({
        success: false,
        message: "Failed to create workout template"
      });
    }
  }
];

export const updateWorkoutTemplate = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { id } = req.params;
      const { name } = req.body;
      const templateId = parseInt(id as string);

      if (isNaN(templateId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID"
        });
      }

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Template name is required and must be a non-empty string"
        });
      }

      const trimmedName = name.trim();

      // Check if template exists
      const existingTemplate = db.getWorkoutTemplatesById(templateId, userId);
      if (!existingTemplate) {
        return res.status(404).json({
          success: false,
          message: "Template not found"
        });
      }

      // Check if another template with this name already exists
      const duplicateTemplate = db.getWorkoutTemplate(userId).find(template => 
        template.id !== templateId && template.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (duplicateTemplate) {
        return res.status(409).json({
          success: false,
          message: "Another template with this name already exists"
        });
      }

      const updatedTemplate = db.updateWorkoutTemplate(templateId, trimmedName, userId);

      res.json({
        success: true,
        data: updatedTemplate
      });
    } catch (error) {
      console.error('Error updating workout template:', error);
      res.status(500).json({
        success: false,
        message: "Failed to update workout template"
      });
    }
  }
];

export const deleteWorkoutTemplate = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { id } = req.params;
      const templateId = parseInt(id as string);

      if (isNaN(templateId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID"
        });
      }

      // Check if template exists
      const existingTemplate = db.getWorkoutTemplatesById(templateId, userId);
      if (!existingTemplate) {
        return res.status(404).json({
          success: false,
          message: "Template not found"
        });
      }

      const deleted = db.deleteWorkoutTemplate(templateId, userId);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete template"
        });
      }

      res.json({
        success: true,
        message: "Template deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting workout template:', error);
      res.status(500).json({
        success: false,
        message: "Failed to delete workout template"
      });
    }
  }
];

export const addExerciseToTemplate = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { id } = req.params;
      const { exercise_id, position } = req.body;
      const templateId = parseInt(id as string);

      if (isNaN(templateId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID"
        });
      }

      if (!exercise_id || !position) {
        return res.status(400).json({
          success: false,
          message: "exercise_id and position are required"
        });
      }

      const exerciseId = parseInt(exercise_id);
      const exercisePosition = parseInt(position);

      if (isNaN(exerciseId) || isNaN(exercisePosition)) {
        return res.status(400).json({
          success: false,
          message: "exercise_id and position must be numbers"
        });
      }

      // Check if template exists
      const template = db.getWorkoutTemplatesById(templateId, userId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found"
        });
      }

      // Check if exercise exists
      const exercise = db.getExerciseById(exerciseId, userId);
      if (!exercise) {
        return res.status(404).json({
          success: false,
          message: "Exercise not found"
        });
      }

      db.addExerciseToTemplate(templateId, exerciseId, exercisePosition, userId);

      res.status(201).json({
        success: true,
        message: "Exercise added to template successfully"
      });
    } catch (error) {
      console.error('Error adding exercise to template:', error);
      res.status(500).json({
        success: false,
        message: "Failed to add exercise to template"
      });
    }
  }
];

export const removeExerciseFromTemplate = [
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { id, exerciseId } = req.params;
      const templateId = parseInt(id as string);
      const exId = parseInt(exerciseId as string);

      if (isNaN(templateId) || isNaN(exId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID or exercise ID"
        });
      }

      // Check if template exists
      const template = db.getWorkoutTemplatesById(templateId, userId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found"
        });
      }

      const removed = db.removeExerciseFromTemplate(templateId, exId, userId);

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: "Exercise not found in template"
        });
      }

      res.json({
        success: true,
        message: "Exercise removed from template successfully"
      });
    } catch (error) {
      console.error('Error removing exercise from template:', error);
      res.status(500).json({
        success: false,
        message: "Failed to remove exercise from template"
      });
    }
  }
];
