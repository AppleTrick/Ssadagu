import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getProducts } from '@/entities/product/api/getProducts';
import { aiSearchProducts } from '@/entities/product/api/aiSearchProducts';
import type { ProductPageData } from '@/entities/product/api/aiSearchProducts';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { useMyProfile } from '@/entities/user';

const SERVER_PAGE_SIZE = 20;

export const useInfiniteProducts = (searchQuery: string) => {
  const accessToken = useAuthStore((s: { accessToken: string | null }) => s.accessToken);
  const { data: user } = useMyProfile();
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return useInfiniteQuery<ProductPageData, Error>({
    queryKey: ['products', debouncedQuery, accessToken, user?.regionName],
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;

      if (debouncedQuery.trim()) {
        return aiSearchProducts(accessToken ?? undefined, debouncedQuery, user?.regionName, page, SERVER_PAGE_SIZE);
      } else {
        return getProducts(accessToken ?? undefined, user?.regionName, undefined, page, SERVER_PAGE_SIZE);
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: !!accessToken,
    // AI 검색 결과는 5분간 캐시 — 같은 검색어 재입력 시 즉시 표시
    staleTime: 5 * 60 * 1000,
    // 검색어 바뀌는 동안 이전 결과를 흐릿하게 유지 (빈 화면 방지)
    placeholderData: keepPreviousData,
  });
};