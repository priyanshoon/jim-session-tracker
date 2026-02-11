import { createContext } from "react";
import type { User } from "../api/auth.types";

export type AuthContextValue = {
  user: User | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default AuthContext;
