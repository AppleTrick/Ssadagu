import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { UpdateProductRequest, ProductDetail } from '../model/types';

/**
 * 상품 정보를 수정합니다.
 * @param productId 상품 ID
 * @param productData 수정할 데이터
 * @param accessToken 액세스 토큰
 * @returns 수정된 상품 정보
 */
export const updateProduct = async (
  productId: number,
  productData: UpdateProductRequest,
  accessToken?: string,
): Promise<ProductDetail> => {
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

  const res = await apiClient.patchMultipart(
    ENDPOINTS.PRODUCTS.DETAIL(productId),
    formData,
    accessToken,
  );

  // Note: 사용자가 제공한 스펙에 맞춰 구현함.
  // 일반적으로 수정은 PUT/PATCH를 사용하지만, apiClient.post를 사용하여 
  // 기존 관습(createProduct)을 따르거나 백엔드 스펙이 POST라면 이를 유지함.
  // 만약 PUT이 필요하다면 apiClient에 put을 추가해야 함.
  
  if (!res.ok) {
    if (res.status === 413) {
      throw new Error('사진 용량이 너무 큽니다. (최대 10MB)');
    }
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.message || '상품 수정에 실패했습니다.');
  }

  const json = (await res.json()) as ProductDetail;
  return json;
};
