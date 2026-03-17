import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ProductSummary } from '../model/types';

export const getProducts = async (accessToken?: string): Promise<ProductSummary[]> => {
  const res = await apiClient.get(
    ENDPOINTS.PRODUCTS.BASE,
    accessToken,
  );

  if (!res.ok) {
    throw new Error('상품 목록을 불러오지 못했습니다.');
  }

  const json = await res.json();
  const allItems = (Array.isArray(json) ? json : (json.data ?? [])) as any[];
  
  return allItems.map((item) => {
    // 상품 응답에서 첫 번째 이미지를 찾아 썸네일로 사용
    const thumbnail = item.images && item.images.length > 0
      ? item.images[0].imageUrl
      : null;

    return {
      id: item.id,
      sellerId: item.sellerId,
      sellerNickname: item.sellerNickname,
      title: item.title,
      description: item.description ?? '',
      price: item.price,
      categoryCode: item.categoryCode ?? '',
      regionName: item.regionName,
      status: item.status,
      wishCount: item.wishCount ?? 0,
      chatCount: item.chatCount ?? 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt ?? '',
      isMine: item.isMine,
      isLiked: item.isLiked,
      thumbnailUrl: thumbnail,
    };
  });
};
