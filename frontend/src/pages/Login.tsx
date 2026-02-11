import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiClientError } from "../api/types";
import useAuth from "../auth/useAuth";
import AuthShell from "../components/AuthShell";
import { validateEmail } from "../utils/validation";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || "/dashboard", { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Could not sign in right now. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your training streak."
      footer={
        <>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        <button type="submit" className="button button-solid" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}
    </AuthShell>
  );
}
