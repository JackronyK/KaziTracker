// src/api/apiFetch.ts
export async function apiFetch(path: string, opts: RequestInit = {}) {
  // Use VITE_API_URL when set (works both dev/prod). Otherwise use relative path (works with proxy).
  const API_BASE = (import.meta.env.VITE_API_URL as string) || '';
  const url = API_BASE ? `${API_BASE}${path}` : path;

  // token is expected to be stored in localStorage as "token"
  const token = localStorage.getItem('token') || '';

  // Merge headers, ensure Authorization added, and avoid cached 304 responses
  const headers = {
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;

  const res = await fetch(url, {
    ...opts,
    headers,
    // avoid cached index.html being returned as 304
    cache: 'no-store',
    credentials: 'same-origin',
  });

  // If non-ok, include server response text in the thrown error for debugging
  if (!res.ok) {
    let text = '';
    try {
      text = await res.text();
    } catch {
      text = '<no body>';
    }
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }

  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    return res.json();
  }

  // Helpful error when we expected JSON but got HTML (index.html)
  const text = await res.text();
  throw new Error(`Expected JSON but got non-JSON response: ${text.slice(0, 2000)}`);
}
