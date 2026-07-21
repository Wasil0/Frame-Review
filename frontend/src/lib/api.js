import { supabase } from "./supabaseClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function apiFetch(endpoint, options = {}) {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `API Error (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorMsg = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch (e) {
      // Ignored if response is not JSON
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  get: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body)
    }),
  put: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body)
    }),
  delete: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: "DELETE" })
};
