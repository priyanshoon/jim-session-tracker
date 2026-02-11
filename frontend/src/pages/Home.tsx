import { Link } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="page page-home">
      <section className="hero container">
        <p className="eyebrow">Workout tracker built for consistency</p>
        <h1>
          Make every session count,
          <br />
          from first set to final rep.
        </h1>
        <p className="hero-copy">
          Plan workouts, log sets, and keep your momentum visible. Jim Session Tracker 
          helps you focus on training instead of scattered notes.
        </p>

        <div className="hero-cta">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="button button-solid">
                Open dashboard
              </Link>
              <span className="subtle-text">Welcome back, {user?.name ?? "Anon"}.</span>
            </>
          ) : (
            <>
              <Link to="/register" className="button button-solid">
                Create account
              </Link>
              <Link to="/login" className="button button-ghost">
                I already have an account
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="feature-grid container" aria-label="Platform features">
        <article className="surface-card">
          <h2>Session timeline</h2>
          <p>
            Review recent workouts in one place and keep your schedule steady
            through the week.
          </p>
        </article>
        <article className="surface-card">
          <h2>Template builder</h2>
          <p>
            Build repeatable training templates and reduce setup friction before
            each workout.
          </p>
        </article>
        <article className="surface-card">
          <h2>Clear progress view</h2>
          <p>
            Spot trends in volume and effort over time so your adjustments are
            intentional.
          </p>
        </article>
      </section>
    </div>
  );
}
