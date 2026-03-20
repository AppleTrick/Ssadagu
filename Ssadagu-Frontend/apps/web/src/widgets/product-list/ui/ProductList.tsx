'use client';

import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { ItemCard, type ProductSummary, useInfiniteProducts, ProductListSkeleton } from '@/entities/product';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { typography, colors } from '@/shared/styles/theme';
import { useModalStore } from '@/shared/hooks/useModalStore';
import { FadeIn } from '@/shared/ui';

interface ProductListProps {
  searchQuery?: string;
}

const ListWrapper = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const EmptyWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const FetchMoreIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;

export const ProductList = ({ searchQuery = '' }: ProductListProps) => {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const { alert: showAlert } = useModalStore();
  const queryClient = useQueryClient();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Debug: Log the current token
  useEffect(() => {
    console.log('Current Token:', accessToken);
  }, [accessToken]);


  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteProducts(searchQuery);

  const wishMutation = useMutation({
    mutationFn: async ({ productId, isWished }: { productId: number; isWished: boolean }) => {
      const res = await apiClient.post(
        ENDPOINTS.PRODUCTS.WISH(productId),
        {},
        accessToken ?? undefined,
      );
      if (!res.ok) throw new Error('찜 실패');
      return { productId, isWished: !isWished };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      console.error(err);
      showAlert({ message: '찜하기에 실패했습니다. 다시 시도해주세요.' });
    },
  });

  const handleLikeClick = (e: React.MouseEvent, productId: number, isLiked: boolean) => {
    e.stopPropagation();
    if (!accessToken) {
      showAlert({ message: '로그인이 필요합니다.' });
      return;
    }
    wishMutation.mutate({ productId, isWished: isLiked });
  };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <ProductListSkeleton count={8} />;
  }

  if (isError) {
    return <LoadingWrapper>상품 목록을 불러오지 못했습니다.</LoadingWrapper>;
  }

  const allProducts = data?.pages.flatMap((page) => page.content) || [];

  if (allProducts.length === 0) {
    return (
      <EmptyWrapper>
        {searchQuery ? `'${searchQuery}' 검색 결과가 없습니다.` : '등록된 상품이 없습니다.'}
      </EmptyWrapper>
    );
  }

  return (
    <FadeIn>
      <ListWrapper>
        {allProducts.map((product) => (
          <li key={product.id}>
            <ItemCard 
              product={product} 
              onClick={() => router.push(`/products/${product.id}`)} 
              onWishClick={(e: any) => handleLikeClick(e, product.id, !!product.isLiked)}
            />
          </li>
        ))}
      </ListWrapper>
      <div ref={sentinelRef} style={{ height: 1 }} />
      {isFetchingNextPage && <FetchMoreIndicator>더 불러오는 중...</FetchMoreIndicator>}
    </FadeIn>
  );
};
