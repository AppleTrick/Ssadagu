'use client';

import styled from '@emotion/styled';
import { colors, typography, shadows } from '@/shared/styles/theme';

interface ChatRoomItemSummaryProps {
  productId: number;
  productTitle: string;
  productThumbnailUrl: string | null;
  price: number;
  status: string;
}

const formatPrice = (price: number) =>
  price.toLocaleString('ko-KR') + '원';

const statusLabel: Record<string, string> = {
  ON_SALE: '판매중',
  RESERVED: '예약중',
  SOLD: '거래완료',
  DELETED: '삭제됨',
};

import { getProxyImageUrl } from '@/shared/utils';

const ChatRoomItemSummary = ({
  productId: _productId,
  productTitle,
  productThumbnailUrl,
  price,
  status,
}: ChatRoomItemSummaryProps) => {
  return (
    <Container>
      <Thumbnail>
        {productThumbnailUrl ? (
          <ThumbnailImg src={getProxyImageUrl(productThumbnailUrl)} alt={productTitle} />
        ) : (
          <ThumbnailPlaceholder />
        )}
      </Thumbnail>
      <InfoCol>
        <Title>{productTitle}</Title>
        <MetaRow>
          <StatusBadge>{statusLabel[status] ?? status}</StatusBadge>
          <PriceText>{formatPrice(price)}</PriceText>
        </MetaRow>
      </InfoCol>
    </Container>
  );
};

export default ChatRoomItemSummary;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  background: ${colors.surface};
  padding: 12px 16px;
  border-bottom: 1px solid ${colors.border};
  box-shadow: ${shadows.sm};
`;

const Thumbnail = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: ${colors.bg};
`;

const ThumbnailImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${colors.bg};
`;

const InfoCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Title = styled.p`
  margin: 0;
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.span`
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
  background: ${colors.bg};
  padding: 2px 6px;
  border-radius: 4px;
`;

const PriceText = styled.span`
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
`;
