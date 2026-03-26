'use client';

import styled from '@emotion/styled';
import { colors } from '@/shared/styles/theme';
import { Skeleton } from '@/shared/ui/Skeleton';

const ChatListSkeletonItem = () => {
  return (
    <Container>
      <Skeleton width={48} height={48} circle />
      <InfoArea>
        <TopRow>
          <Skeleton width={120} height={20} />
          <Skeleton width={40} height={16} />
        </TopRow>
        <BottomRow>
          <Skeleton width="80%" height={18} />
        </BottomRow>
      </InfoArea>
    </Container>
  );
};

export const ChatListSkeleton = () => {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <ChatListSkeletonItem key={i} />
      ))}
    </>
  );
};

export default ChatListSkeleton;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
`;

const InfoArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
`;
