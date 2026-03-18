'use client';

import styled from '@emotion/styled';
import { ProductListSkeleton } from '@/entities/product';
import { colors, HEADER_HEIGHT } from '@/shared/styles/theme';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${colors.bg};
`;

const HeaderPlaceholder = styled.div`
  height: ${HEADER_HEIGHT}px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
`;

const Content = styled.main`
  flex: 1;
`;

export default function Loading() {
  return (
    <Page>
      <HeaderPlaceholder />
      <Content>
        <ProductListSkeleton count={10} />
      </Content>
    </Page>
  );
}
