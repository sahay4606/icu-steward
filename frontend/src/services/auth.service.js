import { API_BASE_URL } from '../lib/config';

async function authFetch(path, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Connection timed out. Is the API server running on port 4000?');
    throw err;
  }
}

async function authFetchWithToken(path, token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Connection timed out');
    throw err;
  }
}

export const authService = {
  login: (email, password) => authFetch('/api/auth/login', { email, password }),
  signup: (name, email, password, hospitalId) => authFetch('/api/auth/signup', { name, email, password, hospitalId }),
  getMe: (token) => authFetchWithToken('/api/auth/me', token),
};
