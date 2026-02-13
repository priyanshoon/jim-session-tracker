import { apiRequest } from "./client";
import type {
  CreateWorkoutSessionPayload,
  UpdateWorkoutSessionPayload,
  WorkoutSession,
  WorkoutSessionWithSets,
} from "./workouts.types";

export function createWorkoutSession(
  payload: CreateWorkoutSessionPayload
): Promise<WorkoutSession> {
  return apiRequest<WorkoutSession>({
    url: "/workouts",
    method: "POST",
    data: payload,
  });
}

export function getWorkoutSessions(limit?: number): Promise<WorkoutSession[]> {
  return apiRequest<WorkoutSession[]>({
    url: "/workouts",
    method: "GET",
    params: limit ? { limit } : undefined,
  });
}

export function getWorkoutSessionById(id: number): Promise<WorkoutSession> {
  return apiRequest<WorkoutSession>({
    url: `/workouts/${id}`,
    method: "GET",
  });
}

export function getWorkoutSessionSets(
  id: number
): Promise<WorkoutSessionWithSets> {
  return apiRequest<WorkoutSessionWithSets>({
    url: `/workouts/${id}/sets`,
    method: "GET",
  });
}

export function updateWorkoutSession(
  id: number,
  payload: UpdateWorkoutSessionPayload
): Promise<WorkoutSession> {
  return apiRequest<WorkoutSession>({
    url: `/workouts/${id}`,
    method: "PUT",
    data: payload,
  });
}

export function deleteWorkoutSession(
  id: number
): Promise<{ message?: string } | void> {
  return apiRequest<{ message?: string } | void>({
    url: `/workouts/${id}`,
    method: "DELETE",
  });
}
