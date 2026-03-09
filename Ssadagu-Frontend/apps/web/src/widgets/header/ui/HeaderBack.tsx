'use client';

import { type ReactNode } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { colors, typography, HEADER_HEIGHT, zIndex } from '@/shared/styles/theme';

interface HeaderBackProps {
  title: string;
  onBack?: () => void;
  rightElement?: ReactNode;
}

const HeaderBack = ({ title, onBack, rightElement }: HeaderBackProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <Header>
      <BackButton onClick={handleBack} aria-label="뒤로가기">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </BackButton>
      <TitleText>{title}</TitleText>
      <RightSlot>
        {rightElement ?? null}
      </RightSlot>
    </Header>
  );
};

export default HeaderBack;

const Header = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_HEIGHT}px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  padding: 0 8px;
  z-index: ${zIndex.header};
`;

const BackButton = styled.button`
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

const TitleText = styled.h1`
  margin: 0;
  font-size: ${typography.size.lg};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RightSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
