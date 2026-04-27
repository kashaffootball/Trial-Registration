export const BACKENDLESS_CONFIG = {
  APP_ID: import.meta.env.VITE_BACKENDLESS_APP_ID || '',
  API_KEY: import.meta.env.VITE_BACKENDLESS_API_KEY || '',
  SERVER_URL: import.meta.env.VITE_BACKENDLESS_SERVER_URL || '',
};

// Test user for authenticated API access (public read requires auth)
const TEST_USER_EMAIL = import.meta.env.VITE_TEST_USER_EMAIL as string;
const TEST_USER_PASSWORD = import.meta.env.VITE_TEST_USER_PASSWORD as string;

let cachedUserToken: string | null = null;

const doLoginTestUser = async (): Promise<string> => {
  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/users/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Backendless-Application-Id': BACKENDLESS_CONFIG.APP_ID,
        'X-Backendless-REST-API-Key': BACKENDLESS_CONFIG.API_KEY,
      },
      body: JSON.stringify({
        login: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new BackendlessError(error.message || 'Test user login failed', response.status);
  }

  const data = await response.json();
  cachedUserToken = data['user-token'] as string;
  return cachedUserToken;
};

export const clearTestUserToken = (): void => {
  cachedUserToken = null;
};

/** Returns true for Backendless "stale/expired token" error codes. */
export const isTokenExpiredError = (err: unknown): boolean => {
  if (err instanceof BackendlessError) {
    return (
      err.code === 3064 ||
      err.code === 3090 ||
      err.message.toLowerCase().includes('not existing user token') ||
      err.message.toLowerCase().includes('relogin')
    );
  }
  return false;
};

export const loginTestUser = async (): Promise<string> => {
  if (cachedUserToken) return cachedUserToken;
  return doLoginTestUser();
};

/**
 * Wraps a fetch call that uses the test-user token.
 * If the server returns a stale-token error it clears the cache and retries once.
 */
export const fetchWithTestAuth = async (
  buildRequest: (token: string) => Promise<Response>,
): Promise<Response> => {
  const token = await loginTestUser();
  const response = await buildRequest(token);

  if (!response.ok) {
    // Clone the response so we can read it for the error check below
    const cloned = response.clone();
    let errorBody: { code?: number; message?: string } = {};
    try { errorBody = await cloned.json(); } catch { /* ignore */ }

    const isStale =
      errorBody.code === 3064 ||
      errorBody.code === 3090 ||
      (errorBody.message || '').toLowerCase().includes('not existing user token');

    if (isStale) {
      clearTestUserToken();
      const freshToken = await doLoginTestUser();
      return buildRequest(freshToken);
    }
  }

  return response;
};

export class BackendlessError extends Error {
  code: number;

  constructor(message: string, code = 0) {
    super(message);
    this.name = 'BackendlessError';
    this.code = code;
  }
}

export const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'An unexpected error occurred';
  let errorCode = response.status;

  try {
    const error = await response.json();
    errorMessage = error.message || error.error || errorMessage;
    errorCode = error.code || errorCode;
  } catch {
    errorMessage = `HTTP Error: ${response.status}`;
  }

  throw new BackendlessError(errorMessage, errorCode);
};

export const getHeaders = (userToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Backendless-Application-Id': BACKENDLESS_CONFIG.APP_ID,
    'X-Backendless-REST-API-Key': BACKENDLESS_CONFIG.API_KEY,
  };

  if (userToken) {
    headers['user-token'] = userToken;
  }

  return headers;
};

export const getFileHeaders = (userToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    'X-Backendless-Application-Id': BACKENDLESS_CONFIG.APP_ID,
    'X-Backendless-REST-API-Key': BACKENDLESS_CONFIG.API_KEY,
  };

  if (userToken) {
    headers['user-token'] = userToken;
  }

  return headers;
};
