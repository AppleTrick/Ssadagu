import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getProducts } from '@/entities/product/api/getProducts';
import { aiSearchProducts } from '@/entities/product/api/aiSearchProducts';
import type { ProductPageData } from '@/entities/product/api/aiSearchProducts';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { useMyProfile } from '@/entities/user';
import type { SearchMode } from '@/widgets/header';

const SERVER_PAGE_SIZE = 20;

export const useInfiniteProducts = (searchQuery: string, searchMode: SearchMode = 'sql') => {
  const accessToken = useAuthStore((s: { accessToken: string | null }) => s.accessToken);
  const { data: user } = useMyProfile();
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return useInfiniteQuery<ProductPageData, Error>({
    queryKey: ['products', debouncedQuery, searchMode, accessToken, user?.regionName],
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;

      if (debouncedQuery.trim() && searchMode === 'ai') {
        return aiSearchProducts(accessToken ?? undefined, debouncedQuery, user?.regionName, page, SERVER_PAGE_SIZE);
      } else {
        return getProducts(accessToken ?? undefined, user?.regionName, debouncedQuery.trim() || undefined, page, SERVER_PAGE_SIZE);
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};