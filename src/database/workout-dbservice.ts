import DatabaseService from "./dbservice";

import type { ExerciseDTO } from "../dtos/exercise-dto.ts";

class WorkoutDatabaseService extends DatabaseService {
  public saveExercise(name: string): ExerciseDTO {
    const query = this.db.prepare(`
      INSERT INTO exercise (name) values (?);
    `);
    return query.run(name) as unknown as ExerciseDTO;
  }
}

export default WorkoutDatabaseService;
