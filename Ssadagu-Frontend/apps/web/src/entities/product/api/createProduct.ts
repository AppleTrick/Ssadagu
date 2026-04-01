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
  const { images, ...requestDto } = productData;
  const formData = new FormData();
  formData.append(
    'request',
    new Blob([JSON.stringify(requestDto)], { type: 'application/json' })
  );

  if (images && images.length > 0) {
    images.forEach((file) => {
      formData.append('images', file);
    });
  }

  const res = await apiClient.postMultipart(
    ENDPOINTS.PRODUCTS.BASE,
    formData,
    accessToken,
  );

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error('사진 용량이 너무 큽니다. (최대 10MB)');
    }
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.message || '상품 등록에 실패했습니다.');
  }

  const json = (await res.json()) as { id?: number; data?: { id?: number } };
  return json;
};
