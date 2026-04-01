'use client';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div<{ duration?: number }>`
  animation: ${fadeIn} ${({ duration }) => duration || 0.2}s ease-out forwards;
`;

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

/**
 * 콘텐츠가 나타날 때 부드러운 페이드 인 효과를 줍니다.
 * @param duration - 애니메이션 지속 시간 (기본값: 0.4s)
 */
export const FadeIn = ({ children, duration, className }: FadeInProps) => {
  return (
    <Wrapper duration={duration} className={className}>
      {children}
    </Wrapper>
  );
};
