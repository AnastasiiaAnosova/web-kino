// src/api/auth.ts
import { User } from '../types';
import { API_BASE_URL, API_ENDPOINTS, USE_MOCK_DATA } from './config';

const STORAGE_KEY = 'currentUser';

async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
  });

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = j.error || j.message || msg;
    } catch {}
    throw new Error(`${res.status} ${msg}`);
  }

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export async function getCsrf(): Promise<string> {
  const j = await apiFetch(API_ENDPOINTS.CSRF);
  return j.token;
}

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const logout = async (): Promise<void> => {
  if (!USE_MOCK_DATA) {
    try {
      await apiFetch(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch {}
  }
  localStorage.removeItem(STORAGE_KEY);
};

export const login = async (loginValue: string, password: string): Promise<User> => {
  if (USE_MOCK_DATA) throw new Error('Mock mode is on');

  const csrf = await getCsrf();

  try {
    const data = await apiFetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf,
      },
      body: JSON.stringify({ login: loginValue, password }),
    });

    const user = data.user as User;
    setCurrentUser(user);
    return user;
  } catch (e: any) {
    // tady bude např. "401 invalid_credentials"
    if (typeof e?.message === 'string' && e.message.includes('401')) {
      throw new Error('invalid_credentials');
    }
    throw e;
  }
};

// aby projekt nespadl – zatím stub (později doplníme podle register.php)
export const register = async (_userData: any): Promise<User> => {
  throw new Error('register not implemented yet');
};

export const updateProfile = async (_userData: Partial<User>): Promise<User> => {
  throw new Error('updateProfile not implemented yet');
};
