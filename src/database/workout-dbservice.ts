import DatabaseService from "./dbservice.ts";

import type { ExerciseDTO, WorkoutTemplateDTO } from "../dtos/exercise-dto.ts";
import type {
    WorkoutSessionDTO,
    WorkoutSessionWithSetsDTO,
    SetDTO,
    CreateWorkoutSessionDTO,
    CreateSetDTO,
    UpdateSetDTO,
    UpdateWorkoutSessionDTO
} from "../dtos/workout-dto.ts";

class WorkoutDatabaseService extends DatabaseService {
  public saveExercise(name: string): ExerciseDTO {
    const query = this.db.prepare(`
      INSERT INTO exercise (name) values (?);
    `);
    return query.run(name) as unknown as ExerciseDTO;
  }

  public getWorkoutTemplate(userId: number): WorkoutTemplateDTO[] {
    const query = this.db.prepare(`
      SELECT * FROM workout_templates
      WHERE user_id = ?
    `);

    return query.all(userId) as WorkoutTemplateDTO[];
  }

  public getWorkoutTemplatesById(id: number, userId: number): WorkoutTemplateDTO | null {
    const query = this.db.prepare(`
      SELECT * FROM workout_templates
      WHERE id = ? AND user_id = ?
    `);
    const row = query.get(id, userId);
    return (row as WorkoutTemplateDTO) ?? null;
  }

  public getWorkoutExerciseById(id: number, userId: number) {
    const query = this.db.prepare(`
      SELECT e.*
      FROM workout_template_exercises wte
      JOIN workout_templates wt ON wt.id = wte.template_id
      JOIN exercises e ON e.id = wte.exercise_id
      WHERE wte.template_id = ?
      AND wt.user_id = ?
      AND e.user_id = ?
      ORDER BY wte.position;
    `);

    return query.all(id, userId, userId);
  }

  public getExerciseById(id: number, userId: number): ExerciseDTO | null {
    const query = this.db.prepare(`
      SELECT *
      FROM exercises
      WHERE id = ? AND user_id = ?
    `);
    const row = query.get(id, userId);
    return (row as ExerciseDTO) ?? null;
  }

  public getExercise(userId: number): ExerciseDTO[] {
    const query = this.db.prepare(`
      SELECT * FROM exercises WHERE user_id = ?;
    `);
    return query.all(userId) as ExerciseDTO[];
  }

  // Workout Session Methods
  public createWorkoutSession(userId: number, data: CreateWorkoutSessionDTO): WorkoutSessionDTO {
    const query = this.db.prepare(`
      INSERT INTO workout_sessions (user_id, template_id, performed_at)
      VALUES (?, ?, COALESCE(?, datetime('now')))
    `);
    const result = query.run(userId, data.template_id || null, data.performed_at || null) as { lastInsertRowid: number };
    
    return this.getWorkoutSessionById(result.lastInsertRowid)!;
  }

  public getWorkoutSessionById(id: number): WorkoutSessionDTO | null {
    const query = this.db.prepare(`
      SELECT * FROM workout_sessions WHERE id = ?
    `);
    const row = query.get(id);
    return (row as WorkoutSessionDTO) ?? null;
  }

  public getUserWorkoutSessions(userId: number, limit = 50): WorkoutSessionDTO[] {
    const query = this.db.prepare(`
      SELECT * FROM workout_sessions 
      WHERE user_id = ? 
      ORDER BY performed_at DESC 
      LIMIT ?
    `);
    return query.all(userId, limit) as WorkoutSessionDTO[];
  }

  public deleteWorkoutSession(id: number, userId: number): boolean {
    const query = this.db.prepare(`
      DELETE FROM workout_sessions 
      WHERE id = ? AND user_id = ?
    `);
    const result = query.run(id, userId);
    return result.changes > 0;
  }

  public updateWorkoutSession(
    id: number,
    userId: number,
    data: UpdateWorkoutSessionDTO,
  ): WorkoutSessionDTO | null {
    const updates: string[] = [];
    const values: Array<number | string | null> = [];

    if (Object.prototype.hasOwnProperty.call(data, "template_id")) {
      updates.push("template_id = ?");
      values.push(data.template_id ?? null);
    }

    if (Object.prototype.hasOwnProperty.call(data, "performed_at")) {
      updates.push("performed_at = ?");
      values.push(data.performed_at ?? null);
    }

    if (updates.length === 0) {
      return this.getWorkoutSessionById(id);
    }

    const query = this.db.prepare(`
      UPDATE workout_sessions
      SET ${updates.join(", ")}
      WHERE id = ? AND user_id = ?
    `);

    query.run(...values, id, userId);
    return this.getWorkoutSessionById(id);
  }

  // Set Methods
  public createSet(sessionId: number, data: CreateSetDTO): SetDTO {
    const query = this.db.prepare(`
      INSERT INTO sets (session_id, exercise_id, set_number, reps, weight)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = query.run(sessionId, data.exercise_id, data.set_number, data.reps, data.weight) as { lastInsertRowid: number };
    
    return this.getSetById(result.lastInsertRowid)!;
  }

  public getSetById(id: number): SetDTO | null {
    const query = this.db.prepare(`
      SELECT s.*, e.name as exercise_name
      FROM sets s
      JOIN exercises e ON s.exercise_id = e.id
      WHERE s.id = ?
    `);
    const row = query.get(id);
    return (row as SetDTO) ?? null;
  }

  public getSetsBySession(sessionId: number): SetDTO[] {
    const query = this.db.prepare(`
      SELECT s.*, e.name as exercise_name
      FROM sets s
      JOIN exercises e ON s.exercise_id = e.id
      WHERE s.session_id = ?
      ORDER BY s.set_number
    `);
    return query.all(sessionId) as SetDTO[];
  }

  public updateSet(id: number, data: UpdateSetDTO): SetDTO | null {
    if (data.reps !== undefined && data.weight !== undefined) {
      const query = this.db.prepare(`
        UPDATE sets SET reps = ?, weight = ?
        WHERE id = ?
      `);
      query.run(data.reps, data.weight, id);
    } else if (data.reps !== undefined) {
      const query = this.db.prepare(`
        UPDATE sets SET reps = ?
        WHERE id = ?
      `);
      query.run(data.reps, id);
    } else if (data.weight !== undefined) {
      const query = this.db.prepare(`
        UPDATE sets SET weight = ?
        WHERE id = ?
      `);
      query.run(data.weight, id);
    } else {
      return null;
    }
    
    return this.getSetById(id);
  }

  public deleteSet(id: number): boolean {
    const query = this.db.prepare(`DELETE FROM sets WHERE id = ?`);
    const result = query.run(id);
    return result.changes > 0;
  }

  public getWorkoutSessionWithSets(sessionId: number): WorkoutSessionWithSetsDTO | null {
    const session = this.getWorkoutSessionById(sessionId);
    if (!session) return null;
    
    const sets = this.getSetsBySession(sessionId);
    
    return {
      ...session,
      sets
    };
  }

  // Exercise CRUD
  public createExercise(name: string, userId: number): ExerciseDTO {
    const query = this.db.prepare(`INSERT INTO exercises (name, user_id) VALUES (?, ?)`);
    const result = query.run(name, userId) as { lastInsertRowid: number };
    return this.getExerciseById(result.lastInsertRowid, userId)!;
  }

  public updateExercise(id: number, name: string, userId: number): ExerciseDTO | null {
    const query = this.db.prepare(`UPDATE exercises SET name = ? WHERE id = ? AND user_id = ?`);
    query.run(name, id, userId);
    return this.getExerciseById(id, userId);
  }

  public deleteExercise(id: number, userId: number): boolean {
    const query = this.db.prepare(`DELETE FROM exercises WHERE id = ? AND user_id = ?`);
    const result = query.run(id, userId);
    return result.changes > 0;
  }

  // Template CRUD
  public createWorkoutTemplate(name: string, userId: number): WorkoutTemplateDTO {
    const query = this.db.prepare(`INSERT INTO workout_templates (name, user_id) VALUES (?, ?)`);
    const result = query.run(name, userId) as { lastInsertRowid: number };
    const newTemplate = this.getWorkoutTemplatesById(result.lastInsertRowid, userId);
    return newTemplate!;
  }

  public updateWorkoutTemplate(id: number, name: string, userId: number): WorkoutTemplateDTO | null {
    const query = this.db.prepare(`UPDATE workout_templates SET name = ? WHERE id = ? AND user_id = ?`);
    query.run(name, id, userId);
    return this.getWorkoutTemplatesById(id, userId);
  }

  public deleteWorkoutTemplate(id: number, userId: number): boolean {
    // First delete template exercises
    const deleteExercises = this.db.prepare(`
      DELETE FROM workout_template_exercises
      WHERE template_id = ?
      AND EXISTS (
        SELECT 1 FROM workout_templates wt
        WHERE wt.id = ? AND wt.user_id = ?
      )
    `);
    deleteExercises.run(id, id, userId);
    
    // Then delete template
    const query = this.db.prepare(`DELETE FROM workout_templates WHERE id = ? AND user_id = ?`);
    const result = query.run(id, userId);
    return result.changes > 0;
  }

  public addExerciseToTemplate(templateId: number, exerciseId: number, position: number, userId: number): void {
    const query = this.db.prepare(`
      INSERT INTO workout_template_exercises (template_id, exercise_id, position)
      SELECT ?, ?, ?
      WHERE EXISTS (
        SELECT 1
        FROM workout_templates wt
        WHERE wt.id = ? AND wt.user_id = ?
      )
      AND EXISTS (
        SELECT 1
        FROM exercises e
        WHERE e.id = ? AND e.user_id = ?
      )
    `);
    query.run(templateId, exerciseId, position, templateId, userId, exerciseId, userId);
  }

  public removeExerciseFromTemplate(templateId: number, exerciseId: number, userId: number): boolean {
    const query = this.db.prepare(`
      DELETE FROM workout_template_exercises 
      WHERE template_id = ? AND exercise_id = ?
      AND EXISTS (
        SELECT 1 FROM workout_templates wt
        WHERE wt.id = ? AND wt.user_id = ?
      )
    `);
    const result = query.run(templateId, exerciseId, templateId, userId);
    return result.changes > 0;
  }

  public updateExercisePosition(templateId: number, exerciseId: number, position: number): boolean {
    const query = this.db.prepare(`
      UPDATE workout_template_exercises 
      SET position = ? 
      WHERE template_id = ? AND exercise_id = ?
    `);
    const result = query.run(position, templateId, exerciseId);
    return result.changes > 0;
  }
}

export type {
  WorkoutSessionDTO,
  WorkoutSessionWithSetsDTO,
  SetDTO,
  CreateWorkoutSessionDTO,
  CreateSetDTO,
  UpdateSetDTO,
  UpdateWorkoutSessionDTO
};

export default WorkoutDatabaseService;
