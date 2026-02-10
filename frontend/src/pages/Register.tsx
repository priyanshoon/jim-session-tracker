import { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../api/auth";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await register(name, email, password);
      window.location.href = "/login";
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      footer={
        <>
          Already have an account? <Link to="/login">Login</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        <button type="submit">Register</button>
      </form>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}
    </AuthLayout>
  );
}

