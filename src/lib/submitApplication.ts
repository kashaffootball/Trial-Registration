import { BackendlessError, BACKENDLESS_CONFIG, getHeaders } from '../services/api';
import { loginUser, registerUser } from '../services/auth';
import { uploadFile } from '../services/files';
import {
  createPlayerProfileViaService,
  getPlayerProfile,
  setPlayerUserRelation,
} from '../services/profiles';
import { applyForTrial, hasPlayerAppliedToTrial } from '../services/trials';
import type { Player } from '../services/types';

export interface PlayerFormInput {
  email: string;
  mobileNumber: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  city: string;
  height: number;
  weight: number;
  preferredFoot: 'left' | 'right' | 'both';
  position: string;
  profilePic: File;
}


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

export class AccountAlreadyExistsError extends Error {
  constructor() {
    super('This email or mobile number is already registered. Please use different credentials.');
    this.name = 'AccountAlreadyExistsError';
  }
}

export class AlreadyAppliedError extends Error {
  constructor() {
    super('You have already applied for this trial.');
    this.name = 'AlreadyAppliedError';
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
  // Use the user-provided password from the form
  const playerPassword = values.password;

  let user: Record<string, unknown> | undefined;

  // Always attempt registration first.
  // code 3033 = email already registered by us → just login.
  // code for mobile number duplication = also try to login.
  // any other error = email belongs to a real/external account → block.
  try {
    await registerUser({ email: values.email, password: playerPassword, mobileNumber: values.mobileNumber });
  } catch (registerError) {
    if (registerError instanceof BackendlessError) {
      // Handle both email (3033) and mobile number duplication errors
      if (registerError.code === 3033 || registerError.message?.toLowerCase().includes('mobile') || registerError.message?.toLowerCase().includes('duplicate')) {
        // Already registered by us — try to login; if wrong password it's a real account
        try {
          user = (await loginUser({ email: values.email, password: playerPassword })) as Record<string, unknown>;
        } catch (loginError) {
          if (isInvalidLogin(loginError)) throw new AccountAlreadyExistsError();
          throw loginError;
        }
      } else {
        throw new AccountAlreadyExistsError();
      }
    } else {
      throw new AccountAlreadyExistsError();
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

  // 1.2. Check if player has already applied to this trial
  const hasApplied = await hasPlayerAppliedToTrial(trialObjectId, player.objectId, userToken);
  if (hasApplied) {
    throw new AlreadyAppliedError();
  }

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
