import { BACKENDLESS_CONFIG, getHeaders, handleApiError } from './api';
import type { Club, CreatePlayerProfileParams, Player } from './types';

export const createPlayerProfileViaService = async (
  profileData: CreatePlayerProfileParams,
  userToken: string,
): Promise<Player> => {
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/services/kashaf_profiles/createPlayerProfile`,
    {
      method: 'POST',
      headers: getHeaders(userToken),
      body: JSON.stringify({ ...profileData }),
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const updatePlayerProfileViaService = async (
  playerObjectId: string,
  profileData: Partial<CreatePlayerProfileParams>,
  userToken: string,
): Promise<Player> => {
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/services/kashaf_profiles/updatePlayerProfile`,
    {
      method: 'POST',
      headers: getHeaders(userToken),
      body: JSON.stringify({ playerObjectId, ...profileData }),
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getPlayerProfile = async (
  userId: string,
  userToken: string,
): Promise<Player | null> => {
  const sanitizedId = userId.replace(/[^a-zA-Z0-9-]/g, '');
  const where = encodeURIComponent(`user.objectId = '${sanitizedId}'`);
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/data/Players?where=${where}&pageSize=1`,
    {
      method: 'GET',
      headers: getHeaders(userToken),
    },
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    await handleApiError(response);
  }

  const results: Player[] = await response.json();
  return results?.[0] ?? null;
};

export const getClubProfile = async (
  userId: string,
  userToken: string,
): Promise<Club | null> => {
  const sanitizedId = userId.replace(/[^a-zA-Z0-9-]/g, '');
  const where = encodeURIComponent(`user.objectId = '${sanitizedId}'`);
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/data/Clubs?where=${where}&pageSize=1`,
    {
      method: 'GET',
      headers: getHeaders(userToken),
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  const results: Club[] = await response.json();
  return results?.[0] ?? null;
};

/**
 * Explicitly set the Player.user relation to the given user, in case the
 * Cloud Code path didn't establish it. Idempotent.
 */
export const setPlayerUserRelation = async (
  playerObjectId: string,
  userObjectId: string,
  userToken: string,
): Promise<void> => {
  await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/data/Players/${playerObjectId}/user`,
    {
      method: 'PUT',
      headers: getHeaders(userToken),
      body: JSON.stringify([userObjectId]),
    },
  );
};

export const getClubByObjectId = async (
  clubObjectId: string,
  userToken: string,
): Promise<Club | null> => {
  if (!clubObjectId) return null;

  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/data/Clubs/${clubObjectId}`,
    { method: 'GET', headers: getHeaders(userToken) },
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    await handleApiError(response);
  }

  return response.json();
};
