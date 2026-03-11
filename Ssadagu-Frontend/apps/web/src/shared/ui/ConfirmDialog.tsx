'use client';

import { useEffect } from 'react';
import styled from '@emotion/styled';
import { colors, radius, typography, zIndex, shadows } from '@/shared/styles/theme';

type Variant = 'default' | 'danger';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: Variant;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: ${colors.overlay};
  z-index: ${zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  transition: opacity 0.2s ease;
`;

const Card = styled.div<{ isOpen: boolean }>`
  background: ${colors.surface};
  border-radius: ${radius.lg};
  padding: 24px;
  width: 320px;
  max-width: 100%;
  box-shadow: ${shadows.lg};
  transform: ${({ isOpen }) => (isOpen ? 'scale(1)' : 'scale(0.93)')};
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const Title = styled.h3`
  font-family: ${typography.fontFamily};
  font-size: 17px;
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  margin: 0 0 10px;
`;

const Message = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
  margin: 0 0 24px;
  line-height: 1.5;
  word-break: keep-all;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const CancelButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: ${radius.pill};
  border: 1.5px solid ${colors.border};
  background: transparent;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.semibold};
  color: ${colors.textPrimary};
  cursor: pointer;
  transition: background 0.1s;

  &:active {
    background: ${colors.bg};
  }
`;

const ConfirmButton = styled.button<{ variant: Variant }>`
  flex: 1;
  height: 48px;
  border-radius: ${radius.pill};
  border: none;
  background: ${({ variant }) => (variant === 'danger' ? colors.red : colors.primary)};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.semibold};
  color: ${colors.textWhite};
  cursor: pointer;
  transition: opacity 0.1s;

  &:active {
    opacity: 0.85;
  }
`;

const ConfirmDialog = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  variant = 'default',
}: ConfirmDialogProps) => {
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay isOpen={isOpen} onClick={handleOverlayClick} aria-hidden={!isOpen}>
      <Card isOpen={isOpen} role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
        <Title id="dialog-title">{title}</Title>
        <Message>{message}</Message>
        <ButtonRow>
          <CancelButton onClick={onClose}>{cancelLabel}</CancelButton>
          <ConfirmButton variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </ConfirmButton>
        </ButtonRow>
      </Card>
    </Overlay>
  );
};

export default ConfirmDialog;
