import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { User } from './types';
import { useAuthStore } from '@/shared/auth/useAuthStore';

interface UserResponse {
  data?: User;
}

export const useMyProfile = () => {
  const { accessToken, userId } = useAuthStore();

  return useQuery<User>({
    queryKey: ['myProfile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('계정 정보가 없습니다. 다시 로그인해주세요.');
      
      const res = await apiClient.get(
        ENDPOINTS.USERS.PROFILE(userId),
        accessToken ?? undefined,
      );
      if (!res.ok) throw new Error('프로필을 불러오지 못했습니다.');
      
      const json = (await res.json()) as any;
      
      let userObj = json.data ? json.data : json;
      
      // Backend returns 'region', frontend expects 'regionName'
      if (userObj.region && !userObj.regionName) {
        userObj.regionName = userObj.region;
      }

      return userObj as User;
    },
    enabled: !!accessToken && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
