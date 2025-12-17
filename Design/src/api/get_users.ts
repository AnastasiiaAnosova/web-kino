import { User } from '../types';
import { API_BASE_URL, API_ENDPOINTS, USE_MOCK_DATA } from './config';

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

  return res.json();
}



export const getAllUsers = async (): Promise<User[]> => {
  if (USE_MOCK_DATA) throw new Error('Mock mode is on');

  // 1. Get CSRF token
  let csrf = '';
  try {
    const csrfData = await apiFetch(API_ENDPOINTS.CSRF);
    csrf = csrfData.token;
  } catch (e) {
    console.warn('Failed to fetch CSRF token', e);
  }

  // 2. Send POST request to get all users
  const data = await apiFetch(API_ENDPOINTS.GETTING_USERS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf,
    },
    body: JSON.stringify({}) // you could include filters if needed
  });

  // 3. Return users array
  return data.users as User[];
};



export const getUserById = async (userId: number): Promise<User> => {
  if (USE_MOCK_DATA) throw new Error('Mock mode is on');

  // 1. Get CSRF token
  let csrf = '';
  try {
    const csrfData = await apiFetch('/api/csrf.php');
    csrf = csrfData.token;
  } catch (e) {
    console.warn('Failed to fetch CSRF token', e);
  }

  // 2. Send POST request to get single user
  const data = await apiFetch(API_ENDPOINTS.USER_BY_ID, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf,
    },
    body: JSON.stringify({ id: userId })
  });

  // 3. Return the user
  return data.user as User;
};



export const deleteUserById = async (userId: number): Promise<void> => {
  if (USE_MOCK_DATA) throw new Error('Mock mode is on');

  // 1. Get CSRF token
  let csrf = '';
  try {
    const csrfData = await apiFetch('/api/csrf.php');
    csrf = csrfData.token;
  } catch (e) {
    console.warn('Failed to fetch CSRF token', e);
  }

  // 2. Send POST request to delete the user
  const data = await apiFetch(API_ENDPOINTS.DELETE_USER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf,
    },
    body: JSON.stringify({ id: userId })
  });
};
