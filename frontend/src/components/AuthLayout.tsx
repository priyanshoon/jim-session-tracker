import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./AuthLayout.css";

export default function AuthLayout({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="auth">
      <header className="auth-header">
        <Link to="/" className="logo">
          Fitness Tracker
        </Link>
      </header>

      <main className="auth-main">
        <div className="card">
          <h2>{title}</h2>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

