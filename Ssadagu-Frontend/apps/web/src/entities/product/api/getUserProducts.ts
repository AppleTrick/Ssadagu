import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ProductSummary } from '../model/types';

/**
 * 특정 사용자의 판매 중인 상품 목록을 조회합니다.
 */
export const getUserProducts = async (
  userId: number,
  accessToken?: string
): Promise<ProductSummary[]> => {
  const url = ENDPOINTS.USERS.GET_USER_PRODUCTS(userId);
  const res = await apiClient.get(url, accessToken);

  if (!res.ok) {
    throw new Error('사용자의 판매 내역을 불러오는데 실패했습니다.');
  }

  const json = await res.json();
  const products = json.data || [];

  // API 응답 데이터가 images 배열인 경우 첫 번째 이미지를 thumbnailUrl로 매핑
  return products.map((p: any) => ({
    ...p,
    thumbnailUrl: p.thumbnailUrl || (p.images && p.images.length > 0 ? p.images[0].imageUrl : null),
  }));
};
