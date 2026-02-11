import useAuth from "../auth/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page page-dashboard container">
      <section className="dashboard-header">
        <p className="eyebrow">Dashboard</p>
        <h1>Good to see you, {user?.name ?? "anon"}.</h1>
        <p>
          Your account is ready. Use the <strong>Exercises</strong> section to
          manage your exercise library.
        </p>
      </section>

      <section className="dashboard-grid" aria-label="Dashboard highlights">
        <article className="surface-card">
          <h2>Exercise library</h2>
          <p className="kpi">Ready</p>
          <p>Create, update, and delete exercises from one page.</p>
        </article>

        <article className="surface-card">
          <h2>Templates</h2>
          <p className="kpi">Next</p>
          <p>Template management can be connected in the next step.</p>
        </article>

        <article className="surface-card">
          <h2>Workout logs</h2>
          <p className="kpi">Next</p>
          <p>Session and set tracking will be added after templates.</p>
        </article>
      </section>
    </div>
  );
}
