import { BACKENDLESS_CONFIG, getHeaders, handleApiError } from './api';
import type { BackendlessUser, LoginPayload, RegisterPayload } from './types';

export const registerUser = async (payload: RegisterPayload): Promise<BackendlessUser> => {
  const response = await fetch(`${BACKENDLESS_CONFIG.SERVER_URL}/api/users/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      mobileNumber: payload.mobileNumber,
      userType: 'player',
      isEmailVerified: true,
      isActive: true,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const loginUser = async (payload: LoginPayload): Promise<BackendlessUser> => {
  const response = await fetch(`${BACKENDLESS_CONFIG.SERVER_URL}/api/users/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      login: payload.email,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const logoutUser = async (userToken: string): Promise<void> => {
  try {
    await fetch(`${BACKENDLESS_CONFIG.SERVER_URL}/api/users/logout`, {
      method: 'GET',
      headers: getHeaders(userToken),
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};
