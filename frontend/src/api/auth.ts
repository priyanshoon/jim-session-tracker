import { apiRequest } from "./client";
import type { User } from "./auth.types";

export function login(email: string, password: string): Promise<void> {
  return apiRequest<void>({
    url: "/user/login",
    method: "POST",
    data: { email, password },
  });
}

export function register(
  name: string,
  email: string,
  password: string
): Promise<User> {
  return apiRequest<User>({
    url: "/user/register",
    method: "POST",
    data: { name, email, password },
  });
}

export function getMe(): Promise<User> {
  return apiRequest<{ profile: User } | User>({
    url: "/user/me",
    method: "GET",
  }).then((response) => {
    if ("profile" in response) {
      return response.profile;
    }

    return response;
  });
}

export function logout(): Promise<void> {
  return apiRequest<void>({
    url: "/user/logout",
    method: "POST",
  });
}
