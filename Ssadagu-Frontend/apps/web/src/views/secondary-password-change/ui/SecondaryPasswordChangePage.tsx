'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { PinPad } from '@/shared/ui/PinPad';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { useModalStore } from '@/shared/hooks/useModalStore';
import {
  colors,
  HEADER_HEIGHT,
} from '@/shared/styles/theme';

type Step = 'verify' | 'new' | 'confirm';

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

export function SecondaryPasswordChangePage() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { alert: modalAlert } = useModalStore();

  const [step, setStep] = useState<Step>('verify');
  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step: verify - 기존 비밀번호 6자리 완성 시
  useEffect(() => {
    if (step === 'verify' && current.length === 6) {
      handleVerify(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Step: new - 새 비밀번호 6자리 완성 시
  useEffect(() => {
    if (step === 'new' && newPwd.length === 6) {
      const timer = setTimeout(() => setStep('confirm'), 100);
      return () => clearTimeout(timer);
    }
  }, [newPwd, step]);

  // Step: confirm - 확인 6자리 완성 시
  useEffect(() => {
    if (step === 'confirm' && confirm.length === 6) {
      handleChange(confirm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm]);

  const handleVerify = async (pwd: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post(
        ENDPOINTS.USERS.VERIFY_SECONDARY_PASSWORD(userId!),
        { secondaryPassword: pwd },
        accessToken ?? undefined
      );
      if (!res.ok) throw new Error('기존 2차 비밀번호가 일치하지 않습니다.');
      setStep('new');
      setCurrent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 실패');
      setCurrent('');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (confirmValue: string) => {
    setError('');
    if (newPwd !== confirmValue) {
      setError('비밀번호가 일치하지 않습니다. 다시 시도해주세요.');
      setConfirm('');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post(
        ENDPOINTS.USERS.SECONDARY_PASSWORD(userId!),
        { secondaryPassword: newPwd },
        accessToken ?? undefined
      );
      if (!res.ok) throw new Error('2차 비밀번호 변경에 실패했습니다.');
      await modalAlert({ message: '2차 비밀번호가 변경되었습니다.' });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setConfirm('');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <Page>
        <HeaderBack title="2차 비밀번호 변경" onBack={() => router.back()} />
        <ContentArea>
          <PinPad
            title={'기존 비밀번호 입력'}
            value={current}
            onInput={(val) => {
              setCurrent(val);
              if (error) setError('');
            }}
            error={error}
            disabled={loading}
          />
        </ContentArea>
      </Page>
    );
  }

  if (step === 'new') {
    return (
      <Page>
        <HeaderBack title="2차 비밀번호 변경" onBack={() => { setStep('verify'); setCurrent(''); setError(''); }} />
        <ContentArea>
          <PinPad
            title={'새 비밀번호 입력'}
            value={newPwd}
            onInput={(val) => {
              setNewPwd(val);
              if (error) setError('');
            }}
          />
        </ContentArea>
      </Page>
    );
  }

  return (
    <Page>
      <HeaderBack
        title="2차 비밀번호 변경"
        onBack={() => { setStep('new'); setNewPwd(''); setConfirm(''); setError(''); }}
      />
      <ContentArea>
        <PinPad
          title={'새 비밀번호 한 번 더'}
          value={confirm}
          onInput={(val) => {
            setConfirm(val);
            if (error) setError('');
          }}
          error={error}
          disabled={loading}
        />
      </ContentArea>
    </Page>
  );
}
