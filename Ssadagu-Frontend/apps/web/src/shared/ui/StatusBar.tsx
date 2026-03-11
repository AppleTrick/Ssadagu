'use client';

import styled from '@emotion/styled';
import { STATUS_BAR_HEIGHT } from '@/shared/styles/theme';

const Bar = styled.div`
  width: 100%;
  height: ${STATUS_BAR_HEIGHT}px;
  flex-shrink: 0;
`;

const StatusBar = () => {
  return <Bar aria-hidden="true" />;
};

export default StatusBar;
