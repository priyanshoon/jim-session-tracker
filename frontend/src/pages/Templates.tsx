import { useEffect, useMemo, useState } from "react";
import { ApiClientError } from "../api/types";
import { getExercises } from "../api/exercises";
import type { Exercise } from "../api/exercises.types";
import {
  addExerciseToTemplate,
  createTemplate,
  deleteTemplate,
  getTemplateById,
  getTemplateExercises,
  getTemplates,
  removeExerciseFromTemplate,
  updateTemplate,
} from "../api/templates";
import type { TemplateExercise, WorkoutTemplate } from "../api/templates.types";

export default function Templates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkoutTemplate | null>(null);
  const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);

  const [newTemplateName, setNewTemplateName] = useState("");
  const [editTemplateName, setEditTemplateName] = useState("");
  const [assignExerciseId, setAssignExerciseId] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedTemplateFromList = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId]
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const [templateData, exerciseData] = await Promise.all([
          getTemplates(),
          getExercises(),
        ]);

        if (isMounted) {
          setTemplates(templateData);
          setAllExercises(exerciseData);
          setSelectedTemplateId((previousId) => previousId ?? templateData[0]?.id ?? null);
          setAssignExerciseId((previousValue) => {
            if (previousValue) {
              return previousValue;
            }

            return exerciseData[0] ? String(exerciseData[0].id) : "";
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Failed to load templates."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTemplateId) {
      setSelectedTemplate(null);
      setTemplateExercises([]);
      setEditTemplateName("");
      return;
    }

    let isMounted = true;

    const loadDetails = async () => {
      try {
        const [template, exercises] = await Promise.all([
          getTemplateById(selectedTemplateId),
          getTemplateExercises(selectedTemplateId).catch(() => []),
        ]);

        if (isMounted) {
          setSelectedTemplate(template);
          setEditTemplateName(template.name);
          setTemplateExercises(exercises);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Failed to load template details."
          );
        }
      }
    };

    void loadDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedTemplateId]);

  async function refreshTemplates(selectId?: number | null) {
    const data = await getTemplates();
    setTemplates(data);

    if (selectId) {
      setSelectedTemplateId(selectId);
      return;
    }

    if (data.length === 0) {
      setSelectedTemplateId(null);
      return;
    }

    if (!data.some((template) => template.id === selectedTemplateId)) {
      setSelectedTemplateId(data[0].id);
    }
  }

  async function refreshTemplateExercises(templateId: number) {
    try {
      const data = await getTemplateExercises(templateId);
      setTemplateExercises(data);
    } catch {
      setTemplateExercises([]);
    }
  }

  async function handleCreateTemplate(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const name = newTemplateName.trim();
    if (name.length < 2) {
      setError("Template name must be at least 2 characters.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      const created = await createTemplate({ name });
      setNewTemplateName("");
      await refreshTemplates(created.id);
      setSuccess(`Created template "${created.name}".`);
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to create template."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateTemplate(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedTemplateId || isSaving) {
      return;
    }

    const name = editTemplateName.trim();
    if (name.length < 2) {
      setError("Template name must be at least 2 characters.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await updateTemplate(selectedTemplateId, { name });
      await refreshTemplates(updated.id);
      setSuccess(`Updated template to "${updated.name}".`);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to update template."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTemplate() {
    if (!selectedTemplateId || isSaving) {
      return;
    }

    const canDelete = window.confirm(
      "Delete this template? This action cannot be undone."
    );

    if (!canDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      await deleteTemplate(selectedTemplateId);
      await refreshTemplates(null);
      setSelectedTemplate(null);
      setEditTemplateName("");
      setTemplateExercises([]);
      setSuccess("Template deleted.");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to delete template."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddExerciseToTemplate(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedTemplateId || isSaving) {
      return;
    }

    const exerciseId = Number(assignExerciseId);

    if (!exerciseId || Number.isNaN(exerciseId)) {
      setError("Select an exercise.");
      return;
    }

    const nextPosition = templateExercises.length + 1;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      await addExerciseToTemplate(selectedTemplateId, {
        exercise_id: exerciseId,
        position: nextPosition,
      });
      await refreshTemplateExercises(selectedTemplateId);
      setSuccess("Exercise added to template.");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to add exercise to template."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function openCreateTemplateModal() {
    setError(null);
    setSuccess(null);
    setIsCreateModalOpen(true);
  }

  function closeCreateTemplateModal() {
    setIsCreateModalOpen(false);
    setNewTemplateName("");
  }

  async function handleRemoveExerciseFromTemplate(exerciseId: number) {
    if (!selectedTemplateId || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      await removeExerciseFromTemplate(selectedTemplateId, exerciseId);
      await refreshTemplateExercises(selectedTemplateId);
      setSuccess("Exercise removed from template.");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to remove exercise from template."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page page-dashboard container">
      <section className="dashboard-header">
        <p className="eyebrow">Templates</p>
        <h1>Template Builder</h1>
        <p>Create workout templates and attach exercises to each template.</p>
      </section>

      <section className="dashboard-workspace" aria-label="Template manager">
        <article className="surface-card exercise-list-card">
          <div className="dashboard-row">
            <h2>Templates</h2>
            <span className="subtle-text">{templates.length} total</span>
          </div>

          {isLoading ? <p>Loading templates...</p> : null}

          {!isLoading && templates.length === 0 ? (
            <p>No templates yet. Create your first one.</p>
          ) : (
            <ul className="exercise-list">
              {templates.map((template) => (
                <li key={template.id}>
                  <button
                    type="button"
                    className={`list-item-button ${
                      selectedTemplateId === template.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setError(null);
                      setSuccess(null);
                      setSelectedTemplateId(template.id);
                    }}
                  >
                    <span>{template.name}</span>
                    <small>#{template.id}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="panel-footer-action">
            <button
              type="button"
              className="button button-solid"
              onClick={openCreateTemplateModal}
            >
              Create template
            </button>
          </div>
        </article>

        <article className="surface-card exercise-editor-card">
          <h2>Edit selected template</h2>
          {selectedTemplateFromList ? (
            <>
              <form className="dashboard-form" onSubmit={handleUpdateTemplate}>
                <label htmlFor="template-edit-name">Name</label>
                <input
                  id="template-edit-name"
                  name="template-edit-name"
                  value={editTemplateName}
                  onChange={(event) => setEditTemplateName(event.target.value)}
                  placeholder="Template name"
                  maxLength={100}
                  required
                />
                <div className="dashboard-actions">
                  <button
                    type="submit"
                    className="button button-solid"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Update"}
                  </button>
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={handleDeleteTemplate}
                    disabled={isSaving}
                  >
                    Delete
                  </button>
                </div>
              </form>

              <div className="editor-divider" />

              <h2>Add exercise to template</h2>
              <form className="dashboard-form" onSubmit={handleAddExerciseToTemplate}>
                <label htmlFor="template-exercise-id">Exercise</label>
                <select
                  id="template-exercise-id"
                  value={assignExerciseId}
                  onChange={(event) => setAssignExerciseId(event.target.value)}
                  required
                >
                  {allExercises.length === 0 ? (
                    <option value="">No exercises available</option>
                  ) : null}
                  {allExercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name} (#{exercise.id})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="button button-solid"
                  disabled={isSaving || allExercises.length === 0}
                >
                  {isSaving ? "Saving..." : "Add exercise"}
                </button>
              </form>

              <div className="exercise-details">
                <p>
                  <strong>ID:</strong> {selectedTemplate?.id ?? selectedTemplateFromList.id}
                </p>
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedTemplate?.name ?? selectedTemplateFromList.name}
                </p>
              </div>

              <div className="template-exercise-list">
                <div className="dashboard-row">
                  <h3>Template exercises</h3>
                  <span className="subtle-text">{templateExercises.length} linked</span>
                </div>

                {templateExercises.length === 0 ? (
                  <p>No exercises linked to this template yet.</p>
                ) : (
                  <ul>
                    {templateExercises.map((exercise) => (
                      <li key={`${selectedTemplateId}-${exercise.id}`}>
                        <span>
                          {exercise.name} <small>#{exercise.id}</small>
                        </span>
                        <button
                          type="button"
                          className="button button-danger"
                          onClick={() => void handleRemoveExerciseFromTemplate(exercise.id)}
                          disabled={isSaving}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <p>Select a template from the list to edit and assign exercises.</p>
          )}

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
        </article>
      </section>

      {isCreateModalOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={closeCreateTemplateModal}
        >
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Create template"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dashboard-row">
              <h2>Create template</h2>
              <button
                type="button"
                className="button button-ghost"
                onClick={closeCreateTemplateModal}
                disabled={isSaving}
              >
                Close
              </button>
            </div>

            <form className="dashboard-form" onSubmit={handleCreateTemplate}>
              <label htmlFor="template-create-name">Name</label>
              <input
                id="template-create-name"
                name="template-create-name"
                value={newTemplateName}
                onChange={(event) => setNewTemplateName(event.target.value)}
                placeholder="e.g. Push A"
                maxLength={100}
                autoFocus
                required
              />
              <button
                type="submit"
                className="button button-solid"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Create template"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
