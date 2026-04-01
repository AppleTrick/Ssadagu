'use client';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { colors, radius } from '@/shared/styles/theme';

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  boxRadius?: string;
  className?: string;
}

const SkeletonContainer = styled.div<SkeletonProps>`
  position: relative;
  overflow: hidden;
  background-color: ${colors.bg};
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width || '100%')};
  height: ${({ height }) => (typeof height === 'number' ? `${height}px` : height || '1lh')};
  border-radius: ${({ circle, boxRadius }) => (circle ? '50%' : boxRadius || radius.sm)};

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: ${shimmer} 1.5s infinite;
  }
`;

/**
 * 재사용 가능한 스켈레톤 UI 컴포넌트입니다.
 * @param width - 너비 (기본값: 100%)
 * @param height - 높이 (기본값: 1lh)
 * @param circle - 원형 여부
 * @param boxRadius - 사각형일 때의 border-radius
 */
export const Skeleton = (props: SkeletonProps) => {
  return <SkeletonContainer {...props} />;
};
