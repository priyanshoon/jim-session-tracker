import { useEffect, useMemo, useState } from "react";
import { createSet, deleteSet, getSets, updateSet } from "../api/sets";
import { ApiClientError } from "../api/types";
import { getTemplateExercises, getTemplates } from "../api/templates";
import {
  deleteWorkoutSession,
  getWorkoutSessionById,
  getWorkoutSessions,
  updateWorkoutSession,
} from "../api/workouts";
import type { TemplateExercise, WorkoutTemplate } from "../api/templates.types";
import type { WorkoutSession, WorkoutSet } from "../api/workouts.types";

function toDateTimeLocalValue(input: string): string {
  const normalized = input.includes("T") ? input : input.replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hour = String(parsed.getHours()).padStart(2, "0");
  const minute = String(parsed.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export default function WorkoutLogs() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [sessionSets, setSessionSets] = useState<WorkoutSet[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);

  const [editTemplateId, setEditTemplateId] = useState<string>("");
  const [editPerformedAt, setEditPerformedAt] = useState<string>("");
  const [newSetExerciseId, setNewSetExerciseId] = useState<string>("");
  const [newSetReps, setNewSetReps] = useState<string>("");
  const [newSetWeight, setNewSetWeight] = useState<string>("");
  const [setDrafts, setSetDrafts] = useState<Record<number, { reps: string; weight: string }>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedTemplateName = useMemo(() => {
    if (!selectedSession?.template_id) {
      return "No template";
    }

    const match = templates.find((template) => template.id === selectedSession.template_id);
    return match ? `${match.name} (#${match.id})` : `Template #${selectedSession.template_id}`;
  }, [selectedSession, templates]);

  async function loadLogsData() {
    const [templateData, sessionData] = await Promise.all([
      getTemplates(),
      getWorkoutSessions(100),
    ]);

    setTemplates(templateData);
    setSessions(sessionData);

    setSelectedSessionId((previousValue) => {
      if (previousValue && sessionData.some((session) => session.id === previousValue)) {
        return previousValue;
      }
      return sessionData[0]?.id ?? null;
    });
  }

  async function loadSelectedSession(sessionId: number) {
    const [session, sets] = await Promise.all([
      getWorkoutSessionById(sessionId),
      getSets(sessionId),
    ]);

    const exercisesForTemplate = session.template_id
      ? await getTemplateExercises(session.template_id).catch(() => [])
      : [];

    setSelectedSession(session);
    setSessionSets(sets);
    setTemplateExercises(exercisesForTemplate);
    setSetDrafts(
      Object.fromEntries(
        sets.map((set) => [set.id, { reps: String(set.reps), weight: String(set.weight) }])
      )
    );
    setNewSetExerciseId((previousValue) => {
      if (previousValue && exercisesForTemplate.some((exercise) => String(exercise.id) === previousValue)) {
        return previousValue;
      }

      return exercisesForTemplate[0] ? String(exercisesForTemplate[0].id) : "";
    });
    setEditTemplateId(session.template_id ? String(session.template_id) : "");
    setEditPerformedAt(toDateTimeLocalValue(session.performed_at));
  }

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await loadLogsData();
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Failed to load workout logs."
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
    if (!selectedSessionId) {
      setSelectedSession(null);
      setSessionSets([]);
      setEditTemplateId("");
      setEditPerformedAt("");
      return;
    }

    let isMounted = true;

    const load = async () => {
      try {
        setError(null);
        await loadSelectedSession(selectedSessionId);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Failed to load session details."
          );
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [selectedSessionId]);

  async function handleUpdateSession(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSession || isSaving) {
      return;
    }

    const payload: { template_id?: number | null; performed_at?: string } = {};

    if (editTemplateId === "") {
      payload.template_id = null;
    } else {
      const parsedTemplateId = Number(editTemplateId);
      if (!Number.isInteger(parsedTemplateId) || parsedTemplateId <= 0) {
        setError("Select a valid template.");
        return;
      }
      payload.template_id = parsedTemplateId;
    }

    if (editPerformedAt.trim().length > 0) {
      payload.performed_at = new Date(editPerformedAt).toISOString();
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      await updateWorkoutSession(selectedSession.id, payload);
      await Promise.all([loadLogsData(), loadSelectedSession(selectedSession.id)]);
      setSuccess(`Updated session #${selectedSession.id}.`);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to update workout session."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteSession() {
    if (!selectedSession || isSaving) {
      return;
    }

    const canDelete = window.confirm(
      `Delete session #${selectedSession.id}? This action cannot be undone.`
    );
    if (!canDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      await deleteWorkoutSession(selectedSession.id);
      await loadLogsData();
      setSuccess(`Deleted session #${selectedSession.id}.`);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to delete workout session."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateSet(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSession || isSaving) {
      return;
    }

    const exerciseId = Number(newSetExerciseId);
    const reps = Number(newSetReps);
    const weight = Number(newSetWeight);
    const nextSetNumber = Math.max(0, ...sessionSets.map((set) => set.set_number)) + 1;

    if (!Number.isInteger(exerciseId) || exerciseId <= 0) {
      setError("Select an exercise.");
      return;
    }

    if (!Number.isFinite(reps) || reps <= 0) {
      setError("Reps must be a positive number.");
      return;
    }

    if (!Number.isFinite(weight) || weight < 0) {
      setError("Weight must be 0 or more.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      await createSet(selectedSession.id, {
        exercise_id: exerciseId,
        set_number: nextSetNumber,
        reps,
        weight,
      });

      await loadSelectedSession(selectedSession.id);
      setNewSetReps("");
      setNewSetWeight("");
      setSuccess(`Added set ${nextSetNumber} to session #${selectedSession.id}.`);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to add set."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function updateSetDraft(setId: number, key: "reps" | "weight", value: string) {
    setSetDrafts((previous) => ({
      ...previous,
      [setId]: {
        reps: previous[setId]?.reps ?? "",
        weight: previous[setId]?.weight ?? "",
        [key]: value,
      },
    }));
  }

  async function handleUpdateSet(setId: number) {
    if (!selectedSession || isSaving) {
      return;
    }

    const draft = setDrafts[setId];
    const reps = Number(draft?.reps);
    const weight = Number(draft?.weight);

    if (!Number.isFinite(reps) || reps <= 0) {
      setError("Reps must be a positive number.");
      return;
    }

    if (!Number.isFinite(weight) || weight < 0) {
      setError("Weight must be 0 or more.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      await updateSet(setId, { reps, weight });
      await loadSelectedSession(selectedSession.id);
      setSuccess(`Updated set #${setId}.`);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to update set."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteSet(setId: number) {
    if (!selectedSession || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      await deleteSet(setId);
      await loadSelectedSession(selectedSession.id);
      setSuccess(`Deleted set #${setId}.`);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to delete set."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page page-dashboard container">
      <section className="dashboard-header">
        <p className="eyebrow">Workout Logs</p>
        <h1>Session manager</h1>
        <p>Select a session to view sets, update details, or delete it.</p>
      </section>

      <section className="dashboard-workspace" aria-label="Workout logs manager">
        <article className="surface-card exercise-list-card">
          <div className="dashboard-row">
            <h2>Sessions</h2>
            <span className="subtle-text">{sessions.length} total</span>
          </div>

          {isLoading ? <p>Loading sessions...</p> : null}

          {!isLoading && sessions.length === 0 ? (
            <p>No workout sessions found.</p>
          ) : (
            <ul className="exercise-list">
              {sessions.map((session) => (
                <li key={session.id}>
                  <button
                    type="button"
                    className={`list-item-button ${selectedSessionId === session.id ? "active" : ""}`}
                    onClick={() => {
                      setError(null);
                      setSuccess(null);
                      setSelectedSessionId(session.id);
                    }}
                  >
                    <span>Session #{session.id}</span>
                    <small>{new Date(session.performed_at).toLocaleDateString()}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="surface-card exercise-editor-card">
          <h2>Session details</h2>

          {selectedSession ? (
            <>
              <div className="exercise-details">
                <p>
                  <strong>ID:</strong> {selectedSession.id}
                </p>
                <p>
                  <strong>Template:</strong> {selectedTemplateName}
                </p>
                <p>
                  <strong>Performed:</strong> {new Date(selectedSession.performed_at).toLocaleString()}
                </p>
              </div>

              <div className="editor-divider" />

              <h2>Update session</h2>
              <form className="dashboard-form" onSubmit={handleUpdateSession}>
                <label htmlFor="workout-log-template">Template</label>
                <select
                  id="workout-log-template"
                  value={editTemplateId}
                  onChange={(event) => setEditTemplateId(event.target.value)}
                  disabled={isSaving}
                >
                  <option value="">No template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} (#{template.id})
                    </option>
                  ))}
                </select>

                <label htmlFor="workout-log-performed-at">Performed at</label>
                <input
                  id="workout-log-performed-at"
                  type="datetime-local"
                  value={editPerformedAt}
                  onChange={(event) => setEditPerformedAt(event.target.value)}
                  disabled={isSaving}
                />

                <div className="dashboard-actions">
                  <button
                    type="submit"
                    className="button button-solid"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Update session"}
                  </button>
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={() => void handleDeleteSession()}
                    disabled={isSaving}
                  >
                    Delete session
                  </button>
                </div>
              </form>

              <div className="editor-divider" />

              <div className="template-exercise-list">
                <div className="dashboard-row">
                  <h3>Sets</h3>
                  <span className="subtle-text">{sessionSets.length} total</span>
                </div>

                <form className="dashboard-form" onSubmit={handleCreateSet}>
                  <label htmlFor="set-exercise">Exercise</label>
                  <select
                    id="set-exercise"
                    value={newSetExerciseId}
                    onChange={(event) => setNewSetExerciseId(event.target.value)}
                    disabled={isSaving || templateExercises.length === 0}
                    required
                  >
                    {templateExercises.length === 0 ? (
                      <option value="">No template exercises available</option>
                    ) : null}
                    {templateExercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name} (#{exercise.id})
                      </option>
                    ))}
                  </select>

                  <div className="set-input-grid">
                    <div>
                      <label htmlFor="set-reps">Reps<br/></label>
                      <input
                        id="set-reps"
                        type="number"
                        min={1}
                        value={newSetReps}
                        onChange={(event) => setNewSetReps(event.target.value)}
                        disabled={isSaving}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="set-weight">Weight (kg)<br/></label>
                      <input
                        id="set-weight"
                        type="number"
                        min={0}
                        step="0.5"
                        value={newSetWeight}
                        onChange={(event) => setNewSetWeight(event.target.value)}
                        disabled={isSaving}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="button button-solid"
                    disabled={isSaving || templateExercises.length === 0}
                  >
                    {isSaving ? "Saving..." : "Add set"}
                  </button>
                </form>

                {!selectedSession.template_id ? (
                  <p className="subtle-text">
                    This session has no template attached, so exercise choices are unavailable.
                  </p>
                ) : null}

                {sessionSets.length === 0 ? (
                  <p>No sets logged for this session yet.</p>
                ) : (
                  <ul>
                    {sessionSets.map((set) => (
                      <li key={set.id}>
                        <div>
                          <strong>Set {set.set_number}</strong>
                          <p className="subtle-text">
                            {set.exercise_name ?? `Exercise #${set.exercise_id}`}
                          </p>
                        </div>
                        <div className="set-row-actions">
                          <input
                            className="set-inline-input"
                            type="number"
                            min={1}
                            value={setDrafts[set.id]?.reps ?? ""}
                            onChange={(event) => updateSetDraft(set.id, "reps", event.target.value)}
                            disabled={isSaving}
                          />
                          <input
                            className="set-inline-input"
                            type="number"
                            min={0}
                            step="0.5"
                            value={setDrafts[set.id]?.weight ?? ""}
                            onChange={(event) => updateSetDraft(set.id, "weight", event.target.value)}
                            disabled={isSaving}
                          />
                          <button
                            type="button"
                            className="button button-solid"
                            onClick={() => void handleUpdateSet(set.id)}
                            disabled={isSaving}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="button button-danger"
                            onClick={() => void handleDeleteSet(set.id)}
                            disabled={isSaving}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <p>Select a session from the list.</p>
          )}

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
        </article>
      </section>
    </div>
  );
}
