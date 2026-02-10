import { apiFetch } from "./client";
import type { User } from "./auth.types";

export function login(email: string, password: string): Promise<User> {
  return apiFetch<User>("/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  name: string,
  email: string,
  password: string
): Promise<User> {
  return apiFetch<User>("/user/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function getMe(): Promise<User> {
  return apiFetch<User>("/user/me");
}

export function logout(): Promise<void> {
  return apiFetch<void>("/user/logout", {
    method: "POST",
  });
}

