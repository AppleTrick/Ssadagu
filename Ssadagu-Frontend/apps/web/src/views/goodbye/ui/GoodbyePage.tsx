'use client';

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui';
import { colors, typography, radius } from '@/shared/styles/theme';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${colors.bg};
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ContentCard = styled.div`
  background: ${colors.surface};
  border-radius: ${radius.lg};
  padding: 40px 32px;
  text-align: center;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const IconWrap = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size['2xl']};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  margin: 0 0 12px;
`;

const Desc = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
  line-height: 1.6;
  margin: 0 0 32px;
  white-space: pre-wrap;
`;

export function GoodbyePage() {
  const router = useRouter();

  return (
    <Page>
      <ContentCard>
        <IconWrap>👋</IconWrap>
        <Title>안녕히 가세요!</Title>
        <Desc>
          그동안 신뢰 기반 중고거래 <strong>싸다구</strong>를{'\n'}
          이용해 주셔서 진심으로 감사합니다.{'\n'}
          더 나은 모습으로 다시 만날 수 있길 바랄게요.
        </Desc>
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onClick={() => router.replace('/')}
        >
          시작 화면으로 돌아가기
        </Button>
      </ContentCard>
    </Page>
  );
}
