import { useQuery } from '@tanstack/react-query';
import { getApplicationsForClub } from '../services/trials';

export const useApplications = (clubObjectId?: string, userToken?: string) =>
  useQuery({
    queryKey: ['clubApplications', clubObjectId],
    queryFn: () => getApplicationsForClub(clubObjectId!, userToken!),
    enabled: !!clubObjectId && !!userToken,
  });
