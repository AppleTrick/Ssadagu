import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ProductDetail } from '../model/types';

/**
 * 상품 상세 정보를 조회합니다.
 * @param productId 상품 ID
 * @param accessToken (Optional) 액세스 토큰
 * @returns 상품 상세 정보
 */
export const getProduct = async (
  productId: number,
  accessToken?: string,
): Promise<ProductDetail> => {
  const res = await apiClient.get(
    ENDPOINTS.PRODUCTS.DETAIL(productId),
    accessToken,
  );

  if (!res.ok) {
    throw new Error('상품 정보를 불러오지 못했습니다.');
  }

  const data = (await res.json()) as ProductDetail;
  return data;
};
