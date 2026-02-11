import { useEffect, useMemo, useState } from "react";
import { ApiClientError } from "../api/types";
import {
  createExercise,
  deleteExercise,
  getExerciseById,
  getExercises,
  updateExercise,
} from "../api/exercises";
import type { Exercise } from "../api/exercises.types";

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedFromList = useMemo(
    () => exercises.find((exercise) => exercise.id === selectedId) ?? null,
    [exercises, selectedId]
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getExercises();
        if (isMounted) {
          setExercises(data);
          setSelectedId((previousId) => previousId ?? data[0]?.id ?? null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Failed to load exercises."
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
    if (!selectedId) {
      setSelectedExercise(null);
      setEditName("");
      return;
    }

    let isMounted = true;

    const loadSelected = async () => {
      try {
        const data = await getExerciseById(selectedId);
        if (isMounted) {
          setSelectedExercise(data);
          setEditName(data.name);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Failed to load exercise details."
          );
        }
      }
    };

    void loadSelected();

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  async function refreshExercises(selectId?: number | null) {
    const data = await getExercises();
    setExercises(data);

    if (selectId) {
      setSelectedId(selectId);
      return;
    }

    if (data.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!data.some((exercise) => exercise.id === selectedId)) {
      setSelectedId(data[0].id);
    }
  }

  async function handleCreateExercise(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const name = newName.trim();
    if (name.length < 2) {
      setError("Exercise name must be at least 2 characters.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      const created = await createExercise({ name });
      setNewName("");
      await refreshExercises(created.id);
      setSuccess(`Created exercise "${created.name}".`);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to create exercise."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateExercise(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId || isSaving) {
      return;
    }

    const name = editName.trim();
    if (name.length < 2) {
      setError("Exercise name must be at least 2 characters.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await updateExercise(selectedId, { name });
      await refreshExercises(updated.id);
      setSuccess(`Updated exercise to "${updated.name}".`);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to update exercise."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteExercise() {
    if (!selectedId || isSaving) {
      return;
    }

    const canDelete = window.confirm(
      "Delete this exercise? This action cannot be undone."
    );

    if (!canDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      await deleteExercise(selectedId);
      await refreshExercises(null);
      setSelectedExercise(null);
      setEditName("");
      setSuccess("Exercise deleted.");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to delete exercise."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page page-dashboard container">
      <section className="dashboard-header">
        <p className="eyebrow">Exercises</p>
        <h1>Exercise Manager</h1>
        <p>
          Use all exercise endpoints from here: create, read, update, and
          delete.
        </p>
      </section>

      <section className="dashboard-workspace" aria-label="Exercise manager">
        <article className="surface-card exercise-list-card">
          <div className="dashboard-row">
            <h2>Exercises</h2>
            <span className="subtle-text">{exercises.length} total</span>
          </div>

          {isLoading ? <p>Loading exercises...</p> : null}

          {!isLoading && exercises.length === 0 ? (
            <p>No exercises yet. Create your first one.</p>
          ) : (
            <ul className="exercise-list">
              {exercises.map((exercise) => (
                <li key={exercise.id}>
                  <button
                    type="button"
                    className={`list-item-button ${
                      selectedId === exercise.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setError(null);
                      setSuccess(null);
                      setSelectedId(exercise.id);
                    }}
                  >
                    <span>{exercise.name}</span>
                    <small>#{exercise.id}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="surface-card exercise-editor-card">
          <h2>Create exercise</h2>
          <form className="dashboard-form" onSubmit={handleCreateExercise}>
            <label htmlFor="exercise-create-name">Name</label>
            <input
              id="exercise-create-name"
              name="exercise-create-name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="e.g. Romanian Deadlift"
              maxLength={100}
              required
            />
            <button type="submit" className="button button-solid" disabled={isSaving}>
              {isSaving ? "Saving..." : "Create exercise"}
            </button>
          </form>

          <div className="editor-divider" />

          <h2>Edit selected exercise</h2>
          {selectedFromList ? (
            <>
              <form className="dashboard-form" onSubmit={handleUpdateExercise}>
                <label htmlFor="exercise-edit-name">Name</label>
                <input
                  id="exercise-edit-name"
                  name="exercise-edit-name"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  placeholder="Exercise name"
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
                    onClick={handleDeleteExercise}
                    disabled={isSaving}
                  >
                    Delete
                  </button>
                </div>
              </form>

              <div className="exercise-details">
                <p>
                  <strong>ID:</strong> {selectedExercise?.id ?? selectedFromList.id}
                </p>
                <p>
                  <strong>Name:</strong> {selectedExercise?.name ?? selectedFromList.name}
                </p>
              </div>
            </>
          ) : (
            <p>Select an exercise from the list to edit or delete it.</p>
          )}

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
        </article>
      </section>
    </div>
  );
}
