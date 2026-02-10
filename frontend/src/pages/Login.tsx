import { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "../api/auth";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      window.location.assign("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <AuthLayout
      title="Login"
      footer={
        <>
          Don’t have an account? <Link to="/register">Register</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}
    </AuthLayout>
  );
}
