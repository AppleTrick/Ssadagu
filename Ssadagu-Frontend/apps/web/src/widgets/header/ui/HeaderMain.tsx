'use client';

import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { colors, typography, HEADER_HEIGHT, zIndex } from '@/shared/styles/theme';

interface HeaderMainProps {
  title?: string;
  onSearchChange?: (query: string) => void;
  onNotification?: () => void;
}

const HeaderMain = ({ title = '우리동네', onSearchChange, onNotification }: HeaderMainProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    onSearchChange?.('');
  };

  const handleChange = (v: string) => {
    setQuery(v);
    onSearchChange?.(v);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Header>
      {searchOpen ? (
        <SearchBar>
          <SearchInput
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="상품명을 검색하세요"
            aria-label="상품 검색"
          />
          <CloseButton onClick={closeSearch} aria-label="검색 닫기">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CloseButton>
        </SearchBar>
      ) : (
        <>
          <Title>{title}</Title>
          <IconGroup>
            <IconButton onClick={openSearch} aria-label="검색">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </IconButton>
            <IconButton onClick={onNotification} aria-label="알림">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </IconButton>
          </IconGroup>
        </>
      )}
    </Header>
  );
};

export default HeaderMain;

const Header = styled.header`
  position: fixed; top: 0; left: 0; right: 0;
  height: ${HEADER_HEIGHT}px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
  display: flex; flex-direction: row; align-items: center; justify-content: space-between;
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
  display: flex; flex-direction: row; align-items: center; gap: 4px;
`;

const IconButton = styled.button`
  background: none; border: none; padding: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  &:active { background: ${colors.bg}; }
`;

const SearchBar = styled.div`
  flex: 1; display: flex; align-items: center; gap: 8px;
`;

const SearchInput = styled.input`
  flex: 1; height: 36px;
  background: ${colors.bg};
  border: 1.5px solid ${colors.primary};
  border-radius: 999px;
  padding: 0 16px;
  font-size: ${typography.size.base};
  font-family: ${typography.fontFamily};
  color: ${colors.textPrimary};
  outline: none;
  &::placeholder { color: ${colors.textSecondary}; }
`;

const CloseButton = styled.button`
  background: none; border: none; padding: 4px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
`;
