import { useInfiniteQuery } from '@tanstack/react-query';
import { getProducts } from '@/entities/product/api/getProducts';
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

  return useInfiniteQuery<PageData, Error>({
    queryKey: ['products', searchQuery, accessToken, user?.regionName],
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      
      const allItems = await getProducts(accessToken ?? undefined, user?.regionName);
      
      const regionFilter = user?.regionName?.trim() 
        ? allItems.filter(item => item.regionName === user.regionName) 
        : allItems;

      const filtered = searchQuery
        ? regionFilter.filter((item: ProductSummary) => {
            const lowerQ = searchQuery.toLowerCase();
            return (
              item.title?.toLowerCase().includes(lowerQ) ||
              (item as any).description?.toLowerCase().includes(lowerQ)
            );
          })
        : regionFilter;

      const PAGE_SIZE = 10;
      const start = page * PAGE_SIZE;
      const end = start + PAGE_SIZE;

      const content = filtered.slice(start, end);

      return {
        content,
        hasNext: end < filtered.length,
        page,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: !!accessToken,
  });
};
