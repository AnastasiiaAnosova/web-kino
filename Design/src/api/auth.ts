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
  return j.token || j.csrf_token;
}

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const logout = async (): Promise<void> => {

  let csrf = '';
  try {
     const csrfData = await apiFetch(API_ENDPOINTS.CSRF);
     csrf = csrfData.token;
  } catch (e) {
     console.warn('Failed to fetch CSRF token', e);
  }

  if (!USE_MOCK_DATA) {
    try {
      await apiFetch(API_ENDPOINTS.LOGOUT, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
        }
       });
    } catch {}
  }
  
  localStorage.removeItem(STORAGE_KEY);
};

export const login = async (loginValue: string, password: string): Promise<User> => {
  if (USE_MOCK_DATA) throw new Error('Mock mode is on');

  // const csrf = await getCsrf();
  let csrf = '';
  try {
     const csrfData = await apiFetch(API_ENDPOINTS.CSRF);
     csrf = csrfData.token;
  } catch (e) {
     console.warn('Failed to fetch CSRF token', e);
  }

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
    if (typeof e?.message === 'string' && e.message.includes('401')) {
      throw new Error('invalid_credentials');
    }
    throw e;
  }
};

export const register = async (userData: any): Promise<User> => {
  if (USE_MOCK_DATA) throw new Error('Mock mode is on');
  let csrf = '';
  try {
     const csrfData = await apiFetch(API_ENDPOINTS.CSRF);
     csrf = csrfData.token;
  } catch (e) {
     console.warn('Failed to fetch CSRF token', e);
  }
  const data = await apiFetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
      },
      body: JSON.stringify(userData)
  });
  const user = data.user as User;
  setCurrentUser(user);
  return user;
};

export const updateProfile = async (userData: Partial<User> & { password?: string }): Promise<User> => {
  if (USE_MOCK_DATA) throw new Error('Mock mode is on');

  // 1. Получаем токен
  let csrf = '';
  try {
     const csrfData = await apiFetch(API_ENDPOINTS.CSRF);
     csrf = csrfData.token;
  } catch (e) {
     console.warn('Failed to fetch CSRF token', e);
  }

  // 2. Отправляем запрос на обновление
  const data = await apiFetch(API_ENDPOINTS.UPDATE_PROFILE, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
      },
      body: JSON.stringify(userData)
  });

  // 3. Обновляем локальное хранилище (чтобы при обновлении страницы данные не терялись)
  const updatedUser = data.user as User;
  const currentUser = getCurrentUser();
  if(currentUser && updatedUser.id == currentUser.id){
    setCurrentUser(updatedUser);
  }
  
  return updatedUser;
};

