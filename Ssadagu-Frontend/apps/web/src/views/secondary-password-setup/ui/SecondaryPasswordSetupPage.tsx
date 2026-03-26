'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { PinPad } from '@/shared/ui/PinPad';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { useModalStore } from '@/shared/hooks/useModalStore';
import {
  colors,
  typography,
  HEADER_HEIGHT,
} from '@/shared/styles/theme';
import {
  isInWebView,
  generateAndStoreDeviceToken,
} from '@/shared/lib/biometricBridge';

type Step = 'enter' | 'confirm';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${colors.surface};
`;

const ContentArea = styled.main`
  flex: 1;
  padding-top: ${HEADER_HEIGHT}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 40px;
  padding-left: 24px;
  padding-right: 24px;
`;

const BiometricRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  cursor: pointer;
`;

const BiometricCheck = styled.div<{ checked: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ checked }) => (checked ? colors.primary : 'transparent')};
  border: 2px solid ${({ checked }) => (checked ? colors.primary : colors.border)};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
`;

const CheckMark = styled.svg`
  width: 12px;
  height: 12px;
  color: ${colors.surface};
`;

const BiometricLabel = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textPrimary};
`;

export function SecondaryPasswordSetupPage() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { alert: modalAlert } = useModalStore();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('enter');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBiometric, setUseBiometric] = useState(false);
  const [inWebView, setInWebView] = useState(false);

  useEffect(() => {
    setInWebView(isInWebView());
  }, []);

  // 6자리 완성 시 자동 다음 단계
  useEffect(() => {
    if (step === 'enter' && password.length === 6) {
      const timer = setTimeout(() => setStep('confirm'), 100);
      return () => clearTimeout(timer);
    }
  }, [password, step]);

  useEffect(() => {
    if (step === 'confirm' && confirm.length === 6) {
      handleSubmit(confirm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm]);

  const handleSubmit = async (confirmValue: string) => {
    setError('');

    if (password !== confirmValue) {
      setError('비밀번호가 일치하지 않습니다. 다시 시도해주세요.');
      setConfirm('');
      setTimeout(() => {
        setStep('enter');
        setPassword('');
        setError('');
      }, 1200);
      return;
    }

    setLoading(true);
    try {
      // 1. 2차 비밀번호 설정
      const res = await apiClient.post(
        ENDPOINTS.USERS.SECONDARY_PASSWORD(userId!),
        { secondaryPassword: password },
        accessToken ?? undefined
      );
      if (!res.ok) throw new Error('2차 비밀번호 설정에 실패했습니다.');

      // 2. 생체인증 등록 (선택)
      if (useBiometric && inWebView) {
        try {
          // 네이티브에서 UUID 생성 + Keychain 저장, 토큰 받아옴
          const deviceToken = await generateAndStoreDeviceToken();

          // 백엔드에 디바이스 토큰을 publicKey로 등록
          // registerBiometric은 isBiometricEnabled도 자동으로 true로 설정
          await apiClient.post(
            ENDPOINTS.USERS.BIOMETRIC_REGISTER(userId!),
            { publicKey: deviceToken },
            accessToken ?? undefined
          );
        } catch (bioErr) {
          // 생체인증 등록 실패해도 비밀번호 설정은 완료로 처리
          console.warn('생체인증 등록 실패:', bioErr);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['myProfile', userId] });
      await modalAlert({ message: '2차 비밀번호가 설정되었습니다.' });
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setConfirm('');
    } finally {
      setLoading(false);
    }
  };

  const getBiometricLabel = () => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('iphone') || ua.includes('ipad')) return '다음부터 Face ID 사용하기';
    }
    return '다음부터 생체인증 사용하기';
  };

  if (step === 'enter') {
    return (
      <Page>
        <HeaderBack title="2차 비밀번호 설정" onBack={() => { setPassword(''); setConfirm(''); setError(''); router.back(); }} />
        <ContentArea>
          <PinPad
            title={'비밀번호 6자리 입력'}
            value={password}
            onInput={setPassword}
          />
          {inWebView && (
            <BiometricRow onClick={() => setUseBiometric((v) => !v)}>
              <BiometricCheck checked={useBiometric}>
                {useBiometric && (
                  <CheckMark viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1.5,6 4.5,9 10.5,3" strokeLinecap="round" strokeLinejoin="round" />
                  </CheckMark>
                )}
              </BiometricCheck>
              <BiometricLabel>{getBiometricLabel()}</BiometricLabel>
            </BiometricRow>
          )}
        </ContentArea>
      </Page>
    );
  }

  return (
    <Page>
      <HeaderBack
        title="2차 비밀번호 설정"
        onBack={() => {
          setStep('enter');
          setPassword('');
          setConfirm('');
          setError('');
        }}
      />
      <ContentArea>
        <PinPad
          title={'비밀번호 한 번 더 입력'}
          value={confirm}
          onInput={setConfirm}
          error={error}
          disabled={loading}
        />
      </ContentArea>
    </Page>
  );
}
