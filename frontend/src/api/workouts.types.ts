export interface WorkoutSession {
  id: number;
  user_id: number;
  template_id: number | null;
  performed_at: string;
}

export interface CreateWorkoutSessionPayload {
  template_id?: number;
  performed_at?: string;
}

export interface UpdateWorkoutSessionPayload {
  template_id?: number | null;
  performed_at?: string;
}

export interface WorkoutSet {
  id: number;
  session_id: number;
  exercise_id: number;
  set_number: number;
  reps: number;
  weight: number;
  exercise_name?: string;
}

export interface WorkoutSessionWithSets extends WorkoutSession {
  sets: WorkoutSet[];
}
