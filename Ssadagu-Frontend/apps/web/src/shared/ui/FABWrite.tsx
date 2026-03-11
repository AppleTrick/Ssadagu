'use client';

import styled from '@emotion/styled';
import { colors, shadows, zIndex, BOTTOM_NAV_HEIGHT } from '@/shared/styles/theme';

interface FABWriteProps {
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

const PencilIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"
      fill="currentColor"
    />
  </svg>
);

const FABWrite = ({ onClick }: FABWriteProps) => {
  return (
    <FABButton onClick={onClick} aria-label="글쓰기">
      <PencilIcon />
    </FABButton>
  );
};

export default FABWrite;
