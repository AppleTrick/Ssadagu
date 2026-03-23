import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getProducts } from '@/entities/product/api/getProducts';
import { aiSearchProducts } from '@/entities/product/api/aiSearchProducts';
import type { ProductSummary } from '@/entities/product/model/types';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { useMyProfile } from '@/entities/user';

interface PageData {
  content: ProductSummary[];
  hasNext: boolean;
  page: number;
}

export const useInfiniteProducts = (searchQuery: string) => {
  const accessToken = useAuthStore((s: { accessToken: string | null }) => s.accessToken);
  const { data: user } = useMyProfile();
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return useInfiniteQuery<PageData, Error>({
    queryKey: ['products', debouncedQuery, accessToken, user?.regionName],
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      let allItems: ProductSummary[];

      if (debouncedQuery.trim()) {
        // AI 키워드 확장 검색
        allItems = await aiSearchProducts(accessToken ?? undefined, debouncedQuery, user?.regionName);
      } else {
        // 일반 목록 조회 (지역 필터링)
        const rawItems = await getProducts(accessToken ?? undefined, user?.regionName);
        allItems = user?.regionName?.trim()
          ? rawItems.filter(item => item.regionName === user.regionName)
          : rawItems;
      }

      const PAGE_SIZE = 10;
      const start = page * PAGE_SIZE;
      const end = start + PAGE_SIZE;

      return {
        content: allItems.slice(start, end),
        hasNext: end < allItems.length,
        page,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: !!accessToken && !!user?.regionName,
  });
};
