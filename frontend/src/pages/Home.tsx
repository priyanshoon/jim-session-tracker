import { useEffect, useState } from "react";
import { getMe, logout } from "../api/auth";
import type { User } from "../api/auth.types";
import "./Home.css";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
  }

  return (
    <div className="home">
      <header className="home-header">
        <h1>Fitness Tracker</h1>

        {user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <nav>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </nav>
        )}
      </header>

      <main className="home-main">
        {user ? (
          <div className="card">
            <h2>Welcome back, {user.name}</h2>
            <p>Ready to log today’s workout?</p>
          </div>
        ) : (
          <div className="card">
            <h2>Track your workouts</h2>
            <p>Log exercises, build templates, and stay consistent.</p>
          </div>
        )}
      </main>
    </div>
  );
}

