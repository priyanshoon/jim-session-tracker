import { Link, NavLink, Outlet } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function SiteLayout() {
  const { user, logout, isAuthenticated } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner container">
          <Link to="/" className="brand-link" aria-label="Go to homepage">
            Jim Session Tracker 
          </Link>

          <nav className="main-nav" aria-label="Main navigation">
            {!isAuthenticated && (
              <NavLink to="/" end>
                Home
              </NavLink>
            )}
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/exercises">Exercises</NavLink>
              </>
            ) : null}
          </nav>

          <div className="topbar-actions">
            {isAuthenticated ? (
              <>
                <span className="user-pill" title={user?.email}>
                  {user?.name ?? "Anon"}
                </span>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="button button-ghost">
                  Log in
                </Link>
                <Link to="/register" className="button button-solid">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
