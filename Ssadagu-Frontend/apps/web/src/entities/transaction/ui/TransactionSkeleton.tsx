'use client';

import styled from '@emotion/styled';
import { Skeleton } from '@/shared/ui';
import { colors } from '@/shared/styles/theme';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
`;

const InfoCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const TransactionSkeleton = () => {
  return (
    <Container>
      <Skeleton width={64} height={64} boxRadius="8px" />
      <InfoCol>
        <Skeleton width="60%" height={18} />
        <Skeleton width="20%" height={14} />
        <Skeleton width="30%" height={18} />
      </InfoCol>
      <Skeleton width={50} height={24} boxRadius="4px" />
    </Container>
  );
};

export const TransactionListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TransactionSkeleton key={i} />
      ))}
    </>
  );
};
