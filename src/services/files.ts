import { BACKENDLESS_CONFIG, getFileHeaders, handleApiError } from './api';
import type { FileUploadResult } from './types';

export const uploadFile = async (
  file: File,
  remotePath: string,
  fileName: string,
  userToken: string,
): Promise<FileUploadResult> => {
  const formData = new FormData();
  formData.append('file', file, fileName);

  const response = await fetch(
    `${BACKENDLESS_CONFIG.SERVER_URL}/api/files${remotePath}${fileName}`,
    {
      method: 'POST',
      headers: getFileHeaders(userToken),
      body: formData,
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};
