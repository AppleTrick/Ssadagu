'use client';

import styled from '@emotion/styled';
import { Skeleton } from '@/shared/ui';
import { colors } from '@/shared/styles/theme';

const Card = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
`;

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
`;

/**
 * ItemCard의 로딩 상태를 위한 스켈레톤 컴포넌트입니다.
 */
export const ProductSkeleton = ({ size = 100 }: { size?: number }) => {
  return (
    <Card>
      <Skeleton width={size} height={size} boxRadius="8px" />
      <Info>
        <Skeleton width="80%" height={20} />
        <Skeleton width="40%" height={16} />
        <Bottom>
          <Skeleton width={80} height={20} />
        </Bottom>
      </Info>
    </Card>
  );
};

/**
 * 상품 상세 페이지의 로딩 상태를 위한 스켈레톤 컴포넌트입니다.
 */
export const ProductDetailSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Skeleton width="100%" height={300} boxRadius="0" />
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton width={40} height={40} circle />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <Skeleton width="40%" height={16} />
          <Skeleton width="20%" height={12} />
        </div>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: `1px solid ${colors.border}` }}>
        <Skeleton width="70%" height={24} />
        <Skeleton width="30%" height={24} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <Skeleton width="100%" height={16} />
          <Skeleton width="100%" height={16} />
          <Skeleton width="60%" height={16} />
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        <Skeleton width="100%" height={180} boxRadius="12px" />
      </div>
    </div>
  );
};

/**
 * 여러 개의 상품 스켈레톤을 렌더링하는 리스트 컴포넌트입니다.
 */
export const ProductListSkeleton = ({
  count = 5,
  size = 100,
}: {
  count?: number;
  size?: number;
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} size={size} />
      ))}
    </>
  );
};
