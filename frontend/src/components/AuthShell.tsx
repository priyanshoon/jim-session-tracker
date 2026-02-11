import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="auth-shell">
      <section className="auth-panel auth-panel-brand">
        <Link to="/" className="brand-link auth-brand-link">
            Jim Session Tracker 
        </Link>
        <h1>Train hard. Track smarter.</h1>
        <p>
          Build training momentum with clean workout logs, reliable templates,
          and progress snapshots that keep you consistent.
        </p>
      </section>

      <section className="auth-panel auth-panel-form" aria-label={title}>
        <div className="auth-card">
          <h2>{title}</h2>
          <p>{subtitle}</p>
          {children}
          <div className="auth-card-footer">{footer}</div>
        </div>
      </section>
    </div>
  );
}
