import { apiRequest } from "./client";
import type { WorkoutSet } from "./workouts.types";

export interface CreateSetPayload {
  exercise_id: number;
  set_number: number;
  reps: number;
  weight: number;
}

export interface UpdateSetPayload {
  reps?: number;
  weight?: number;
}

export function createSet(sessionId: number, payload: CreateSetPayload): Promise<WorkoutSet> {
  return apiRequest<WorkoutSet>({
    url: `/sets/${sessionId}/sets`,
    method: "POST",
    data: payload,
  });
}

export function getSets(sessionId: number): Promise<WorkoutSet[]> {
  return apiRequest<WorkoutSet[]>({
    url: `/sets/${sessionId}/sets`,
    method: "GET",
  });
}

export function updateSet(setId: number, payload: UpdateSetPayload): Promise<WorkoutSet> {
  return apiRequest<WorkoutSet>({
    url: `/sets/${setId}`,
    method: "PUT",
    data: payload,
  });
}

export function deleteSet(setId: number): Promise<{ message?: string } | void> {
  return apiRequest<{ message?: string } | void>({
    url: `/sets/${setId}`,
    method: "DELETE",
  });
}
