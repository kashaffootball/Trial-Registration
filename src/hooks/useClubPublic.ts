import { useQuery } from '@tanstack/react-query';
import { getClubByObjectId } from '../services/profiles';

export const useClubPublic = (clubObjectId?: string, userToken?: string) =>
  useQuery({
    queryKey: ['clubPublic', clubObjectId],
    queryFn: () => getClubByObjectId(clubObjectId!, userToken!),
    enabled: !!clubObjectId && !!userToken,
  });
