'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';

interface SellerCardProps {
  sellerId: number;
  sellerNickname: string;
  regionName?: string;
  rating?: number;
}

const SellerCard = ({ sellerId: _sellerId, sellerNickname, regionName, rating: _rating }: SellerCardProps) => {
  return (
    <Container>
      <Avatar>
        <svg width="20" height="20" viewBox="0 0 24 24" fill={colors.textSecondary}>
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      </Avatar>
      <InfoCol>
        <Nickname>{sellerNickname}</Nickname>
        {regionName && <Region>{regionName}</Region>}
      </InfoCol>
    </Container>
  );
};

export default SellerCard;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  background: ${colors.surface};
  padding: 16px 20px;
  border-bottom: 1px solid ${colors.border};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Nickname = styled.span`
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
`;

const Region = styled.span`
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
`;
