export interface WorkoutSessionDTO {
  id: number;
  user_id: number;
  template_id?: number;
  performed_at: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSessionWithSetsDTO extends WorkoutSessionDTO {
  sets: SetDTO[];
}

export interface SetDTO {
  id: number;
  session_id: number;
  exercise_id: number;
  set_number: number;
  reps: number;
  weight: number;
  exercise_name?: string;
}

export interface CreateWorkoutSessionDTO {
  template_id?: number;
  performed_at?: string;
}

export interface UpdateWorkoutSessionDTO {
  template_id?: number | null;
  performed_at?: string;
}

export interface CreateSetDTO {
  exercise_id: number;
  set_number: number;
  reps: number;
  weight: number;
}

export interface UpdateSetDTO {
  reps?: number;
  weight?: number;
}
