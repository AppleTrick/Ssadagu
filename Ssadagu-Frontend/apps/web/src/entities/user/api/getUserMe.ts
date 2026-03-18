import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { User } from '../model/types';

/**
 * 현재 로그인한 사용자의 정보를 조회합니다.
 */
export const getUserMe = async (accessToken?: string): Promise<User> => {
  const res = await apiClient.get(ENDPOINTS.USERS.ME, accessToken);
  if (!res.ok) {
    throw new Error('사용자 정보를 불러오는데 실패했습니다.');
  }
  const json = await res.json();
  return json.data || json;
};
