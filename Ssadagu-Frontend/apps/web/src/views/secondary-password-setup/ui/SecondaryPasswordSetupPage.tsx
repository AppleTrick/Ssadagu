'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { Button, Input } from '@/shared/ui';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { useModalStore } from '@/shared/hooks/useModalStore';
import {
  colors,
  typography,
  radius,
  HEADER_HEIGHT,
} from '@/shared/styles/theme';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${colors.surface};
`;

const ContentArea = styled.main`
  flex: 1;
  padding-top: ${HEADER_HEIGHT}px;
  padding-bottom: 40px;
  display: flex;
  flex-direction: column;
`;

const Section = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h2`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size['2xl']};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  margin: 0;
  line-height: 1.3;
`;

const Desc = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FieldLabel = styled.label`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
  display: block;
  margin-bottom: 6px;
`;

const InfoCard = styled.div`
  background: ${colors.bg};
  border-radius: ${radius.lg};
  padding: 16px;
  border-left: 3px solid ${colors.primary};
`;

const InfoText = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

const ErrorMsg = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.red};
  margin: 0;
  padding-left: 4px;
`;

const BottomBar = styled.div`
  padding: 16px 24px 40px;
`;

export function SecondaryPasswordSetupPage() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { alert: modalAlert } = useModalStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string): boolean => {
    const pattern = /^\d{6}$/;
    return pattern.test(pwd);
  };

  const handleSetPassword = async () => {
    setError('');

    // 검증
    if (!password) {
      setError('2차 비밀번호를 입력해주세요.');
      return;
    }

    if (!validatePassword(password)) {
      setError('2차 비밀번호는 6자리 숫자여야 합니다.');
      return;
    }

    if (!confirmPassword) {
      setError('2차 비밀번호 확인을 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setError('2차 비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post(
        ENDPOINTS.USERS.SECONDARY_PASSWORD(userId!),
        { secondaryPassword: password },
        accessToken ?? undefined
      );

      if (!res.ok) {
        throw new Error('2차 비밀번호 설정에 실패했습니다.');
      }

      await modalAlert({ message: '2차 비밀번호가 설정되었습니다.' });
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <HeaderBack title="2차 비밀번호 설정" onBack={() => router.back()} />
      <ContentArea>
        <Section>
          <TitleBlock>
            <Title>거래 보호를 위해{'\\n'}2차 비밀번호를 설정하세요</Title>
            <Desc>결제 및 민감한 거래 시 2차 비밀번호가 필요합니다.</Desc>
          </TitleBlock>

          <InfoCard>
            <InfoText>
              ✓ 6자리 숫자로 설정합니다{'\n'}
              ✓ 나중에 마이페이지에서 변경 가능합니다{'\n'}
              ✓ 잊어버린 경우 고객센터에 문의해주세요
            </InfoText>
          </InfoCard>

          <FieldGroup>
            <div>
              <FieldLabel>2차 비밀번호 (6자리 숫자)</FieldLabel>
              <Input
                type="password"
                placeholder="000000"
                value={password}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setPassword(val);
                  setError('');
                }}
                inputMode="numeric"
                maxLength={6}
              />
            </div>

            <div>
              <FieldLabel>2차 비밀번호 확인</FieldLabel>
              <Input
                type="password"
                placeholder="000000"
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setConfirmPassword(val);
                  setError('');
                }}
                inputMode="numeric"
                maxLength={6}
              />
            </div>

            {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
          </FieldGroup>
        </Section>

        <BottomBar>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!password || !confirmPassword || loading}
            onClick={handleSetPassword}
          >
            2차 비밀번호 설정 완료
          </Button>
        </BottomBar>
      </ContentArea>
    </Page>
  );
}
