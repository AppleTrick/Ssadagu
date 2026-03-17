'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';

interface SystemMessageProps {
  message: string;
}

const SystemMessage = ({ message }: SystemMessageProps) => {
  return (
    <Container>
      <Bubble>{message}</Bubble>
    </Container>
  );
};

export default SystemMessage;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  margin: 4px 0;
`;

const Bubble = styled.div`
  background: ${colors.bg};
  color: ${colors.textSecondary};
  font-size: ${typography.size.xs};
  padding: 6px 12px;
  border-radius: 12px;
  text-align: center;
`;
