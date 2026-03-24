import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ProductPageData } from './aiSearchProducts';

export const getProducts = async (
  accessToken?: string,
  regionName?: string,
  keyword?: string,
  page = 0,
  size = 20,
): Promise<ProductPageData> => {
  const params = new URLSearchParams();
  if (regionName) params.append('regionName', regionName);
  if (keyword) params.append('keyword', keyword);
  params.append('page', String(page));
  params.append('size', String(size));

  const res = await apiClient.get(
    `${ENDPOINTS.PRODUCTS.BASE}?${params.toString()}`,
    accessToken,
  );

  if (!res.ok) {
    throw new Error('상품 목록을 불러오지 못했습니다.');
  }

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