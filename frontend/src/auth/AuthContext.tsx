import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../api/auth";
import type { User } from "../api/auth.types";
import AuthContext, { type AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const currentUser = await getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      await refreshSession();

      if (isMounted) {
        setIsBootstrapping(false);
      }
    };

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    await loginRequest(email, password);
    const currentUser = await getMe();
    setUser(currentUser);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await registerRequest(name, email, password);
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isBootstrapping,
      isAuthenticated: Boolean(user),
      refreshSession,
      login,
      register,
      logout,
    }),
    [user, isBootstrapping, refreshSession, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
