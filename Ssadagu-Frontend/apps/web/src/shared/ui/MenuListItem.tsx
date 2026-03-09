'use client';

import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';

type ItemColor = 'default' | 'danger';

interface MenuListItemProps {
  label: string;
  onClick?: () => void;
  rightElement?: ReactNode;
  color?: ItemColor;
}

const Item = styled.div<{ clickable: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${colors.surface};
  padding: 16px 20px;
  border-bottom: 1px solid ${colors.border};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: background 0.1s;
  min-height: 56px;
  box-sizing: border-box;

  &:active {
    background: ${({ clickable }) => (clickable ? colors.bg : colors.surface)};
  }
`;

const LabelText = styled.span<{ color: ItemColor }>`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.regular};
  color: ${({ color }) => (color === 'danger' ? colors.red : colors.textPrimary)};
`;

const RightWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${colors.textSecondary};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
`;

const ChevronIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M9 18l6-6-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MenuListItem = ({
  label,
  onClick,
  rightElement,
  color = 'default',
}: MenuListItemProps) => {
  return (
    <Item onClick={onClick} clickable={!!onClick} role={onClick ? 'button' : undefined}>
      <LabelText color={color}>{label}</LabelText>
      <RightWrapper>
        {rightElement !== undefined ? rightElement : onClick ? <ChevronIcon /> : null}
      </RightWrapper>
    </Item>
  );
};

export default MenuListItem;
