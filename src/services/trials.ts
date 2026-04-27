import { BACKENDLESS_CONFIG, getHeaders, handleApiError } from './api';
import type { Trial, TrialApplication } from './types';

/**
 * Public trial fetch via Data API with test user authentication.
 * Loads club relation for payment info linking.
 */
export const getTrialPublic = async (trialObjectId: string): Promise<Trial | null> => {
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/data/Trials/${trialObjectId}`,
    { method: 'GET', headers: getHeaders() },
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    await handleApiError(response);
  }

  const data = await response.json();
  if (!data || !data.objectId) return null;
  return data;
};

export const getTrialById = async (
  trialObjectId: string,
  userToken?: string,
): Promise<Trial | null> => {
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/services/kashaf_trials/getTrialById`,
    {
      method: 'POST',
      headers: getHeaders(userToken),
      body: JSON.stringify(trialObjectId),
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  if (!data || !data.objectId) return null;
  return data;
};

export const updateTrial = async (
  trialObjectId: string,
  trialData: Partial<{
    trialName: string;
    trialDateTime: string;
    location: string;
    price: number;
    minAge: number;
    maxAge: number;
    maxParticipants: number;
  }>,
  userToken: string,
): Promise<Trial> => {
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/services/kashaf_trials/updateTrial`,
    {
      method: 'POST',
      headers: getHeaders(userToken),
      body: JSON.stringify({ trialObjectId, ...trialData }),
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const applyForTrial = async (
  playerId: string,
  trialId: string,
  userToken: string,
): Promise<TrialApplication> => {
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/services/kashaf_trials/applyForTrial`,
    {
      method: 'POST',
      headers: getHeaders(userToken),
      body: JSON.stringify({ playerId, trialId, paymentMethod: 'instapay' }),
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getApplicationsForClub = async (
  clubObjectId: string,
  userToken: string,
): Promise<TrialApplication[]> => {
  const sanitizedId = clubObjectId.replace(/[^a-zA-Z0-9-]/g, '');
  const where = encodeURIComponent(`trial.club.objectId = '${sanitizedId}'`);
  const related = encodeURIComponent('trial.club,player,player.user');
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/data/TrialApplication?where=${where}&loadRelations=${related}&sortBy=created%20desc&pageSize=100`,
    {
      method: 'GET',
      headers: getHeaders(userToken),
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: string,
  paymentStatus: string,
  userToken: string,
): Promise<TrialApplication> => {
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/services/kashaf_trials/updateApplicationStatus`,
    {
      method: 'POST',
      headers: getHeaders(userToken),
      body: JSON.stringify({ applicationId, status, paymentStatus }),
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};
