'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import type { Transaction, TransactionStatus } from '../model/types';
import { getProxyImageUrl } from '@/shared/utils';

interface HistoryItemCardProps {
  transaction: Transaction;
  role: 'buyer' | 'seller';
  onClick?: () => void;
}

const formatPrice = (price: number) =>
  price.toLocaleString('ko-KR') + '원';

const statusConfig: Record<TransactionStatus, { label: string; color: string; bg: string }> = {
  SUCCESS: { label: '거래완료', color: colors.success, bg: colors.successBg },
  COMPLETED: { label: '거래완료', color: colors.success, bg: colors.successBg },
  PENDING: { label: '진행중', color: colors.warning, bg: colors.warningBg },
  FAILED: { label: '실패', color: colors.red, bg: '#FFF1F2' },
  CANCELLED: { label: '취소됨', color: colors.textSecondary, bg: colors.bg },
};

const HistoryItemCard = ({ transaction, role, onClick }: HistoryItemCardProps) => {
  const status = statusConfig[transaction.status] ?? {
    label: transaction.status,
    color: colors.textSecondary,
    bg: colors.bg,
  };

  return (
    <Container onClick={onClick}>
      <ThumbnailWrapper>
        {transaction.productImageUrl ? (
          <Thumbnail src={getProxyImageUrl(transaction.productImageUrl)} alt={transaction.productTitle} />
        ) : (
          <EmptyThumbnail />
        )}
      </ThumbnailWrapper>
      <InfoCol>
        <ProductTitle>{transaction.productTitle}</ProductTitle>
        <RoleLabel>{role === 'buyer' ? '구매' : '판매'}</RoleLabel>
        <Amount>{formatPrice(transaction.amount)}</Amount>
      </InfoCol>
      <StatusBadge color={status.color} bg={status.bg}>
        {status.label}
      </StatusBadge>
    </Container>
  );
};

export default HistoryItemCard;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
  cursor: pointer;
  &:active {
    background: ${colors.bg};
  }
`;

const ThumbnailWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background: ${colors.bg};
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const EmptyThumbnail = styled.div`
  width: 100%;
  height: 100%;
  background: ${colors.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  &::after {
    content: '📦';
    font-size: 24px;
  }
`;

const InfoCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ProductTitle = styled.p`
  margin: 0;
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RoleLabel = styled.span`
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
`;

const Amount = styled.span`
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  margin-top: 2px;
`;

const StatusBadge = styled.span<{ color: string; bg: string }>`
  font-size: ${typography.size.xs};
  font-weight: ${typography.weight.medium};
  color: ${({ color }) => color};
  background: ${({ bg }) => bg};
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
`;
