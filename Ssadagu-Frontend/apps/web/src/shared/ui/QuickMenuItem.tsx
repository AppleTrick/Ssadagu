'use client';

import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { colors, radius, typography } from '@/shared/styles/theme';

interface QuickMenuItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

const Button = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${colors.surface};
  border: none;
  border-radius: ${radius.md};
  padding: 12px;
  cursor: pointer;
  transition: background 0.1s, transform 0.1s;
  flex: 1;

  &:active {
    background: ${colors.bg};
    transform: scale(0.97);
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textPrimary};

  svg {
    width: 24px;
    height: 24px;
  }
`;

const LabelText = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  font-weight: ${typography.weight.medium};
  color: ${colors.textSecondary};
  white-space: nowrap;
`;

const QuickMenuItem = ({ icon, label, onClick }: QuickMenuItemProps) => {
  return (
    <Button onClick={onClick} aria-label={label}>
      <IconWrapper>{icon}</IconWrapper>
      <LabelText>{label}</LabelText>
    </Button>
  );
};

export default QuickMenuItem;
