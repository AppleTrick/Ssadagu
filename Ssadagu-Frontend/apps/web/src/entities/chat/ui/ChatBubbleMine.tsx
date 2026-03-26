'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';

import { MessageType } from '../model/types';

interface ChatBubbleMineProps {
  type?: MessageType;
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

const ChatBubbleMine = ({ type = 'TALK', message, sentAt, imageUrl }: ChatBubbleMineProps) => {
  return (
    <Row>
      <TimeText>{formatTime(sentAt)}</TimeText>
      {type === 'IMAGE' && imageUrl ? (
        <ImageBubble src={getProxyImageUrl(imageUrl)} alt="전송한 이미지" />
      ) : (
        <Bubble>{message}</Bubble>
      )}
    </Row>
  );
};

export default ChatBubbleMine;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 6px;
  padding: 2px 16px;
`;

const Bubble = styled.div`
  max-width: 85%;
  background: ${colors.chatMine};
  color: ${colors.surface};
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.regular};
  line-height: 1.5;
  padding: 10px 14px;
  border-radius: 18px 4px 18px 18px;
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
  width: auto;
  height: auto;
  display: block;
  border-radius: 18px 4px 18px 18px;
`;
