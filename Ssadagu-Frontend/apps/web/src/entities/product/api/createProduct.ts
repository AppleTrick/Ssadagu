import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { CreateProductRequest } from '../model/types';

/**
 * 새로운 상품을 등록합니다.
 * @param productData 등록할 상품 정보
 * @param accessToken 액세스 토큰
 * @returns 등록된 상품의 ID 또는 정보
 */
export const createProduct = async (
  productData: CreateProductRequest,
  accessToken?: string,
) => {
  const res = await apiClient.post(
    ENDPOINTS.PRODUCTS.BASE,
    productData,
    accessToken,
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.message || '상품 등록에 실패했습니다.');
  }

  const json = (await res.json()) as { id?: number; data?: { id?: number } };
  return json;
};
