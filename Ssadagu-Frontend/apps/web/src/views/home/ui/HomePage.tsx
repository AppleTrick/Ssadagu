'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import styled from '@emotion/styled';
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
  position: relative;
`;

const PullIndicator = styled.div<{ pullY: number; refreshing: boolean }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(${({ pullY, refreshing }) => refreshing ? 8 : pullY - 36}px);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${colors.surface};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${({ refreshing }) => refreshing ? 'transform 0.2s' : 'none'};
  z-index: 10;
  pointer-events: none;
`;

const SpinnerSvg = styled.svg<{ spin: boolean }>`
  animation: ${({ spin }) => spin ? 'ptr-spin 0.7s linear infinite' : 'none'};
  @keyframes ptr-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const { scrollRef, pullY, progress, refreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const showIndicator = pullY > 4 || refreshing;

  return (
    <Page>
      <HeaderMain onSearchChange={setSearchQuery} />
      <ContentArea ref={scrollRef as React.RefObject<HTMLDivElement>}>
        {showIndicator && (
          <PullIndicator pullY={pullY} refreshing={refreshing}>
            <SpinnerSvg
              spin={refreshing}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.primary}
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              {refreshing ? (
                <path d="M12 2a10 10 0 1 0 10 10" />
              ) : (
                <path
                  d="M12 5v14M5 12l7-7 7 7"
                  strokeOpacity={Math.max(0.2, progress)}
                />
              )}
            </SpinnerSvg>
          </PullIndicator>
        )}
        <ProductList searchQuery={searchQuery} />
      </ContentArea>
      <FABWrite onClick={() => router.push('/products/new')} />
      <BottomNav />
    </Page>
  );
}
