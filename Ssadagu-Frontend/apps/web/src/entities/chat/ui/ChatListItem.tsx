'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import type { ChatRoom } from '../model/types';

interface ChatListItemProps {
  room: ChatRoom;
  currentUserId?: number;
  onClick?: () => void;
}

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (isToday) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours < 12 ? '오전' : '오후';
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    return `${ampm} ${h}:${m}`;
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const ChatListItem = ({ room, currentUserId, onClick }: ChatListItemProps) => {
  const otherNickname = currentUserId === room.buyerId
    ? room.sellerNickname
    : room.buyerNickname;

  return (
    <Container onClick={onClick}>
      <Avatar>
        <svg width="24" height="24" viewBox="0 0 24 24" fill={colors.textSecondary}>
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      </Avatar>
      <InfoArea>
        <TopRow>
          <NicknameText>{otherNickname}</NicknameText>
          <TimeText>{formatTime(room.lastSentAt)}</TimeText>
        </TopRow>
        <BottomRow>
          <LastMessage>{room.lastMessage ?? ''}</LastMessage>
          {room.unreadCount > 0 && (
            <UnreadBadge>{room.unreadCount > 99 ? '99+' : room.unreadCount}</UnreadBadge>
          )}
        </BottomRow>
      </InfoArea>
    </Container>
  );
};

export default ChatListItem;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
  cursor: pointer;
  &:active {
    background: ${colors.bg};
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${colors.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InfoArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const NicknameText = styled.span`
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
`;

const TimeText = styled.span`
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
  flex-shrink: 0;
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const LastMessage = styled.span`
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const UnreadBadge = styled.span`
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${colors.primary};
  color: ${colors.surface};
  font-size: ${typography.size.xs};
  font-weight: ${typography.weight.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
