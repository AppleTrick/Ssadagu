import { css } from '@emotion/react';
import { typography } from './theme';

export const globalStyles = css`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');

  @font-face {
    font-family: 'Pretendard Variable';
    font-display: swap;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    font-family: ${typography.fontFamily};
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #F2F4F6;
    color: #191F28;
    /* WebView 300ms 탭 딜레이 제거 */
    touch-action: manipulation;
    /* iOS WebView 스크롤 관성 활성화 */
    -webkit-overflow-scrolling: touch;
  }

  a {
    color: inherit;
    text-decoration: none;
    /* 링크 탭 딜레이 제거 */
    touch-action: manipulation;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
    /* 버튼 탭 딜레이 제거 */
    touch-action: manipulation;
    /* iOS 탭 하이라이트 제거 */
    -webkit-tap-highlight-color: transparent;
  }

  input, textarea {
    font-family: inherit;
    outline: none;
    touch-action: manipulation;
  }
`;
