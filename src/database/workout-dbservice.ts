import DatabaseService from "./dbservice.ts";

import type { ExerciseDTO, WorkoutTemplateDTO } from "../dtos/exercise-dto.ts";
import type {
    WorkoutSessionDTO,
    WorkoutSessionWithSetsDTO,
    SetDTO,
    CreateWorkoutSessionDTO,
    CreateSetDTO,
    UpdateSetDTO
} from "../dtos/workout-dto.ts";

class WorkoutDatabaseService extends DatabaseService {
  public saveExercise(name: string): ExerciseDTO {
    const query = this.db.prepare(`
      INSERT INTO exercise (name) values (?);
    `);
    return query.run(name) as unknown as ExerciseDTO;
  }

  public getWorkoutTemplate(): WorkoutTemplateDTO[] {
    const query = this.db.prepare(`
      SELECT * FROM workout_templates
    `);

    return query.all() as WorkoutTemplateDTO[];
  }

  public getWorkoutTemplatesById(id: number): WorkoutTemplateDTO | null {
    const query = this.db.prepare(`
      SELECT * FROM workout_templates
      WHERE id = ?
    `);
    const row = query.get(id);
    return (row as WorkoutTemplateDTO) ?? null;
  }

  public getWorkoutExerciseById(id: number) {
    const query = this.db.prepare(`
      SELECT e.*
      FROM workout_template_exercises wte
      JOIN exercises e ON e.id = wte.exercise_id
      WHERE wte.template_id = ?
      ORDER BY wte.position;
    `);

    return query.all(id);
  }

  public getExerciseById(id: number): ExerciseDTO | null {
    const query = this.db.prepare(`
      SELECT *
      FROM exercises
      WHERE id = ?
    `);
    const row = query.get(id);
    return (row as ExerciseDTO) ?? null;
  }

  public getExercise(): ExerciseDTO[] {
    const query = this.db.prepare(`
      SELECT * FROM exercises;
    `);
    return query.all() as ExerciseDTO[];
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
        UPDATE sets SET reps = ?, weight = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      query.run(data.reps, data.weight, id);
    } else if (data.reps !== undefined) {
      const query = this.db.prepare(`
        UPDATE sets SET reps = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      query.run(data.reps, id);
    } else if (data.weight !== undefined) {
      const query = this.db.prepare(`
        UPDATE sets SET weight = ?, updated_at = datetime('now')
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
  public createExercise(name: string): ExerciseDTO {
    const query = this.db.prepare(`INSERT INTO exercises (name) VALUES (?)`);
    const result = query.run(name) as { lastInsertRowid: number };
    return this.getExerciseById(result.lastInsertRowid)!;
  }

  public updateExercise(id: number, name: string): ExerciseDTO | null {
    const query = this.db.prepare(`UPDATE exercises SET name = ?, updated_at = datetime('now') WHERE id = ?`);
    query.run(name, id);
    return this.getExerciseById(id);
  }

  public deleteExercise(id: number): boolean {
    const query = this.db.prepare(`DELETE FROM exercises WHERE id = ?`);
    const result = query.run(id);
    return result.changes > 0;
  }

  // Template CRUD
  public createWorkoutTemplate(name: string): WorkoutTemplateDTO {
    const query = this.db.prepare(`INSERT INTO workout_templates (name) VALUES (?)`);
    const result = query.run(name) as { lastInsertRowid: number };
    const newTemplate = this.getWorkoutTemplatesById(result.lastInsertRowid);
    return newTemplate!;
  }

  public updateWorkoutTemplate(id: number, name: string): WorkoutTemplateDTO | null {
    const query = this.db.prepare(`UPDATE workout_templates SET name = ?, updated_at = datetime('now') WHERE id = ?`);
    query.run(name, id);
    return this.getWorkoutTemplatesById(id);
  }

  public deleteWorkoutTemplate(id: number): boolean {
    // First delete template exercises
    const deleteExercises = this.db.prepare(`DELETE FROM workout_template_exercises WHERE template_id = ?`);
    deleteExercises.run(id);
    
    // Then delete template
    const query = this.db.prepare(`DELETE FROM workout_templates WHERE id = ?`);
    const result = query.run(id);
    return result.changes > 0;
  }

  public addExerciseToTemplate(templateId: number, exerciseId: number, position: number): void {
    const query = this.db.prepare(`
      INSERT INTO workout_template_exercises (template_id, exercise_id, position)
      VALUES (?, ?, ?)
    `);
    query.run(templateId, exerciseId, position);
  }

  public removeExerciseFromTemplate(templateId: number, exerciseId: number): boolean {
    const query = this.db.prepare(`
      DELETE FROM workout_template_exercises 
      WHERE template_id = ? AND exercise_id = ?
    `);
    const result = query.run(templateId, exerciseId);
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
  UpdateSetDTO
};

export default WorkoutDatabaseService;
