import { BACKENDLESS_CONFIG, getHeaders, handleApiError } from './api';
import type { Trial, TrialApplication } from './types';

/**
 * Public trial fetch via Data API with test user authentication.
 * Loads club relation for payment info linking.
 */
export const getTrialPublic = async (trialObjectId: string): Promise<Trial | null> => {
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/data/Trials/${trialObjectId}?loadRelations=${encodeURIComponent('club')}`,
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
    mapsLink: string;
    price: number;
    minAge: number;
    maxAge: number;
    maxParticipants: number;
    remainingSeats: number;
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

export const getApplicationsForTrial = async (
  trialId: string,
  userToken: string,
): Promise<TrialApplication[]> => {
  const sanitizedId = trialId.replace(/[^a-zA-Z0-9-]/g, '');
  const where = encodeURIComponent(`trial.objectId = '${sanitizedId}'`);
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

export const hasPlayerAppliedToTrial = async (
  trialId: string,
  playerObjectId: string,
  userToken: string,
): Promise<boolean> => {
  const sanitizedTrialId = trialId.replace(/[^a-zA-Z0-9-]/g, '');
  const sanitizedPlayerId = playerObjectId.replace(/[^a-zA-Z0-9-]/g, '');
  const where = encodeURIComponent(`trial.objectId = '${sanitizedTrialId}' AND player.objectId = '${sanitizedPlayerId}'`);
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/data/TrialApplication?where=${where}&pageSize=1`,
    {
      method: 'GET',
      headers: getHeaders(userToken),
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  return Array.isArray(data) && data.length > 0;
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

export const deleteApplication = async (
  applicationId: string,
  userToken: string,
): Promise<void> => {
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/data/TrialApplication/${applicationId}`,
    {
      method: 'DELETE',
      headers: getHeaders(userToken),
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }
};

export const getAllActiveTrials = async (): Promise<Trial[]> => {
  const where = encodeURIComponent('isActive = true');
  const sortBy = encodeURIComponent('trialDateTime%20asc');
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/data/Trials?where=${where}&sortBy=${sortBy}&pageSize=100`,
    {
      method: 'GET',
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getClosestTrial = async (): Promise<Trial | null> => {
  const trials = await getAllActiveTrials();
  if (!trials || trials.length === 0) return null;

  const now = Date.now();
  const futureTrials = trials.filter(trial => trial.trialDateTime && trial.trialDateTime > now);

  if (futureTrials.length === 0) return null;

  // Sort by date and get the closest one
  futureTrials.sort((a, b) => {
    const dateA = a.trialDateTime || 0;
    const dateB = b.trialDateTime || 0;
    return dateA - dateB;
  });

  return futureTrials[0];
};
