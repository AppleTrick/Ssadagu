'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { User } from '../model/types';

/**
 * 사용자 프로필 정보를 조회하는 훅 (엔터티 계층)
 */
export function useUserProfile(userId: number | null, accessToken: string | null) {
  return useQuery<User>({
    queryKey: ['myProfile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('사용자 ID가 없습니다.');
      const res = await apiClient.get(ENDPOINTS.USERS.PROFILE(userId), accessToken ?? undefined);
      if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
      const json: any = await res.json();
      return json.data || json;
    },
    enabled: !!accessToken && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
