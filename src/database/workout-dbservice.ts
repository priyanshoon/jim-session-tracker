import DatabaseService from "./dbservice.ts";

import type { ExerciseDTO, WorkoutTemplateDTO } from "../dtos/exercise-dto.ts";

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

    return query.all();
  }

  public getWorkoutTemplatesById(id: number) {
    const query = this.db.prepare(`
      SELECT * FROM workout_templates
      WHERE id = ?
    `);
    const row = query.get(id);
    return row ?? null;
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
    return row ?? null;
  }

  public getExercise(): ExerciseDTO[] {
    const query = this.db.prepare(`
      SELECT * FROM exercises;
    `);
    return query.all();
  }
}

export default WorkoutDatabaseService;
