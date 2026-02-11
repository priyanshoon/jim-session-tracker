import axios, { type AxiosRequestConfig } from "axios";
import { ApiClientError, type ApiResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

function extractMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = (error.response?.data as { message?: string } | undefined)
      ?.message;
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
      return apiMessage;
    }

    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }

    if (!error.response) {
      return "Unable to connect to server. Please check your network.";
    }
  }

  return "Something went wrong. Please try again.";
}

function hasSuccessEnvelope<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "success" in value;
}

function hasDataEnvelope<T>(value: unknown): value is { data: T } {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "data" in value;
}

export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const { data } = await http.request<unknown>(config);

    if (hasSuccessEnvelope<T>(data)) {
      if (!data.success) {
        throw new ApiClientError(data.message);
      }

      return data.data;
    }

    if (hasDataEnvelope<T>(data)) {
      return data.data;
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      throw new ApiClientError(extractMessage(error), error.response?.status);
    }

    throw new ApiClientError(extractMessage(error));
  }
}
