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
  const rawType = (message as any).type || message.messageType || 'PAYMENT_REQUEST';
  const resolvedType = (message as any).resolvedType; // ChatRoomPage에서 주입한 상태

  // 이미 성공/실패로 처리된 요청이거나, 메시지 자체가 결과 메시지인 경우
  const isSuccess = rawType === 'PAYMENT_SUCCESS' || resolvedType === 'PAYMENT_SUCCESS';
  const isFail = rawType === 'PAYMENT_FAIL' || resolvedType === 'PAYMENT_FAIL';
  const isRequest = rawType === 'PAYMENT_REQUEST' && !resolvedType;

  let statusColor: string = colors.warning;
  let statusText = '수락 대기 중...';
  let headerText = '거래요청';

  if (isSuccess) {
    statusColor = isMyMessage ? '#FFFFFF' : colors.primary;
    statusText = '거래가 완료되었습니다.';
    headerText = '거래완료';
  } else if (isFail) {
    statusColor = isMyMessage ? '#FFFFFF' : colors.red;
    statusText = '요청이 취소/거절되었습니다.';
    headerText = '거래취소';
  }

  return (
    <Container $isMyMessage={isMyMessage} $isSuccess={isSuccess}>
      <Header $isMyMessage={isMyMessage} $isSuccess={isSuccess}>{headerText}</Header>
      
      <CardBody>
        <ThumbnailWrapper>
          {productThumbnailUrl ? (
            <Thumbnail src={getProxyImageUrl(productThumbnailUrl)} alt="상품" />
          ) : (
            <ThumbPlaceholder />
          )}
        </ThumbnailWrapper>
        <Info>
          <ItemTitle $isMyMessage={isMyMessage}>
            {message.senderNickname ? `${message.senderNickname}님의 상품` : '거래 상품 정보'}
          </ItemTitle>
          {contentData.productTitle && (
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 700, 
              color: isMyMessage ? 'white' : colors.textPrimary,
              marginTop: '2px'
            }}>
              {contentData.productTitle}
            </div>
          )}
          <Price $isMyMessage={isMyMessage}>{price?.toLocaleString() || 0}원</Price>
          <Details $isMyMessage={isMyMessage}>
            {locationName} · {time}
          </Details>
          <Details $isMyMessage={isMyMessage} style={{ fontSize: '10px', marginTop: '6px', opacity: 0.8 }}>
            구매자: {contentData.buyerNickname || '-'} / 판매자: {contentData.sellerNickname || '-'}
          </Details>
        </Info>
      </CardBody>

      {isRequest && (
        <ActionSection>
          {isMyMessage ? (
            <Button $isMyMessage={isMyMessage} onClick={onCancel}>요청 취소</Button>
          ) : (
            <ButtonGroup>
              <RejectButton onClick={onReject}>거절</RejectButton>
              <AcceptButton onClick={onAccept}>수락</AcceptButton>
            </ButtonGroup>
          )}
        </ActionSection>
      )}

      {!isRequest && (
        <StatusSection>
          <StatusText $isMyMessage={isMyMessage}>
            <Dot $color={statusColor} /> {statusText}
          </StatusText>
        </StatusSection>
      )}
    </Container>
  );
};

export default TransactionBubble;

const Container = styled.div<{ $isMyMessage: boolean; $isSuccess?: boolean }>`
  width: min(280px, 75%);
  background: ${({ $isMyMessage, $isSuccess }) => {
    if ($isMyMessage) return colors.chatMine;
    if ($isSuccess) return'#F0F7FF'; // 성공 시 아주 연한 파란색 배경 (다른 사람이 보낼 때)
    return colors.chatOther;
  }};
  
  /* 일반 말풍선 스타일의 곡률 + 이미지 가이드의 상단 말꼬리(4px) 적용 */
  border-radius: 18px;
  border-top-right-radius: ${({ $isMyMessage }) => ($isMyMessage ? '4px' : '18px')};
  border-top-left-radius: ${({ $isMyMessage }) => ($isMyMessage ? '18px' : '4px')};
  
  padding: 14px 16px;
  display: flex; flex-direction: column;
  
  /* 화면 가장자리와의 여백 확보 */
  margin: ${({ $isMyMessage }) => ($isMyMessage ? '0 16px 0 0' : '0 0 0 16px')};
  border: ${({ $isSuccess }) => ($isSuccess ? `1px solid ${colors.primary}` : 'none')};
`;

const Header = styled.div<{ $isMyMessage: boolean; $isSuccess?: boolean }>`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.bold};
  color: ${({ $isMyMessage, $isSuccess }) => {
    if ($isMyMessage) return 'white';
    if ($isSuccess) return colors.primary;
    return colors.primary;
  }};
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ $isMyMessage }) => ($isMyMessage ? 'rgba(255, 255, 255, 0.2)' : colors.border)};
`;

const CardBody = styled.div`
  display: flex; gap: 14px; align-items: center;
  margin-bottom: 20px;
`;

const ThumbnailWrapper = styled.div`
  width: 64px; height: 64px; flex-shrink: 0;
`;

const ThumbPlaceholder = styled.div`
  width: 100%; height: 100%;
  border-radius: 12px;
  background: #E9ECEF;
`;

const Thumbnail = styled.img`
  width: 100%; height: 100%;
  border-radius: 12px;
  object-fit: cover;
  background: #E9ECEF;
`;

const Info = styled.div`
  display: flex; flex-direction: column; gap: 2px;
  overflow: hidden;
`;

const ItemTitle = styled.div<{ $isMyMessage: boolean }>`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${({ $isMyMessage }) => ($isMyMessage ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary)};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const Price = styled.div<{ $isMyMessage: boolean }>`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.bold};
  color: ${({ $isMyMessage }) => ($isMyMessage ? colors.surface : colors.textPrimary)};
`;

const Details = styled.div<{ $isMyMessage: boolean }>`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${({ $isMyMessage }) => ($isMyMessage ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary)};
  margin-top: 2px;
`;

const StatusSection = styled.div`
  margin-bottom: 16px;
`;

const StatusText = styled.div<{ $isMyMessage: boolean }>`
  display: flex; align-items: center; gap: 6px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${({ $isMyMessage }) => ($isMyMessage ? colors.surface : colors.textPrimary)};
`;

const Dot = styled.div<{ $color: string }>`
  width: 6px; height: 6px; border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const ActionSection = styled.div`
  display: flex; width: 100%;
`;

const Button = styled.button<{ $isMyMessage: boolean }>`
  width: 100%;
  height: 48px;
  background: ${({ $isMyMessage }) => ($isMyMessage ? 'rgba(255, 255, 255, 0.15)' : '#E9ECEF')};
  border: none; border-radius: 12px;
  color: ${({ $isMyMessage }) => ($isMyMessage ? 'white' : colors.textPrimary)};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.bold};
  cursor: pointer;
  transition: all 0.2s;
  &:active { transform: scale(0.98); opacity: 0.8; }
`;

const ButtonGroup = styled.div`
  display: flex; width: 100%; gap: 10px;
`;

const RejectButton = styled.button`
  flex: 1;
  height: 48px;
  background: #E9ECEF;
  color: ${colors.textSecondary};
  border: none; border-radius: 14px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.bold};
  cursor: pointer;
  transition: all 0.2s;
  &:active { background: #DEE2E6; transform: scale(0.98); }
`;

const AcceptButton = styled.button`
  flex: 1;
  height: 48px;
  background: ${colors.primary};
  color: white;
  border: none; border-radius: 14px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.bold};
  cursor: pointer;
  transition: all 0.2s;
  &:active { opacity: 0.9; transform: scale(0.98); }
`;
