// src/api/messages.ts
import { API_BASE_URL, getApiHeaders, handleApiError } from './config';
import { getCsrf } from './auth';

export interface Message {
  id: number;
  subject: string;
  text: string;
  date: string;
  isRead: boolean;
  otherUser: {
    username: string;
    fullName: string;
    avatar: string | null;
  };
}

const MESSAGES_URL = `${API_BASE_URL}/api/messages.php`;

export const getMessages = async (type: 'inbox' | 'sent' = 'inbox'): Promise<Message[]> => {
  try {
    const response = await fetch(`${MESSAGES_URL}?type=${type}`, {
      method: 'GET',
      headers: getApiHeaders(),
      credentials: 'include',
    });
    if (!response.ok) return handleApiError(response);
    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${MESSAGES_URL}?type=unread_count`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return data.count || 0;
  } catch {
    return 0;
  }
};

export const sendMessage = async (recipient: string, subject: string, text: string): Promise<void> => {
  const csrf = await getCsrf();
  const response = await fetch(MESSAGES_URL, {
    method: 'POST',
    headers: {
      ...getApiHeaders(),
      'X-CSRF-Token': csrf,
    },
    credentials: 'include',
    body: JSON.stringify({ recipient, subject, text }),
  });
  if (!response.ok) return handleApiError(response);
};

export const markAsRead = async (messageId: number): Promise<void> => {
  const response = await fetch(MESSAGES_URL, {
    method: 'PATCH',
    headers: getApiHeaders(),
    credentials: 'include',
    body: JSON.stringify({ id: messageId }),
  });
  if (!response.ok) return handleApiError(response);
};