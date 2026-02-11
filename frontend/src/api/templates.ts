import { apiRequest } from "./client";
import type {
  AddExerciseToTemplatePayload,
  TemplateExercise,
  TemplatePayload,
  WorkoutTemplate,
} from "./templates.types";

export function getTemplates(): Promise<WorkoutTemplate[]> {
  return apiRequest<WorkoutTemplate[]>({
    url: "/templates",
    method: "GET",
  });
}

export function getTemplateById(id: number): Promise<WorkoutTemplate> {
  return apiRequest<WorkoutTemplate>({
    url: `/templates/${id}`,
    method: "GET",
  });
}

export function getTemplateExercises(id: number): Promise<TemplateExercise[]> {
  return apiRequest<TemplateExercise[]>({
    url: `/templates/${id}/exercises`,
    method: "GET",
  });
}

export function createTemplate(payload: TemplatePayload): Promise<WorkoutTemplate> {
  return apiRequest<WorkoutTemplate>({
    url: "/templates",
    method: "POST",
    data: payload,
  });
}

export function updateTemplate(
  id: number,
  payload: TemplatePayload
): Promise<WorkoutTemplate> {
  return apiRequest<WorkoutTemplate>({
    url: `/templates/${id}`,
    method: "PUT",
    data: payload,
  });
}

export function deleteTemplate(id: number): Promise<{ message?: string } | void> {
  return apiRequest<{ message?: string } | void>({
    url: `/templates/${id}`,
    method: "DELETE",
  });
}

export function addExerciseToTemplate(
  id: number,
  payload: AddExerciseToTemplatePayload
): Promise<{ message?: string } | void> {
  return apiRequest<{ message?: string } | void>({
    url: `/templates/${id}/exercises`,
    method: "POST",
    data: payload,
  });
}

export function removeExerciseFromTemplate(
  id: number,
  exerciseId: number
): Promise<{ message?: string } | void> {
  return apiRequest<{ message?: string } | void>({
    url: `/templates/${id}/exercises/${exerciseId}`,
    method: "DELETE",
  });
}
