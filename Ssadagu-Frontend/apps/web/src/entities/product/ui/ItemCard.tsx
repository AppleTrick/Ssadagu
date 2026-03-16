'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import type { ProductSummary } from '../model/types';

interface ItemCardProps {
  product: ProductSummary;
  onClick?: () => void;
}

const formatPrice = (price: number) =>
  price.toLocaleString('ko-KR') + '원';

const formatTimeAgo = (dateInput: string | number[] | null | undefined) => {
  if (!dateInput) return '방금 전';
  
  let date: Date;
  if (Array.isArray(dateInput)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
    date = new Date(year, month - 1, day, hour, minute, second);
  } else {
    // Safari 지원 등을 위해 공백을 T로 치환
    const parsedStr = String(dateInput).replace(' ', 'T');
    date = new Date(parsedStr);
  }

  // 파싱 실패 또는 1970년 에포치(null 처리 등)인 경우
  if (isNaN(date.getTime()) || date.getTime() === 0) {
    return '방금 전';
  }

  const diff = Date.now() - date.getTime();
  if (diff < 0) return '방금 전';

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
};

const ItemCard = ({ product, onClick }: ItemCardProps) => {
  return (
    <Card onClick={onClick}>
      <Thumbnail>
        {product.thumbnailUrl ? (
          <ThumbnailImg src={product.thumbnailUrl} alt={product.title} />
        ) : (
          <ThumbnailPlaceholder />
        )}
      </Thumbnail>
      <Info>
        <Title>{product.title}</Title>
        <Meta>
          {product.regionName} · {formatTimeAgo(product.createdAt)}
        </Meta>
        <Bottom>
          <Price>{formatPrice(product.price)}</Price>
          <StatsContainer>
            <StatItem>
              {/* Chat bubble icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill={colors.textSecondary}>
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              {product.chatCount ?? 0}
            </StatItem>
            <StatItem>
              {/* Heart icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill={colors.textSecondary}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {product.wishCount ?? 0}
            </StatItem>
          </StatsContainer>
        </Bottom>
      </Info>
    </Card>
  );
};

export default ItemCard;

const Card = styled.div`
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

const Thumbnail = styled.div`
  width: 100px;
  height: 100px;
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

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-top: 2px;
`;

const Title = styled.p`
  margin: 0;
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const Meta = styled.p`
  margin: 0;
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
  line-height: 1.4;
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
`;

const Price = styled.span`
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
`;

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;
