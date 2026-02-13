import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSets } from "../api/sets";
import { ApiClientError } from "../api/types";
import { getTemplates } from "../api/templates";
import {
  createWorkoutSession,
  getWorkoutSessions,
} from "../api/workouts";
import type { WorkoutTemplate } from "../api/templates.types";
import type { WorkoutSession } from "../api/workouts.types";
import useAuth from "../auth/useAuth";

interface ProgressPoint {
  sessionId: number;
  sessionLabel: string;
  avgWeight: number;
  avgReps: number;
  totalSets: number;
}

interface ExerciseProgress {
  exerciseId: number;
  exerciseName: string;
  points: ProgressPoint[];
}

function toChartPath(values: number[], width: number, height: number, padding: number): string {
  if (values.length === 0) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const yRange = max - min || 1;
  const xStep = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - ((value - min) / yRange) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function Dashboard() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [progression, setProgression] = useState<ExerciseProgress[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => String(template.id) === selectedTemplateId) ?? null,
    [templates, selectedTemplateId]
  );

  const selectedProgress = useMemo(
    () => progression.find((entry) => String(entry.exerciseId) === selectedExerciseId) ?? null,
    [progression, selectedExerciseId]
  );

  const chartData = useMemo(() => {
    const width = 720;
    const height = 280;
    const padding = 28;
    const values = selectedProgress?.points.map((point) => point.avgWeight) ?? [];
    const path = toChartPath(values, width, height, padding);
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const range = max - min || 1;
    const xStep = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

    const labelStride = values.length > 12 ? Math.ceil(values.length / 12) : 1;
    const dots = values.map((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return {
        x,
        y,
        value,
        sessionNumber: index + 1,
        showLabel: index % labelStride === 0 || index === values.length - 1,
      };
    });

    return { width, height, padding, path, dots, min, max };
  }, [selectedProgress]);

  async function loadDashboardData() {
    const [templateData, sessionData] = await Promise.all([
      getTemplates(),
      getWorkoutSessions(100),
    ]);

    const setsPerSession = await Promise.all(
      sessionData.map((session) =>
        getSets(session.id)
          .then((sets) => ({ session, sets }))
          .catch(() => ({ session, sets: [] }))
      )
    );

    const progressMap = new Map<number, ExerciseProgress>();
    for (const sessionBucket of setsPerSession) {
      const byExercise = new Map<number, { name: string; totalWeight: number; totalReps: number; count: number }>();

      for (const set of sessionBucket.sets) {
        const existing = byExercise.get(set.exercise_id);
        const currentWeight = Number(set.weight) || 0;
        const currentReps = Number(set.reps) || 0;

        byExercise.set(set.exercise_id, {
          name: set.exercise_name ?? existing?.name ?? `Exercise #${set.exercise_id}`,
          totalWeight: (existing?.totalWeight ?? 0) + currentWeight,
          totalReps: (existing?.totalReps ?? 0) + currentReps,
          count: (existing?.count ?? 0) + 1,
        });
      }

      for (const [exerciseId, aggregate] of byExercise.entries()) {
        const entry = progressMap.get(exerciseId) ?? {
          exerciseId,
          exerciseName: aggregate.name,
          points: [],
        };

        const avgWeight = aggregate.count > 0 ? aggregate.totalWeight / aggregate.count : 0;
        const avgReps = aggregate.count > 0 ? aggregate.totalReps / aggregate.count : 0;

        entry.points.push({
          sessionId: sessionBucket.session.id,
          sessionLabel: `Session #${sessionBucket.session.id}`,
          avgWeight,
          avgReps,
          totalSets: aggregate.count,
        });

        progressMap.set(exerciseId, entry);
      }
    }

    const progressData = Array.from(progressMap.values())
      .map((entry) => ({
        ...entry,
        points: [...entry.points].sort(
          (a, b) => a.sessionId - b.sessionId
        ),
      }))
      .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));

    setTemplates(templateData);
    setSessions(sessionData);
    setProgression(progressData);
    setSelectedTemplateId((previousValue) => {
      if (previousValue && templateData.some((template) => String(template.id) === previousValue)) {
        return previousValue;
      }

      return templateData[0] ? String(templateData[0].id) : "";
    });
    setSelectedExerciseId((previousValue) => {
      if (previousValue && progressData.some((entry) => String(entry.exerciseId) === previousValue)) {
        return previousValue;
      }

      return progressData[0] ? String(progressData[0].exerciseId) : "";
    });
  }

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await loadDashboardData();
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Failed to load dashboard sessions."
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

  async function handleCreateSession(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedTemplateId || isSaving) {
      return;
    }

    const templateId = Number(selectedTemplateId);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      setError("Select a valid template.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const created = await createWorkoutSession({ template_id: templateId });
      await loadDashboardData();
      setSuccess(`Started a new session with "${selectedTemplate?.name ?? `Template #${templateId}`}" (session #${created.id}).`);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to create workout session."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page page-dashboard container">
      <section className="dashboard-header">
        <p className="eyebrow">Dashboard</p>
        <h1>Good to see you, {user?.name ?? "anon"}.</h1>
        <p>
          Start workout sessions directly from here by picking one of your templates.
        </p>
      </section>

      <section className="dashboard-grid" aria-label="Dashboard highlights">
        <article className="surface-card">
          <h2>Start new session</h2>
          {isLoading ? <p>Loading templates...</p> : null}
          {!isLoading && templates.length === 0 ? (
            <p>
              You need at least one template first. Create one in the{" "}
              <Link to="/templates">Templates</Link> page.
            </p>
          ) : (
            <form className="dashboard-form" onSubmit={handleCreateSession}>
              <label htmlFor="session-template-id">Template</label>
              <select
                id="session-template-id"
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                required
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} (#{template.id})
                  </option>
                ))}
              </select>
              <div className="dashboard-row-actions">
                <button
                  type="submit"
                  className="button button-solid"
                  disabled={isSaving || templates.length === 0}
                >
                  {isSaving ? "Starting..." : "Create session"}
                </button>
                <Link to="/workouts" className="button button-ghost">
                  View full log
                </Link>
              </div>
            </form>
          )}
          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
        </article>

        <article className="surface-card">
          <h2>Templates</h2>
          <p className="kpi">{templates.length}</p>
          <p>Your saved workout plans are ready for new sessions.</p>
        </article>

        <article className="surface-card">
          <h2>Workout logs</h2>
          <p className="kpi">{sessions.length}</p>
          <p>Track and manage your sessions and sets in Workout Logs.</p>
        </article>
      </section>

      <section className="dashboard-workspace" aria-label="Progress chart">
        <article className="surface-card exercise-editor-card progress-card">
          <div className="dashboard-row">
            <h2>Exercise progression</h2>
            <span className="subtle-text">Y: Avg weight, X: Session number</span>
          </div>

          {isLoading ? <p>Loading chart data...</p> : null}

          {!isLoading && progression.length === 0 ? (
            <p>
              No set history yet. Create a session and log some sets in <Link to="/workouts">Workout Logs</Link>.
            </p>
          ) : (
            <>
              <form className="dashboard-form" onSubmit={(event) => event.preventDefault()}>
                <label htmlFor="progress-exercise">Exercise</label>
                <select
                  id="progress-exercise"
                  value={selectedExerciseId}
                  onChange={(event) => setSelectedExerciseId(event.target.value)}
                >
                  {progression.map((entry) => (
                    <option key={entry.exerciseId} value={entry.exerciseId}>
                      {entry.exerciseName}
                    </option>
                  ))}
                </select>
              </form>

              {selectedProgress ? (
                <div className="progress-chart-wrap">
                  <svg
                    className="progress-chart"
                    viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                    role="img"
                    aria-label={`${selectedProgress.exerciseName} progression chart`}
                  >
                    <line
                      x1={chartData.padding}
                      y1={chartData.height - chartData.padding}
                      x2={chartData.width - chartData.padding}
                      y2={chartData.height - chartData.padding}
                      className="chart-axis"
                    />
                    <line
                      x1={chartData.padding}
                      y1={chartData.padding}
                      x2={chartData.padding}
                      y2={chartData.height - chartData.padding}
                      className="chart-axis"
                    />
                    <path d={chartData.path} className="chart-line" />
                    {chartData.dots.map((dot, index) => (
                      <g key={`${selectedProgress.exerciseId}-${index}`}>
                        <circle cx={dot.x} cy={dot.y} r="4" className="chart-dot" />
                        {dot.showLabel ? (
                          <text
                            x={dot.x}
                            y={chartData.height - chartData.padding + 16}
                            textAnchor="middle"
                            className="chart-tick-label"
                          >
                            {dot.sessionNumber}
                          </text>
                        ) : null}
                      </g>
                    ))}
                    <text
                      x={chartData.padding}
                      y={chartData.padding - 8}
                      textAnchor="start"
                      className="chart-axis-label"
                    >
                      Avg Weight (kg)
                    </text>
                    <text
                      x={chartData.width - chartData.padding}
                      y={chartData.height - 4}
                      textAnchor="end"
                      className="chart-axis-label"
                    >
                      Session Number
                    </text>
                  </svg>

                  <div className="chart-meta-row">
                    <span className="subtle-text">Start: Session 1</span>
                    <span className="subtle-text">Latest: Session {selectedProgress.points.length}</span>
                  </div>

                  <div className="chart-meta-row">
                    <span className="subtle-text">Min: {chartData.min.toFixed(1)} kg</span>
                    <span className="subtle-text">Max: {chartData.max.toFixed(1)} kg</span>
                    <span className="subtle-text">Points: {selectedProgress.points.length}</span>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </article>
      </section>
    </div>
  );
}
