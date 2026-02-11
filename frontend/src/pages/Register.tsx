import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiClientError } from "../api/types";
import useAuth from "../auth/useAuth";
import AuthShell from "../components/AuthShell";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../utils/validation";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/login", { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Could not create your account right now. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your profile and start logging workouts today."
      footer={
        <>
          Already have an account? <Link to="/login">Login</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="register-name">Name</label>
        <input
          id="register-name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={100}
        />

        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        <button type="submit" className="button button-solid" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}
    </AuthShell>
  );
}
