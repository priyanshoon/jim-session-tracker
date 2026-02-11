export interface WorkoutTemplate {
  id: number;
  name: string;
}

export interface TemplatePayload {
  name: string;
}

export interface TemplateExercise {
  id: number;
  name: string;
}

export interface AddExerciseToTemplatePayload {
  exercise_id: number;
  position: number;
}
