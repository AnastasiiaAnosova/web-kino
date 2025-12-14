import { User } from '../types';
import { API_BASE_URL, API_ENDPOINTS, getApiHeaders, handleApiError, USE_MOCK_DATA } from './config';

const STORAGE_KEY = 'currentUser';
const USERS_KEY = 'users';

/**
 * Získání aktuálního uživatele
 */
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

/**
 * Uložení aktuálního uživatele
 */
export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

/**
 * Odhlášení
 */
export const logout = async (): Promise<void> => {
  if (!USE_MOCK_DATA) {
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        headers: getApiHeaders(true),
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
  
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Přihlášení
 */
export const login = async (email: string, password: string): Promise<User | null> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (email && password) {
      const testUser: User = {
        firstName: 'Jan',
        lastName: 'Novák',
        email: email,
        phone: '+420 123 456 789',
        gender: 'male',
        password: password,
        avatar: null,
        memberSince: new Date().toISOString(),
        loyaltyPoints: 150
      };
      setCurrentUser(testUser);
      return testUser;
    }
    
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const data = await response.json();
    const user = data.user;
    
    if (user) {
      setCurrentUser(user);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

/**
 * Registrace
 */
export const register = async (userData: Omit<User, 'memberSince' | 'loyaltyPoints'>): Promise<User> => {
  const newUser: User = {
    ...userData,
    memberSince: new Date().toISOString(),
    loyaltyPoints: 0
  };

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    setCurrentUser(newUser);
    return newUser;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const data = await response.json();
    const user = data.user;
    
    if (user) {
      setCurrentUser(user);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
    }
    
    return user || newUser;
  } catch (error) {
    console.error('Error registering:', error);
    setCurrentUser(newUser);
    return newUser;
  }
};

/**
 * Aktualizace profilu
 */
export const updateProfile = async (userData: Partial<User>): Promise<User | null> => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const updatedUser: User = {
    ...currentUser,
    ...userData
  };

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setCurrentUser(updatedUser);
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((u: User) => u.email === updatedUser.email);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    
    return updatedUser;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_PROFILE}`, {
      method: 'PUT',
      headers: getApiHeaders(true),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      return handleApiError(response);
    }

    const data = await response.json();
    const user = data.user || updatedUser;
    
    setCurrentUser(user);
    return user;
  } catch (error) {
    console.error('Error updating profile:', error);
    setCurrentUser(updatedUser);
    return updatedUser;
  }
};