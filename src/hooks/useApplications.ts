import { useQuery } from '@tanstack/react-query';
import { getApplicationsForTrial } from '../services/trials';

export const useApplications = (trialId?: string, userToken?: string) =>
  useQuery({
    queryKey: ['trialApplications', trialId],
    queryFn: () => getApplicationsForTrial(trialId!, userToken!),
    enabled: !!trialId && !!userToken,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
