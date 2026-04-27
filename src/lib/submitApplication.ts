import { BackendlessError, BACKENDLESS_CONFIG, getHeaders } from '../services/api';
import { loginUser, registerUser } from '../services/auth';
import { uploadFile } from '../services/files';
import {
  createPlayerProfileViaService,
  getPlayerProfile,
  setPlayerUserRelation,
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

/**
 * Generates a cryptographically strong random password (20 chars).
 * Each player account gets a unique password generated at registration time.
 */
const generateStrongPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const array = new Uint32Array(20);
  crypto.getRandomValues(array);
  for (let i = 0; i < 20; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
};

const patchPlayerImage = async (playerObjectId: string, profileImageUrl: string, userToken: string): Promise<void> => {
  await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/data/Players/${playerObjectId}`,
    {
      method: 'PUT',
      headers: getHeaders(userToken),
      body: JSON.stringify({ profileImageUrl }),
    },
  );
};

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
  // Generate a unique strong password for this user account (only used at reg/login time)
  const playerPassword = generateStrongPassword();

  let user: Record<string, unknown> | undefined;

  // Always attempt registration first.
  // code 3033 = email already registered by us → just login.
  // any other error = email belongs to a real/external account → block.
  try {
    await registerUser({ email: values.email, password: playerPassword });
  } catch (registerError) {
    if (registerError instanceof BackendlessError && registerError.code === 3033) {
      // Already registered by us — try to login; if wrong password it's a real account
      try {
        user = (await loginUser({ email: values.email, password: playerPassword })) as Record<string, unknown>;
      } catch (loginError) {
        if (isInvalidLogin(loginError)) throw new EmailAlreadyRegisteredError();
        throw loginError;
      }
    } else {
      throw new EmailAlreadyRegisteredError();
    }
  }

  // If registration succeeded, login now
  if (!user) {
    user = (await loginUser({ email: values.email, password: playerPassword })) as Record<string, unknown>;
  }

  const userToken = getToken(user as Record<string, unknown>);
  const userObjectId = String(user.objectId || '');
  if (!userObjectId) {
    throw new Error('Missing user objectId in Backendless response.');
  }

  // 1. Create player profile first (without image) to get playerObjectId
  const player = await ensurePlayer(userObjectId, userToken, values);

  // 2. Upload profile pic to media/player/{playerObjectId}/
  const uploadPath = `/media/players/${player.objectId}/`;
  const uploaded = await uploadFile(values.profilePic, uploadPath, values.profilePic.name, userToken);
  const profileImageUrl = uploaded.fileURL || '';

  // 3. Update player profile with image URL directly via Data API (user owns their own record)
  if (profileImageUrl) {
    try {
      await patchPlayerImage(player.objectId, profileImageUrl, userToken);
    } catch (e) {
      console.warn('patchPlayerImage failed', e);
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
