'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto?: () => void;
  onSelectLocation?: () => void;
}

const AttachmentMenu = ({ isOpen, onClose, onSelectPhoto, onSelectLocation }: AttachmentMenuProps) => {
  if (!isOpen) return null;
  return (
    <>
      <Backdrop onClick={onClose} />
      <Menu>
        <MenuItem onClick={() => { onSelectPhoto?.(); onClose(); }}>
          <MenuIcon>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </MenuIcon>
          <MenuLabel>사진</MenuLabel>
        </MenuItem>
        <MenuItem onClick={() => { onSelectLocation?.(); onClose(); }}>
          <MenuIcon>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </MenuIcon>
          <MenuLabel>위치</MenuLabel>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AttachmentMenu;

const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 40;
`;

const Menu = styled.div<{ $bottom?: number }>`
  position: fixed;
  bottom: 72px;
  left: 16px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 8px;
  display: flex; flex-direction: row; gap: 8px;
  z-index: 41;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
`;

const MenuItem = styled.button`
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 16px;
  background: ${colors.bg}; border: none; border-radius: 12px; cursor: pointer;
  &:active { opacity: 0.7; }
`;

const MenuIcon = styled.div`
  width: 44px; height: 44px; border-radius: 50%; background: #E8F4FF;
  display: flex; align-items: center; justify-content: center;
`;

const MenuLabel = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
`;
