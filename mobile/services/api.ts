import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_HTTP_URL || 'http://localhost:8000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

async function request(method: string, path: string, body?: object): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  return res.json();
}

export const api = {
  get: (path: string) => request('GET', path),
  post: (path: string, body: object) => request('POST', path, body),
  put: (path: string, body: object) => request('PUT', path, body),
  delete: (path: string) => request('DELETE', path),
};
