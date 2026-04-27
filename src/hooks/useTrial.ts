import { useQuery } from '@tanstack/react-query';
import { getTrialPublic } from '../services/trials';

const trialId = import.meta.env.VITE_TRIAL_OBJECT_ID as string;

export const useTrial = () =>
  useQuery({
    queryKey: ['trial', trialId],
    queryFn: () => getTrialPublic(trialId),
    enabled: !!trialId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
