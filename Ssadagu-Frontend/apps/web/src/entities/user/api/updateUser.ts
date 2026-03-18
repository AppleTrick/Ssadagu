import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { User } from '../model/types';

export interface UpdateUserRequest {
  nickname?: string;
  profileImageUrl?: string;
}

/**
 * 사용자 정보를 수정합니다.
 * PATCH /api/v1/users/me
 */
export const updateUser = async (
  data: UpdateUserRequest,
  accessToken?: string,
): Promise<User> => {
  const res = await apiClient.patch(ENDPOINTS.USERS.ME, data, accessToken);

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as any;
    throw new Error(body.message || '사용자 정보 수정에 실패했습니다.');
  }

  const json = await res.json();
  return json.data || json;
};
