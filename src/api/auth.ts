import { apiRequest, setStoredToken } from './client';
import { User } from '../types';

export async function mockLogin(email: string, name?: string): Promise<User> {
  const user = await apiRequest<User>('/auth/mock-login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      name: name || email.split('@')[0],
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=0D8ABC&color=fff`,
    }),
  });

  if (user.token) {
    await setStoredToken(user.token);
  }

  return user;
}

export async function fetchMe(): Promise<User> {
  return apiRequest<User>('/auth/me');
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // ignore
  } finally {
    await setStoredToken(null);
  }
}
