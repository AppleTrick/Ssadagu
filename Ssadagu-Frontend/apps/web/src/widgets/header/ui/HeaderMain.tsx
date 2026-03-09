'use client';

import styled from '@emotion/styled';
import { colors, typography, HEADER_HEIGHT, zIndex } from '@/shared/styles/theme';

interface HeaderMainProps {
  title?: string;
  onSearch?: () => void;
  onNotification?: () => void;
}

const HeaderMain = ({
  title = '우리동네',
  onSearch,
  onNotification,
}: HeaderMainProps) => {
  return (
    <Header>
      <Title>{title}</Title>
      <IconGroup>
        <IconButton onClick={onSearch} aria-label="검색">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </IconButton>
        <IconButton onClick={onNotification} aria-label="알림">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </IconButton>
      </IconGroup>
    </Header>
  );
};

export default HeaderMain;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_HEIGHT}px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: ${zIndex.header};
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${typography.size.xl};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
`;

const IconGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  &:active {
    background: ${colors.bg};
  }
`;
