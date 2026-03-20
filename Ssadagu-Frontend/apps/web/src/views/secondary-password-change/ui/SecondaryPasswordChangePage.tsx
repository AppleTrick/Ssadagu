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

type Step = 'verify' | 'change';

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

export function SecondaryPasswordChangePage() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { alert: modalAlert } = useModalStore();

  const [step, setStep] = useState<Step>('verify');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string): boolean => {
    const pattern = /^\d{6}$/;
    return pattern.test(pwd);
  };

  const handleVerifyPassword = async () => {
    setError('');

    if (!currentPassword) {
      setError('기존 2차 비밀번호를 입력해주세요.');
      return;
    }

    if (!validatePassword(currentPassword)) {
      setError('2차 비밀번호는 6자리 숫자여야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post(
        ENDPOINTS.USERS.VERIFY_SECONDARY_PASSWORD(userId!),
        { secondaryPassword: currentPassword },
        accessToken ?? undefined
      );

      if (!res.ok) {
        throw new Error('기존 2차 비밀번호가 일치하지 않습니다.');
      }

      setStep('change');
      setCurrentPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '검증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');

    if (!newPassword) {
      setError('새 2차 비밀번호를 입력해주세요.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('2차 비밀번호는 6자리 숫자여야 합니다.');
      return;
    }

    if (!confirmPassword) {
      setError('새 2차 비밀번호 확인을 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 2차 비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post(
        ENDPOINTS.USERS.SECONDARY_PASSWORD(userId!),
        { secondaryPassword: newPassword },
        accessToken ?? undefined
      );

      if (!res.ok) {
        throw new Error('2차 비밀번호 변경에 실패했습니다.');
      }

      await modalAlert({ message: '2차 비밀번호가 변경되었습니다.' });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: 기존 비밀번호 검증
  if (step === 'verify') {
    return (
      <Page>
        <HeaderBack title="2차 비밀번호 변경" onBack={() => router.back()} />
        <ContentArea>
          <Section>
            <TitleBlock>
              <Title>기존 2차 비밀번호를{'\\n'}입력해주세요</Title>
              <Desc>보안을 위해 기존 비밀번호 검증이 필요합니다.</Desc>
            </TitleBlock>

            <FieldGroup>
              <div>
                <FieldLabel>기존 2차 비밀번호 (6자리 숫자)</FieldLabel>
                <Input
                  type="password"
                  placeholder="000000"
                  value={currentPassword}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCurrentPassword(val);
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
              disabled={!currentPassword || loading}
              onClick={handleVerifyPassword}
            >
              확인
            </Button>
          </BottomBar>
        </ContentArea>
      </Page>
    );
  }

  // Step 2: 새 비밀번호 설정
  return (
    <Page>
      <HeaderBack title="2차 비밀번호 변경" onBack={() => { setStep('verify'); setNewPassword(''); setConfirmPassword(''); }} />
      <ContentArea>
        <Section>
          <TitleBlock>
            <Title>새로운 2차 비밀번호를{'\\n'}설정하세요</Title>
            <Desc>6자리 숫자로 새로운 비밀번호를 설정합니다.</Desc>
          </TitleBlock>

          <FieldGroup>
            <div>
              <FieldLabel>새 2차 비밀번호 (6자리 숫자)</FieldLabel>
              <Input
                type="password"
                placeholder="000000"
                value={newPassword}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setNewPassword(val);
                  setError('');
                }}
                inputMode="numeric"
                maxLength={6}
              />
            </div>

            <div>
              <FieldLabel>새 2차 비밀번호 확인</FieldLabel>
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
            disabled={!newPassword || !confirmPassword || loading}
            onClick={handleChangePassword}
          >
            변경 완료
          </Button>
        </BottomBar>
      </ContentArea>
    </Page>
  );
}
