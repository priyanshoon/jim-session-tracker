import { apiRequest } from "./client";
import type { Exercise, ExercisePayload } from "./exercises.types";

export function getExercises(): Promise<Exercise[]> {
  return apiRequest<Exercise[]>({
    url: "/exercises",
    method: "GET",
  });
}

export function getExerciseById(id: number): Promise<Exercise> {
  return apiRequest<Exercise>({
    url: `/exercises/${id}`,
    method: "GET",
  });
}

export function createExercise(payload: ExercisePayload): Promise<Exercise> {
  return apiRequest<Exercise>({
    url: "/exercises",
    method: "POST",
    data: payload,
  });
}

export function updateExercise(
  id: number,
  payload: ExercisePayload
): Promise<Exercise> {
  return apiRequest<Exercise>({
    url: `/exercises/${id}`,
    method: "PUT",
    data: payload,
  });
}

export function deleteExercise(id: number): Promise<{ message?: string } | void> {
  return apiRequest<{ message?: string } | void>({
    url: `/exercises/${id}`,
    method: "DELETE",
  });
}
