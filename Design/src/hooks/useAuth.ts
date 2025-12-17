import { useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister, updateProfile as apiUpdateProfile } from '../api/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleStorageChange);
    window.addEventListener('userLogout', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await apiLogin(email, password);
      setUser(userData);
      window.dispatchEvent(new Event('userLogin'));
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {

    try {
        await apiLogout();   // wait until session is destroyed
    } catch (e) {
        console.warn('Logout failed', e);
    }
    setUser(null);
    window.dispatchEvent(new Event('userLogout'));
  };

  const register = async (userData: Omit<User, 'memberSince' | 'loyaltyPoints'>) => {
    try {
      setLoading(true);
      const newUser = await apiRegister(userData);
      setUser(newUser);
      window.dispatchEvent(new Event('userLogin'));
      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      const updatedUser = await apiUpdateProfile(userData);
      setUser(updatedUser);
      window.dispatchEvent(new Event('userLogin'));
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile
  };
};
