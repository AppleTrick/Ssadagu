'use client';

import { ReactNode, useEffect } from 'react';
import styled from '@emotion/styled';
import { colors, typography, zIndex } from '@/shared/styles/theme';

interface BottomSheetBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: string;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: ${colors.overlay};
  z-index: ${zIndex.modal};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  transition: opacity 0.25s ease;
`;

const Sheet = styled.div<{ isOpen: boolean; height?: string }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${colors.surface};
  border-radius: 16px 16px 0 0;
  z-index: ${zIndex.modal + 1};
  max-height: ${({ height }) => height ?? '80vh'};
  display: flex;
  flex-direction: column;
  transform: translateY(${({ isOpen }) => (isOpen ? '0%' : '100%')});
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  padding-bottom: env(safe-area-inset-bottom, 0);
`;

const DragHandle = styled.div`
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: ${colors.border};
  margin: 12px auto 0;
  flex-shrink: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px 12px;
  flex-shrink: 0;
  position: relative;
`;

const Title = styled.h2`
  font-family: ${typography.fontFamily};
  font-size: 17px;
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  margin: 0;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${colors.textSecondary};
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Body = styled.div`
  overflow-y: auto;
  padding: 0 20px 20px;
  flex: 1;
  -webkit-overflow-scrolling: touch;
`;

const BottomSheetBase = ({
  isOpen,
  onClose,
  title,
  children,
  height,
}: BottomSheetBaseProps) => {
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} aria-hidden="true" />
      <Sheet
        isOpen={isOpen}
        height={height}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <DragHandle />
        {title && (
          <Header>
            <Title>{title}</Title>
            <CloseButton onClick={onClose} aria-label="닫기">
              ✕
            </CloseButton>
          </Header>
        )}
        <Body>{children}</Body>
      </Sheet>
    </>
  );
};

export default BottomSheetBase;
