import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ProductSummary } from '../model/types';

export const aiSearchProducts = async (
  accessToken?: string,
  keyword?: string,
  regionName?: string,
): Promise<ProductSummary[]> => {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (regionName) params.append('regionName', regionName);

  const res = await apiClient.get(
    `${ENDPOINTS.PRODUCTS.AI_SEARCH}?${params.toString()}`,
    accessToken,
  );

  if (!res.ok) throw new Error('AI 검색에 실패했습니다.');

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
    thumbnailUrl: item.images?.[0]?.imageUrl ?? null,
  }));
};