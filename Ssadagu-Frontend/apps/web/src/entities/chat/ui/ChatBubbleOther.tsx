'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';

import { MessageType } from '../model/types';

interface ChatBubbleOtherProps {
  type?: MessageType;
  senderNickname: string;
  message: string;
  sentAt: string | null;
  imageUrl?: string | null;
}

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours < 12 ? '오전' : '오후';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  return `${ampm} ${h}:${m}`;
};

import { getProxyImageUrl } from '@/shared/utils';

const ChatBubbleOther = ({ type = 'TALK', senderNickname, message, sentAt, imageUrl }: ChatBubbleOtherProps) => {
  return (
    <Row>
      <Avatar>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={colors.textSecondary}>
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      </Avatar>
      <ContentCol>
        <Nickname>{senderNickname}</Nickname>
        <BubbleRow>
          {type === 'IMAGE' && imageUrl ? (
            <ImageBubble src={getProxyImageUrl(imageUrl)} alt="전송받은 이미지" />
          ) : (
            <Bubble>{message}</Bubble>
          )}
          <TimeText>{formatTime(sentAt)}</TimeText>
        </BubbleRow>
      </ContentCol>
    </Row>
  );
};

export default ChatBubbleOther;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  padding: 2px 16px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${colors.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
`;

const ContentCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
`;

const Nickname = styled.span`
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
  font-weight: ${typography.weight.medium};
`;

const BubbleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 6px;
`;

const Bubble = styled.div`
  background: ${colors.chatOther};
  color: ${colors.textPrimary};
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.regular};
  line-height: 1.5;
  padding: 10px 14px;
  border-radius: 4px 18px 18px 18px;
  word-break: break-word;
  white-space: pre-wrap;
`;

const TimeText = styled.span`
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
  flex-shrink: 0;
  line-height: 1;
`;

const ImageBubble = styled.img`
  max-width: 200px;
  max-height: 260px;
  border-radius: 4px 18px 18px 18px;
  object-fit: cover;
`;
