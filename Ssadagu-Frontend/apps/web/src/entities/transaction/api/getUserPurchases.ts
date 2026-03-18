import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { Purchase } from '../model/types';

/**
 * 특정 사용자의 구매 내역을 조회합니다.
 * GET /api/v1/users/{userId}/purchases
 */
export const getUserPurchases = async (
  userId: number,
  accessToken?: string,
): Promise<Purchase[]> => {
  const url = ENDPOINTS.USERS.GET_USER_PURCHASES(userId);
  const res = await apiClient.get(url, accessToken);

  if (!res.ok) {
    throw new Error('구매 내역을 불러오는데 실패했습니다.');
  }

  const json = await res.json();
  return json.data || [];
};
