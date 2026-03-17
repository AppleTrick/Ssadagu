'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import { MessageType } from '../model/types';

interface PaymentChatBubbleProps {
  type: MessageType;
  message: string;
  sentAt: string | null;
  isMine: boolean;
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

const PaymentChatBubble = ({ type, message, sentAt, isMine }: PaymentChatBubbleProps) => {
  return (
    <Row $isMine={isMine}>
      {!isMine && (
        <Avatar>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={colors.textSecondary}>
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </Avatar>
      )}
      <ContentCol $isMine={isMine}>
        <BubbleRow $isMine={isMine}>
          {isMine && <TimeText>{formatTime(sentAt)}</TimeText>}
          <CardBubble $isMine={isMine}>
            <Title>
              {type === 'PAYMENT_REQUEST' && '싸다구페이 송금요청'}
              {type === 'PAYMENT_SUCCESS' && '싸다구페이 송금완료'}
              {type === 'PAYMENT_FAIL' && '싸다구페이 결제실패'}
            </Title>
            <Divider />
            <Message>{message}</Message>
          </CardBubble>
          {!isMine && <TimeText>{formatTime(sentAt)}</TimeText>}
        </BubbleRow>
      </ContentCol>
    </Row>
  );
};

export default PaymentChatBubble;

const Row = styled.div<{ $isMine: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  align-items: flex-start;
  gap: 8px;
  padding: 4px 16px;
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

const ContentCol = styled.div<{ $isMine: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 75%;
`;

const BubbleRow = styled.div<{ $isMine: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 6px;
`;

const CardBubble = styled.div<{ $isMine: boolean }>`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${({ $isMine }) => ($isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px')};
  padding: 12px 16px;
  min-width: 200px;
`;

const Title = styled.div`
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.bold};
  color: ${colors.primary};
  margin-bottom: 8px;
`;

const Divider = styled.div`
  height: 1px;
  background: ${colors.border};
  margin-bottom: 8px;
`;

const Message = styled.div`
  font-size: ${typography.size.base};
  color: ${colors.textPrimary};
  word-break: break-all;
  white-space: pre-wrap;
`;

const TimeText = styled.span`
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
  flex-shrink: 0;
  line-height: 1;
`;
