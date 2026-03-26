'use client';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// layout.tsx와 달리 template.tsx는 페이지 이동마다 리마운트됨
// → 매 페이지 진입 시 fade 애니메이션 실행

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Wrapper = styled.div`
  animation: ${fadeIn} 0.15s ease-out forwards;
`;

export default function Template({ children }: { children: React.ReactNode }) {
  return <Wrapper>{children}</Wrapper>;
}
