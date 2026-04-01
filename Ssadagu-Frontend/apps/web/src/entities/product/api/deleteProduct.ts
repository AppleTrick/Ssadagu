import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

/**
 * 상품을 삭제합니다.
 * @param productId 삭제할 상품 ID
 * @param accessToken 액세스 토큰
 */
export const deleteProduct = async (
  productId: number,
  accessToken?: string,
): Promise<void> => {
  const res = await apiClient.delete(
    ENDPOINTS.PRODUCTS.DETAIL(productId),
    accessToken,
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.message || '상품 삭제에 실패했습니다.');
  }
};
