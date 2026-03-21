'use client';

import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { PinPad } from '@/shared/ui/PinPad';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, radius, shadows, zIndex } from '@/shared/styles/theme';
import {
  isInWebView,
  requestBiometricAuth,
} from '@/shared/lib/biometricBridge';

interface TransactionAuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

const Overlay = styled.div<{ visible: boolean }>`
  position: fixed;
  inset: 0;
  background: ${colors.overlay};
  z-index: ${zIndex.modal};
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  pointer-events: ${({ visible }) => (visible ? 'auto' : 'none')};
  transition: opacity 0.2s ease;
`;

const Sheet = styled.div`
  position: relative;
  width: 100%;
  max-width: 480px;
  background: ${colors.surface};
  border-radius: ${radius.lg} ${radius.lg} 0 0;
  padding: 20px 24px 48px;
  box-shadow: ${shadows.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Handle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: ${radius.pill};
  background: ${colors.border};
  margin-bottom: 24px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${colors.textSecondary};
  font-size: 20px;
  line-height: 1;
`;

const BiometricButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.primary};
  background: none;
  border: none;
  cursor: pointer;
  margin-top: 16px;
  padding: 8px 12px;
  border-radius: ${radius.md};
  &:active {
    background: ${colors.bg};
  }
`;

const BiometricIcon = styled.svg`
  width: 20px;
  height: 20px;
`;

const TransactionAuthModal = ({ isOpen, onSuccess, onClose }: TransactionAuthModalProps) => {
  const userId = useAuthStore((s) => s.userId);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inWebView, setInWebView] = useState(false);

  useEffect(() => {
    setInWebView(isInWebView());
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setError('');
    }
  }, [isOpen]);

  // PIN 6자리 완성 시 자동 검증
  useEffect(() => {
    if (pin.length === 6) {
      handleVerifyPin(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  /** 2차 비밀번호로 검증 */
  const handleVerifyPin = async (value: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post(
        ENDPOINTS.USERS.VERIFY_SECONDARY_PASSWORD(userId!),
        { secondaryPassword: value },
        accessToken ?? undefined
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, any>;
        throw new Error(body.message || '비밀번호가 일치하지 않습니다.');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 실패');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  /** 생체인증 → 디바이스 토큰으로 백엔드 검증 */
  const handleBiometric = async () => {
    setError('');
    setLoading(true);
    try {
      // 네이티브 생체인증 수행 + Keychain에서 UUID 토큰 획득
      const result = await requestBiometricAuth();

      if (!result.success || !result.token) {
        if (result.error === 'cancelled') {
          setError('');
        } else if (result.error === 'no_token_stored') {
          setError('생체인증이 등록되지 않았습니다. 비밀번호를 입력해주세요.');
        } else {
          setError('생체인증에 실패했습니다. 비밀번호를 입력해주세요.');
        }
        return;
      }

      // 백엔드에 디바이스 토큰(publicKey)으로 검증
      const res = await apiClient.post(
        ENDPOINTS.USERS.BIOMETRIC_VERIFY(userId!),
        { publicKey: result.token },
        accessToken ?? undefined
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, any>;
        throw new Error(body.message || '생체인증 검증에 실패했습니다.');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '생체인증 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getBiometricLabel = () => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('iphone') || ua.includes('ipad')) return 'Face ID로 인증';
    }
    return '생체인증으로 인증';
  };

  return (
    <Overlay visible={isOpen} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Sheet>
        <Handle />
        <CloseButton onClick={onClose} aria-label="닫기">✕</CloseButton>

        <PinPad
          title={'결제 비밀번호 입력'}
          value={pin}
          onInput={setPin}
          error={error}
          disabled={loading}
          onBiometric={inWebView ? handleBiometric : undefined}
          biometricLabel={getBiometricLabel()}
        />

        {inWebView && (
          <BiometricButton type="button" onClick={handleBiometric} disabled={loading}>
            <BiometricIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.459 7.459 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
            </BiometricIcon>
            {getBiometricLabel()}
          </BiometricButton>
        )}
      </Sheet>
    </Overlay>
  );
};

export default TransactionAuthModal;
