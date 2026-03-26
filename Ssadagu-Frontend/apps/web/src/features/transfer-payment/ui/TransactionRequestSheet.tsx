"use client";

import { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { colors, typography } from "@/shared/styles/theme";
import type { ChatRoom } from "@/entities/chat/model/types";
import { useModalStore } from "@/shared/hooks/useModalStore";

interface TransactionRequestSheetProps {
  isOpen: boolean;
  onClose: () => void;
  roomInfo: Pick<
    ChatRoom,
    "productTitle" | "productPrice" | "productThumbnailUrl"
  > | null;
  buyerNickname?: string;
  sellerNickname?: string;
  onSubmit: (location: string, time: string, price: number) => void;
}

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const MAX_PRICE = 10000000000; // 100억

const TransactionRequestSheet = ({
  isOpen,
  onClose,
  roomInfo,
  buyerNickname,
  sellerNickname,
  onSubmit,
}: TransactionRequestSheetProps) => {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number | null>(null);

  const [amount, setAmount] = useState(roomInfo?.productPrice || 0);
  const { alert: modalAlert } = useModalStore();

  useEffect(() => {
    if (isOpen && roomInfo?.productPrice) {
      setAmount(roomInfo.productPrice);
    }
  }, [isOpen, roomInfo]);

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value.replace(/[^0-9]/g, ""));
    if (val > MAX_PRICE) return; // 100억 초과 입력 방지
    setAmount(val);
  };

  const handleSubmit = async () => {
    if (amount > MAX_PRICE) {
      await modalAlert({ message: "거래 금액은 100억 원을 초과할 수 없습니다." });
      return;
    }
    onSubmit("", "", amount);
  };

  return (
    <>
      <Backdrop onClick={onClose} />
      <SheetContainer
        style={{
          transform: offsetY > 0 ? `translateY(${offsetY}px)` : undefined,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
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
          <Title>거래요청</Title>
          <CloseButton onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.textSecondary}
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </CloseButton>
        </Header>

        <ProductPreview>
          <Thumb $url={roomInfo?.productThumbnailUrl} />
          <ProductInfo>
            <ProductTitle>{roomInfo?.productTitle}</ProductTitle>
            <ProductPrice>
              {roomInfo?.productPrice?.toLocaleString()}원
            </ProductPrice>
          </ProductInfo>
        </ProductPreview>

        <FormSection>
          <Label>구매자 닉네임</Label>
          <InputWrapper style={{ opacity: 0.7 }}>
            <Icon>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Icon>
            <Input
              value={buyerNickname ?? ""}
              disabled
              style={{ cursor: "not-allowed" }}
            />
          </InputWrapper>

          <Label>판매자 닉네임</Label>
          <InputWrapper style={{ opacity: 0.7 }}>
            <Icon>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Icon>
            <Input
              value={sellerNickname ?? ""}
              disabled
              style={{ cursor: "not-allowed" }}
            />
          </InputWrapper>

          <Label>
            거래 금액
            <NegotiableHint>(에누리 가능 — 직접 수정하세요)</NegotiableHint>
          </Label>
          <InputWrapper>
            <Input
              value={amount.toLocaleString()}
              onChange={handleAmountChange}
            />
            <Currency>원</Currency>
          </InputWrapper>
        </FormSection>

        <SubmitButton onClick={handleSubmit}>거래 요청 보내기</SubmitButton>
      </SheetContainer>
    </>
  );
};

export default TransactionRequestSheet;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.2s ease-out;
`;

const SheetContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${colors.surface};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 0 20px 32px;
  z-index: 51;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  animation: ${slideUp} 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  flex-direction: column;
`;

const DragHandleArea = styled.div`
  padding: 12px 0;
  display: flex;
  justify-content: center;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${colors.border};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.lg};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProductPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${colors.bg};
  border-radius: 12px;
  margin-bottom: 24px;
`;

const Thumb = styled.div<{ $url?: string | null }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: #e5e8eb;
  ${({ $url }) =>
    $url &&
    `
    background-image: url(${$url});
    background-size: cover;
    background-position: center;
  `}
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProductTitle = styled.div`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textPrimary};
`;

const ProductPrice = styled.div`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.bold};
  color: ${colors.primary};
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

const Label = styled.div`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
  margin-bottom: -8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NegotiableHint = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${colors.primary};
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f4f5f7;
  border-radius: 12px;
  padding: 14px 16px;
`;

const Icon = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.primary};
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textPrimary};
  &::placeholder {
    color: ${colors.textSecondary};
  }
`;

const Currency = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textPrimary};
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.bold};
  cursor: pointer;
  &:active {
    opacity: 0.9;
  }
`;
