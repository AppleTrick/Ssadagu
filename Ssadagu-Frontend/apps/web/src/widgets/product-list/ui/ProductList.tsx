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

const AiSearchingBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: ${colors.primaryBg};
  border-bottom: 1px solid ${colors.primaryLight};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.primary};
  font-weight: ${typography.weight.medium};
`;

const Dot = styled.span`
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${colors.primary};
  animation: ai-dot 1.2s infinite ease-in-out;
  &:nth-of-type(2) { animation-delay: 0.2s; }
  &:nth-of-type(3) { animation-delay: 0.4s; }
  @keyframes ai-dot {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1.2); }
  }
`;

const StaleOverlay = styled.div<{ $active: boolean }>`
  opacity: ${({ $active }) => ($active ? 0.4 : 1)};
  transition: opacity 0.2s ease;
  pointer-events: ${({ $active }) => ($active ? 'none' : 'auto')};
`;

export const ProductList = ({ searchQuery = '' }: ProductListProps) => {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const { alert: showAlert } = useModalStore();
  const queryClient = useQueryClient();
  const sentinelRef = useRef<HTMLDivElement | null>(null);



  const { data, isLoading, isFetching, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
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

  // 첫 로딩 (캐시 없음)
  if (isLoading || (!data && !isError)) {
    return <ProductListSkeleton count={8} />;
  }

  if (isError) {
    return <LoadingWrapper>상품 목록을 불러오지 못했습니다.</LoadingWrapper>;
  }

  const allProducts = data?.pages.flatMap((page) => page.content) || [];

  // AI 검색 중인지 (새 검색어로 fetch 진행 중, 이전 데이터는 있음)
  const isAiSearching = isFetching && !isFetchingNextPage && !!searchQuery;

  if (allProducts.length === 0 && !isFetching) {
    return (
      <EmptyWrapper>
        {searchQuery ? `'${searchQuery}' 검색 결과가 없습니다.` : '등록된 상품이 없습니다.'}
      </EmptyWrapper>
    );
  }

  return (
    <>
      {isAiSearching && (
        <AiSearchingBanner>
          <Dot /><Dot /><Dot />
          AI가 검색 중입니다
        </AiSearchingBanner>
      )}
      <StaleOverlay $active={isAiSearching}>
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
      </StaleOverlay>
    </>
  );
};
