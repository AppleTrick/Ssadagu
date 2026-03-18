import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import type { ChatMessage, TransactionContent } from '@/entities/chat/model/types';
import { getProxyImageUrl } from '@/shared/utils';

interface TransactionBubbleProps {
  message: ChatMessage;
  isMyMessage: boolean;
  productThumbnailUrl?: string | null;
  onCancel?: () => void;
  onReject?: () => void;
  onAccept?: () => void;
}

const TransactionBubble = ({ message, isMyMessage, productThumbnailUrl, onCancel, onReject, onAccept }: TransactionBubbleProps) => {
  let contentData: TransactionContent = {};
  try {
    contentData = JSON.parse(message.content);
  } catch (e) {
    // JSON 파싱 실패시 빈 객체
  }

  const { price, time, locationName } = contentData;
  const msgType = (message as any).type || message.messageType || 'PAYMENT_REQUEST';

  const isRequest = msgType === 'PAYMENT_REQUEST';
  const isSuccess = msgType === 'PAYMENT_SUCCESS';
  const isFail = msgType === 'PAYMENT_FAIL';

  let statusColor: string = colors.warning;
  let statusText = '수락 대기 중...';
  if (isSuccess) {
    statusColor = colors.primary;
    statusText = '거래수락 완료';
  } else if (isFail) {
    statusColor = colors.red;
    statusText = '요청이 취소/거절되었습니다.';
  }

  return (
    <Container $isMyMessage={isMyMessage}>
      <Header $isMyMessage={isMyMessage}>거래요청</Header>
      
      <CardBody>
        {productThumbnailUrl ? (
          <Thumbnail $isMyMessage={isMyMessage} src={getProxyImageUrl(productThumbnailUrl)} alt="상품" />
        ) : (
          <ThumbPlaceholder $isMyMessage={isMyMessage} />
        )}
        <Info>
          <ItemTitle $isMyMessage={isMyMessage}>거래 상품 정보</ItemTitle>
          <Price $isMyMessage={isMyMessage}>{price?.toLocaleString() || 0}원</Price>
          <Details $isMyMessage={isMyMessage}>
            {locationName} · {time}
          </Details>
        </Info>
      </CardBody>

      <StatusSection>
        <StatusText $isMyMessage={isMyMessage}>
          <Dot $color={statusColor} /> {statusText}
        </StatusText>
      </StatusSection>

      {isRequest && (
        <ActionSection>
          {isMyMessage ? (
            <Button $isMyMessage={isMyMessage} onClick={onCancel}>
              <IconWrapper>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </IconWrapper>
              요청 취소
            </Button>
          ) : (
            <ButtonGroup>
              <RejectButton onClick={onReject}>거절</RejectButton>
              <AcceptButton onClick={onAccept}>수락</AcceptButton>
            </ButtonGroup>
          )}
        </ActionSection>
      )}
    </Container>
  );
};

export default TransactionBubble;

const Container = styled.div<{ $isMyMessage: boolean }>`
  width: 260px;
  background: ${({ $isMyMessage }) => ($isMyMessage ? colors.primary : 'white')};
  border: ${({ $isMyMessage }) => ($isMyMessage ? 'none' : `1px solid ${colors.border}`)};
  border-radius: 16px;
  padding: 16px;
  display: flex; flex-direction: column;
`;

const Header = styled.div<{ $isMyMessage: boolean }>`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.bold};
  color: ${({ $isMyMessage }) => ($isMyMessage ? 'white' : colors.textPrimary)};
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ $isMyMessage }) => ($isMyMessage ? 'rgba(255, 255, 255, 0.2)' : colors.border)};
`;

const CardBody = styled.div`
  display: flex; gap: 12px; align-items: flex-start;
  margin-bottom: 16px;
`;

const ThumbPlaceholder = styled.div<{ $isMyMessage: boolean }>`
  width: 48px; height: 48px;
  border-radius: 8px;
  background: ${({ $isMyMessage }) => ($isMyMessage ? 'rgba(255, 255, 255, 0.2)' : '#F2F4F6')};
  flex-shrink: 0;
`;

const Thumbnail = styled.img<{ $isMyMessage: boolean }>`
  width: 48px; height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: ${({ $isMyMessage }) => ($isMyMessage ? 'rgba(255, 255, 255, 0.2)' : '#F2F4F6')};
`;

const Info = styled.div`
  display: flex; flex-direction: column; gap: 4px;
`;

const ItemTitle = styled.div<{ $isMyMessage: boolean }>`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${({ $isMyMessage }) => ($isMyMessage ? 'white' : colors.textPrimary)};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;
`;

const Price = styled.div<{ $isMyMessage: boolean }>`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.bold};
  color: ${({ $isMyMessage }) => ($isMyMessage ? 'white' : colors.textPrimary)};
`;

const Details = styled.div<{ $isMyMessage: boolean }>`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${({ $isMyMessage }) => ($isMyMessage ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary)};
`;

const StatusSection = styled.div`
  margin-bottom: 16px;
`;

const StatusText = styled.div<{ $isMyMessage: boolean }>`
  display: flex; align-items: center; gap: 6px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${({ $isMyMessage }) => ($isMyMessage ? 'white' : colors.textPrimary)};
`;

const Dot = styled.div<{ $color: string }>`
  width: 6px; height: 6px; border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const ActionSection = styled.div`
  display: flex; justify-content: flex-end;
`;

const Button = styled.button<{ $isMyMessage: boolean }>`
  display: flex; align-items: center; gap: 4px;
  background: ${({ $isMyMessage }) => ($isMyMessage ? 'rgba(255, 255, 255, 0.2)' : '#F2F4F6')};
  border: none; border-radius: 8px;
  padding: 8px 12px;
  color: ${({ $isMyMessage }) => ($isMyMessage ? 'white' : colors.textPrimary)};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  cursor: pointer;
  &:active { background: ${({ $isMyMessage }) => ($isMyMessage ? 'rgba(255, 255, 255, 0.3)' : '#E5E8EB')}; }
`;

const IconWrapper = styled.div`
  display: flex; align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex; width: 100%; gap: 8px;
`;

const RejectButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #F2F4F6;
  color: ${colors.textSecondary};
  border: none; border-radius: 8px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.bold};
  cursor: pointer;
  &:active { background: #E5E8EB; }
`;

const AcceptButton = styled.button`
  flex: 1;
  padding: 10px;
  background: ${colors.primary};
  color: white;
  border: none; border-radius: 8px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.bold};
  cursor: pointer;
  &:active { opacity: 0.9; }
`;
