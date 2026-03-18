import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { WishItem } from '../model/types';

/**
 * 특정 사용자의 관심 목록을 조회합니다.
 * GET /api/v1/users/{userId}/wishes
 */
export const getUserWishes = async (
  userId: number,
  accessToken?: string,
): Promise<WishItem[]> => {
  const url = ENDPOINTS.USERS.GET_USER_WISHES(userId);
  const res = await apiClient.get(url, accessToken);

  if (!res.ok) {
    throw new Error('관심 목록을 불러오는데 실패했습니다.');
  }

  const json = await res.json();
  return json.data || [];
};
