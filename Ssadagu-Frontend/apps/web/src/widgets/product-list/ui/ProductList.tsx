'use client';

import { useEffect, useRef, useCallback, memo } from 'react';
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

const MemoizedItem = memo(({ product, onNavigate, onLikeClick }: {
  product: ProductSummary;
  onNavigate: (path: string) => void;
  onLikeClick: (e: React.MouseEvent, productId: number, isLiked: boolean) => void;
}) => (
  <li>
    <ItemCard
      product={product}
      onClick={() => onNavigate(`/products/${product.id}`)}
      onWishClick={(e: React.MouseEvent) => onLikeClick(e, product.id, !!product.isLiked)}
    />
  </li>
));

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

  const handleLikeClick = useCallback((e: React.MouseEvent, productId: number, isLiked: boolean) => {
    e.stopPropagation();
    if (!accessToken) {
      showAlert({ message: '로그인이 필요합니다.' });
      return;
    }
    wishMutation.mutate({ productId, isWished: isLiked });
  }, [accessToken, showAlert, wishMutation]);

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

  if (isLoading || isFetchingNextPage && !data) {
    return <ProductListSkeleton count={8} />;
  }
  
  // 데이터가 로딩 중도 아닌데 캐시가 비어있고 에러가 없다면 아직 queryKey 조건(user?.regionName) 때문에 멈춰있는 상태임
  if (!isLoading && !data && !isError) {
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
          <MemoizedItem
            key={product.id}
            product={product}
            onNavigate={router.push}
            onLikeClick={handleLikeClick}
          />
        ))}
      </ListWrapper>
      <div ref={sentinelRef} style={{ height: 1 }} />
      {isFetchingNextPage && <FetchMoreIndicator>더 불러오는 중...</FetchMoreIndicator>}
    </FadeIn>
  );
};
