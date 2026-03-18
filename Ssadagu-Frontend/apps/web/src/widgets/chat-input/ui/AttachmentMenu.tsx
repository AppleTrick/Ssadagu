'use client';

import { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { colors, typography } from '@/shared/styles/theme';

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto?: () => void;
  onPhotosSelected?: (files: File[]) => void;
  onSelectLocation?: () => void;
  onSelectTransaction?: () => void;
  onSelectCamera?: () => void;
}

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const AttachmentMenu = ({ isOpen, onClose, onSelectPhoto, onPhotosSelected, onSelectLocation, onSelectTransaction, onSelectCamera }: AttachmentMenuProps) => {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (diff > 0) {
      setOffsetY(diff);
    }
  };

  const handleDragEnd = () => {
    if (startY.current === null) return;
    setIsDragging(false);
    startY.current = null;
    if (offsetY > 80) {
      onClose();
      setTimeout(() => setOffsetY(0), 300);
    } else {
      setOffsetY(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const filesArray = Array.from(e.target.files);
    
    if (filesArray.length > 5) {
      alert('사진은 최대 5장까지만 전송할 수 있습니다.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    onPhotosSelected?.(filesArray);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <>
      <Backdrop onClick={onClose} />
      <MenuContainer
        style={{
          transform: offsetY > 0 ? `translateY(${offsetY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
        onTouchEnd={handleDragEnd}
        onMouseDown={(e) => handleDragStart(e.clientY)}
        onMouseMove={(e) => isDragging && handleDragMove(e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <HandleBar />
        <MenuGrid>
          <MenuItem onClick={() => { onSelectLocation?.(); onClose(); }}>
            <MenuIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </MenuIcon>
            <MenuLabel>지도</MenuLabel>
          </MenuItem>

          <MenuItem onClick={() => { fileInputRef.current?.click(); }}>
            <MenuIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </MenuIcon>
            <MenuLabel>사진</MenuLabel>
          </MenuItem>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <MenuItem onClick={() => { onSelectTransaction?.(); onClose(); }}>
            <MenuIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </MenuIcon>
            <MenuLabel>거래요청</MenuLabel>
          </MenuItem>

          <MenuItem onClick={() => { onSelectCamera?.(); onClose(); }}>
            <MenuIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </MenuIcon>
            <MenuLabel>카메라</MenuLabel>
          </MenuItem>
        </MenuGrid>
      </MenuContainer>
    </>
  );
};

export default AttachmentMenu;

const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 40;
  background: rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.2s ease-out;
`;

const MenuContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${colors.surface};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 12px 16px 32px;
  z-index: 41;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
  animation: ${slideUp} 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${colors.border};
  margin-bottom: 24px;
`;

const MenuGrid = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  max-width: 400px;
`;

const MenuItem = styled.button`
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: transparent; border: none; cursor: pointer;
  &:active { opacity: 0.7; }
`;

const MenuIcon = styled.div`
  width: 56px; height: 56px; border-radius: 50%; background: ${colors.bg};
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.15s;
  ${MenuItem}:active & {
    opacity: 0.7;
  }
`;

const MenuLabel = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textPrimary};
`;
