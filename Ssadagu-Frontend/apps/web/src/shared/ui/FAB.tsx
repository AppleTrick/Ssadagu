'use client';

import styled from '@emotion/styled';
import { colors, shadows, zIndex, BOTTOM_NAV_HEIGHT } from '@/shared/styles/theme';

interface FABProps {
  onClick: () => void;
}

const FABButton = styled.button`
  position: fixed;
  bottom: calc(${BOTTOM_NAV_HEIGHT}px + 16px);
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${colors.primary};
  color: ${colors.textWhite};
  font-size: 28px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${shadows.lg};
  z-index: ${zIndex.modal - 1};
  border: none;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;

  &:active {
    transform: scale(0.94);
    opacity: 0.85;
  }
`;

const FAB = ({ onClick }: FABProps) => {
  return (
    <FABButton onClick={onClick} aria-label="추가">
      +
    </FABButton>
  );
};

export default FAB;
