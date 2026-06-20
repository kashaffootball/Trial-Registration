import { useQuery } from '@tanstack/react-query';
import { getClosestTrial } from '../services/trials';

export const useTrial = () =>
  useQuery({
    queryKey: ['trial', 'closest'],
    queryFn: () => getClosestTrial(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
