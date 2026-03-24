import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ProductSummary } from '../model/types';

export interface ProductPageData {
  content: ProductSummary[];
  hasNext: boolean;
  page: number;
  size: number;
}

export const aiSearchProducts = async (
  accessToken?: string,
  keyword?: string,
  regionName?: string,
  page = 0,
  size = 20,
): Promise<ProductPageData> => {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (regionName) params.append('regionName', regionName);
  params.append('page', String(page));
  params.append('size', String(size));

  const res = await apiClient.get(
    `${ENDPOINTS.PRODUCTS.AI_SEARCH}?${params.toString()}`,
    accessToken,
  );

  if (!res.ok) throw new Error('AI 검색에 실패했습니다.');

  const json = await res.json();
  const items = (Array.isArray(json.content) ? json.content : []) as any[];

  return {
    content: items.map((item) => ({
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
    })),
    hasNext: json.hasNext ?? false,
    page: json.page ?? page,
    size: json.size ?? size,
  };
};