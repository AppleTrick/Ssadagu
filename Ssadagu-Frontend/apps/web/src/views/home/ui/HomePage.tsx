'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import { HeaderMain } from '@/widgets/header';
import { BottomNav } from '@/widgets/bottom-nav';
import { ProductList } from '@/widgets/product-list';
import { FABWrite } from '@/shared/ui';
import { colors, HEADER_HEIGHT, BOTTOM_NAV_HEIGHT } from '@/shared/styles/theme';
import { usePullToRefresh } from '@/shared/hooks/usePullToRefresh';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  background: ${colors.bg};
`;

const ContentArea = styled.main`
  flex: 1;
  min-height: 0;
  margin-top: ${HEADER_HEIGHT}px;
  margin-bottom: ${BOTTOM_NAV_HEIGHT}px;
  overflow-y: auto;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const PullIndicator = styled.div<{ pullY: number; refreshing: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ pullY }) => pullY}px;
  overflow: hidden;
  color: ${colors.primary};

  svg {
    opacity: ${({ pullY }) => Math.min(pullY / 70, 1)};
    animation: ${({ refreshing }) => (refreshing ? `${spin} 0.8s linear infinite` : 'none')};
  }
`;

export function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [queryClient]);

  const { scrollRef, pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd } =
    usePullToRefresh(handleRefresh);

  return (
    <Page>
      <HeaderMain onSearchChange={setSearchQuery} />
      <ContentArea
        ref={scrollRef as React.RefObject<HTMLElement>}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <PullIndicator pullY={pullY} refreshing={refreshing}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        </PullIndicator>
        <ProductList searchQuery={searchQuery} />
      </ContentArea>
      <FABWrite onClick={() => router.push('/products/new')} />
      <BottomNav />
    </Page>
  );
}
