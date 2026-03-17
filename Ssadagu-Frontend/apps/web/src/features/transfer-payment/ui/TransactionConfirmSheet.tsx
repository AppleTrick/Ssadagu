'use client';

import { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { colors, typography } from '@/shared/styles/theme';
import type { ChatRoom, TransactionContent } from '@/entities/chat/model/types';

interface TransactionConfirmSheetProps {
  isOpen: boolean;
  onClose: () => void;
  roomInfo: Pick<ChatRoom, 'productTitle' | 'productThumbnailUrl'> | null;
  content?: TransactionContent;
  onConfirm: () => void;
}

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const TransactionConfirmSheet = ({ isOpen, onClose, roomInfo, content, onConfirm }: TransactionConfirmSheetProps) => {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number | null>(null);

  if (!isOpen) {
    if (offsetY !== 0) setOffsetY(0);
    return null;
  }

  const handleDragStart = (clientY: number) => {
    startY.current = clientY;
    setIsDragging(true);
  };
  const handleDragMove = (clientY: number) => {
    if (startY.current === null) return;
    const diff = clientY - startY.current;
    if (diff > 0) setOffsetY(diff);
  };
  const handleDragEnd = () => {
    if (startY.current === null) return;
    setIsDragging(false);
    startY.current = null;
    if (offsetY > 100) {
      onClose();
      setTimeout(() => setOffsetY(0), 300);
    } else {
      setOffsetY(0);
    }
  };

  return (
    <>
      <Backdrop onClick={onClose} />
      <SheetContainer
        style={{
          transform: offsetY > 0 ? `translateY(${offsetY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        <DragHandleArea
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onMouseMove={(e) => isDragging && handleDragMove(e.clientY)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <HandleBar />
        </DragHandleArea>

        <Header>
          <Title>거래 확인</Title>
          <CloseButton onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </CloseButton>
        </Header>

        <SummaryBox>
          <SummaryRow>
            <SummaryLabel>상품</SummaryLabel>
            <SummaryValue>{roomInfo?.productTitle}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>거래 장소</SummaryLabel>
            <SummaryValue>{content?.locationName}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>거래 시간</SummaryLabel>
            <SummaryValue>{content?.time}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>거래 금액</SummaryLabel>
            <SummaryValue $highlight>{content?.price?.toLocaleString()}원</SummaryValue>
          </SummaryRow>
        </SummaryBox>

        <InfoText>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          거래 확인 후 상대방에게 알림이 전송됩니다.
        </InfoText>

        <ButtonGroup>
          <CancelButton onClick={onClose}>취소</CancelButton>
          <ConfirmButton onClick={() => { onConfirm(); onClose(); }}>거래 확인</ConfirmButton>
        </ButtonGroup>
      </SheetContainer>
    </>
  );
};

export default TransactionConfirmSheet;

const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 50;
  background: rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.2s ease-out;
`;

const SheetContainer = styled.div`
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: ${colors.surface};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 0 20px 32px;
  z-index: 51;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  animation: ${slideUp} 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex; flex-direction: column;
`;

const DragHandleArea = styled.div`
  padding: 12px 0;
  display: flex; justify-content: center;
  cursor: grab;
  &:active { cursor: grabbing; }
`;

const HandleBar = styled.div`
  width: 40px; height: 4px; border-radius: 2px;
  background: ${colors.border};
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.lg};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none; border: none; padding: 4px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
`;

const SummaryBox = styled.div`
  background: #F8F9FA;
  border-radius: 12px;
  padding: 20px 16px;
  display: flex; flex-direction: column; gap: 16px;
  margin-bottom: 24px;
`;

const SummaryRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
`;

const SummaryLabel = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;

const SummaryValue = styled.span<{ $highlight?: boolean }>`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${({ $highlight }) => ($highlight ? typography.weight.bold : typography.weight.medium)};
  color: ${({ $highlight }) => ($highlight ? colors.primary : colors.textPrimary)};
`;

const InfoText = styled.div`
  display: flex; align-items: center; gap: 6px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
  margin-bottom: 24px;
  padding: 0 4px;
`;

const ButtonGroup = styled.div`
  display: flex; gap: 12px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 16px;
  background: #F2F4F6;
  color: ${colors.textSecondary};
  border: none; border-radius: 12px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.bold};
  cursor: pointer;
  &:active { opacity: 0.8; }
`;

const ConfirmButton = styled.button`
  flex: 2;
  padding: 16px;
  background: ${colors.primary};
  color: white;
  border: none; border-radius: 12px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.bold};
  cursor: pointer;
  &:active { opacity: 0.9; }
`;
