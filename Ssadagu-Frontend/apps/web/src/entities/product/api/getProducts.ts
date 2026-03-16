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
  
  return allItems.map((item) => ({
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
  }));
};
