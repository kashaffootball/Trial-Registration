import { BackendlessError } from '../services/api';
import { loginUser, registerUser } from '../services/auth';
import { uploadFile } from '../services/files';
import {
  createPlayerProfileViaService,
  getPlayerProfile,
  setPlayerUserRelation,
  updatePlayerProfileViaService,
} from '../services/profiles';
import { applyForTrial } from '../services/trials';
import type { Player } from '../services/types';

export interface PlayerFormInput {
  email: string;
  fullName: string;
  dateOfBirth: string;
  city: string;
  height: number;
  weight: number;
  preferredFoot: 'left' | 'right' | 'both';
  position: string;
  profilePic: File;
}

const DUMMY_PASSWORD = import.meta.env.VITE_DUMMY_PASSWORD as string;

const getToken = (user: Record<string, unknown>): string => {
  const token = (user['user-token'] as string | undefined) ?? (user.userToken as string | undefined);
  if (!token) {
    throw new Error('Missing user token in Backendless login response');
  }
  return token;
};

const isInvalidLogin = (error: unknown): boolean => {
  if (!(error instanceof BackendlessError)) return false;
  return error.code === 3003 || error.message.toLowerCase().includes('invalid login or password');
};

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('This email is already registered. Please use another email.');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

const ensurePlayer = async (
  userId: string,
  userToken: string,
  values: PlayerFormInput,
): Promise<Player> => {
  try {
    return await createPlayerProfileViaService(
      {
        fullName: values.fullName || '',
        dateOfBirth: values.dateOfBirth || '',
        city: values.city || '',
        height: Number.isFinite(values.height) ? values.height : 0,
        weight: Number.isFinite(values.weight) ? values.weight : 0,
        preferredFoot: values.preferredFoot || 'right',
        position: values.position || '',
        bio: '',
        profileImageUrl: '',
      },
      userToken,
    );
  } catch {
    const existing = await getPlayerProfile(userId, userToken);
    if (existing) return existing;
    throw new Error('Unable to create or load player profile.');
  }
};

export const submitApplication = async (
  values: PlayerFormInput,
  trialObjectId: string,
): Promise<void> => {
  if (!DUMMY_PASSWORD) {
    throw new Error('VITE_DUMMY_PASSWORD is required.');
  }

  let user: Record<string, unknown>;

  try {
    user = (await loginUser({ email: values.email, password: DUMMY_PASSWORD })) as Record<string, unknown>;
  } catch (error) {
    // isInvalidLogin = wrong password = user exists but wasn't registered by us
    if (isInvalidLogin(error)) {
      throw new EmailAlreadyRegisteredError();
    }

    // Any other login error = user doesn't exist yet, register them
    try {
      await registerUser({ email: values.email, password: DUMMY_PASSWORD });
    } catch (registerError) {
      // code 3033 = user already exists (race condition), safe to ignore
      if (registerError instanceof BackendlessError && registerError.code !== 3033) {
        throw registerError;
      }
    }

    user = (await loginUser({ email: values.email, password: DUMMY_PASSWORD })) as Record<string, unknown>;
  }

  const userToken = getToken(user);
  const userObjectId = String(user.objectId || '');
  if (!userObjectId) {
    throw new Error('Missing user objectId in Backendless response.');
  }

  // 1. Create player profile first (without image) to get playerObjectId
  const player = await ensurePlayer(userObjectId, userToken, values);

  // 2. Upload profile pic to media/player/{playerObjectId}/
  const uploadPath = `/media/player/${player.objectId}/`;
  const uploaded = await uploadFile(values.profilePic, uploadPath, values.profilePic.name, userToken);
  const profileImageUrl = uploaded.fileURL || '';

  // 3. Update player profile with image URL
  if (profileImageUrl) {
    try {
      await updatePlayerProfileViaService(player.objectId, { profileImageUrl }, userToken);
    } catch (e) {
      console.warn('updatePlayerProfileViaService (image) failed', e);
    }
  }

  // 4. Force the Player.user relation in case Cloud Code didn't link it.
  try {
    await setPlayerUserRelation(player.objectId, userObjectId, userToken);
  } catch (e) {
    console.warn('setPlayerUserRelation failed', e);
  }

  // 5. Apply for trial
  await applyForTrial(player.objectId, trialObjectId, userToken);
};
