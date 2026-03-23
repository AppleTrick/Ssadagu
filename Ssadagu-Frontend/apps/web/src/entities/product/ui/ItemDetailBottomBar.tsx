'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import type { Product } from '../model/types';

interface ItemDetailBottomBarProps {
  product: Product;
  isMine: boolean;
  isWished: boolean;
  onWish?: () => void;
  onChat?: () => void;
  onBuy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  bottomOffset?: number;
}

const formatPrice = (price: number) =>
  price.toLocaleString('ko-KR') + '원';

const ItemDetailBottomBar = ({
  product,
  isMine,
  isWished,
  onWish,
  onChat,
  onBuy,
  onEdit,
  onDelete,
  bottomOffset = 0,
}: ItemDetailBottomBarProps) => {
  const isSold = product.status === 'SOLD';
  const isReserved = product.status === 'RESERVED';

  return (
    <Bar $bottomOffset={bottomOffset}>
      <Left>
        <WishButton onClick={onWish} aria-label="찜하기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isWished ? colors.red : 'none'} stroke={isWished ? colors.red : colors.textPrimary} strokeWidth="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </WishButton>
        <Divider />
        <PriceText>{formatPrice(product.price)}</PriceText>
      </Left>
      <Right>
        {isMine ? (
          <StatusLabel>
            {isSold ? '거래 완료' : '판매 중'}
          </StatusLabel>
        ) : (
          <>
            <ChatButton 
              onClick={!isSold ? onChat : undefined} 
              disabled={isSold}
              style={{
                background: isSold ? colors.disabled : colors.primary,
                cursor: !isSold ? 'pointer' : 'default',
              }}
            >
              {isSold ? '거래 완료' : isReserved ? '거래 중' : '채팅하기'}
            </ChatButton>
            {onBuy && (
              <BuyButton 
                onClick={product.status === 'ON_SALE' ? onBuy : undefined} 
                disabled={product.status !== 'ON_SALE'}
              >
                {isSold ? '거래 완료' : isReserved ? '거래 중' : '구매하기'}
              </BuyButton>
            )}
          </>
        )}
      </Right>
    </Bar>
  );
};

export default ItemDetailBottomBar;

const StatusLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  min-width: 100px;
  padding: 0 20px;
  background: ${colors.bg};
  color: ${colors.textSecondary};
  border-radius: 8px;
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.semibold};
`;

const Bar = styled.div<{ $bottomOffset: number }>`
  position: fixed;
  bottom: ${({ $bottomOffset }) => $bottomOffset}px;
  left: 0;
  right: 0;
  height: 68px;
  background: ${colors.surface};
  border-top: 1px solid ${colors.border};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WishButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Divider = styled.div`
  width: 1px;
  height: 20px;
  background: ${colors.border};
`;

const PriceText = styled.span`
  font-size: ${typography.size.lg};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
`;

const Right = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ChatButton = styled.button`
  height: 44px;
  padding: 0 20px;
  background: ${colors.primary};
  color: ${colors.surface};
  border: none;
  border-radius: 8px;
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.medium};
  cursor: pointer;

  &:disabled {
    background: ${colors.disabled};
    cursor: not-allowed;
  }
`;

const BuyButton = styled.button`
  height: 44px;
  padding: 0 20px;
  background: ${colors.textPrimary};
  color: ${colors.surface};
  border: none;
  border-radius: 8px;
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.medium};
  cursor: pointer;

  &:disabled {
    background: ${colors.disabled};
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
  font-weight: ${typography.weight.medium};
`;
