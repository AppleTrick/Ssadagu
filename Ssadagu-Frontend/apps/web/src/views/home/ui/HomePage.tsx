'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from '@emotion/styled';
import { HeaderMain } from '@/widgets/header';
import { BottomNav } from '@/widgets/bottom-nav';
import { ProductList } from '@/widgets/product-list';
import { FABWrite } from '@/shared/ui';
import { colors, HEADER_HEIGHT, BOTTOM_NAV_HEIGHT } from '@/shared/styles/theme';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${colors.bg};
`;

const ContentArea = styled.main`
  flex: 1;
  padding-top: ${HEADER_HEIGHT}px;
  padding-bottom: ${BOTTOM_NAV_HEIGHT}px;
  overflow-y: auto;
`;

export function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Page>
      <HeaderMain onSearchChange={setSearchQuery} />
      <ContentArea>
        <ProductList searchQuery={searchQuery} />
      </ContentArea>
      <FABWrite onClick={() => router.push('/products/new')} />
      <BottomNav />
    </Page>
  );
}
