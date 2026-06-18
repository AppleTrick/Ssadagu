'use client';

import styled from '@emotion/styled';
import { APP_WIDTH } from '@/shared/styles/theme';

const Backdrop = styled.div`
  width: 100%;
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  background: #f2f2f2;
`;

const Frame = styled.div`
  position: relative;
  width: 100%;
  max-width: ${APP_WIDTH}px;
  min-height: 100dvh;
  overflow: hidden;
  /* fixed 자손들의 containing block을 뷰포트가 아닌 이 프레임으로 한정시켜
     데스크탑 와이드 화면에서도 헤더/바텀내비/모달이 390px 폭 안에 갇히게 함 */
  transform: translateZ(0);

  @media (min-width: ${APP_WIDTH + 1}px) {
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
  }
`;

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <Backdrop>
      <Frame>{children}</Frame>
    </Backdrop>
  );
}
