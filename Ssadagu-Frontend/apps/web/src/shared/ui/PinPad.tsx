'use client';

import styled from '@emotion/styled';
import { colors, typography, radius } from '@/shared/styles/theme';

interface PinPadProps {
  title: string;
  value: string;
  maxLength?: number;
  onInput: (val: string) => void;
  error?: string;
  biometricLabel?: string;
  onBiometric?: () => void;
  onForgot?: () => void;
  disabled?: boolean;
}

export function PinPad({
  title,
  value,
  maxLength = 6,
  onInput,
  error,
  biometricLabel,
  onBiometric,
  onForgot,
  disabled = false,
}: PinPadProps) {
  const handleKey = (key: string) => {
    if (disabled) return;
    if (key === 'del') {
      onInput(value.slice(0, -1));
    } else if (value.length < maxLength) {
      onInput(value + key);
    }
  };

  return (
    <Wrapper>
      <TitleText>{title}</TitleText>

      <DotsRow>
        {Array.from({ length: maxLength }).map((_, i) => (
          <Dot key={i} filled={i < value.length} />
        ))}
      </DotsRow>

      <ErrorText role="alert">{error}</ErrorText>

      {onForgot && (
        <ForgotButton type="button" onClick={onForgot}>
          비밀번호를 모르겠어요
        </ForgotButton>
      )}

      <KeyGrid>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
          <KeyButton key={k} type="button" onClick={() => handleKey(k)} disabled={disabled}>
            {k}
          </KeyButton>
        ))}

        {/* Bottom row: biometric or empty / 0 / backspace */}
        {onBiometric ? (
          <BiometricKey type="button" onClick={onBiometric} title={biometricLabel}>
            <BiometricIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.459 7.459 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
            </BiometricIcon>
          </BiometricKey>
        ) : (
          <EmptyKey />
        )}

        <KeyButton type="button" onClick={() => handleKey('0')} disabled={disabled}>
          0
        </KeyButton>

        <BackspaceKey type="button" onClick={() => handleKey('del')} disabled={disabled}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
          </svg>
        </BackspaceKey>
      </KeyGrid>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const TitleText = styled.h2`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size['2xl']};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  text-align: center;
  margin: 0 0 28px;
  line-height: 1.4;
`;

const DotsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
`;

const Dot = styled.div<{ filled: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${({ filled }) => (filled ? colors.primary : colors.border)};
  transition: background 0.15s ease;
`;

const ErrorText = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.red};
  margin: 8px 0 0;
  text-align: center;
  min-height: 20px;
`;

const ForgotButton = styled.button`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
  background: ${colors.bg};
  border: none;
  border-radius: ${radius.pill};
  padding: 8px 18px;
  margin-top: 20px;
  cursor: pointer;
  &:active {
    opacity: 0.7;
  }
`;

const KeyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  max-width: 320px;
  gap: 0;
  margin-top: 32px;
`;

const KeyButton = styled.button`
  font-family: ${typography.fontFamily};
  font-size: 28px;
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
  background: transparent;
  border: none;
  padding: 20px 0;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  border-radius: ${radius.md};
  transition: background 0.1s;
  &:active {
    background: ${colors.bg};
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const EmptyKey = styled.div`
  padding: 20px 0;
`;

const BiometricKey = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 20px 0;
  cursor: pointer;
  border-radius: ${radius.md};
  -webkit-tap-highlight-color: transparent;
  &:active {
    background: ${colors.bg};
  }
`;

const BiometricIcon = styled.svg`
  width: 28px;
  height: 28px;
  color: ${colors.textSecondary};
`;

const BackspaceKey = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 20px 0;
  cursor: pointer;
  border-radius: ${radius.md};
  -webkit-tap-highlight-color: transparent;
  &:active {
    background: ${colors.bg};
  }
  svg {
    width: 26px;
    height: 26px;
    color: ${colors.textPrimary};
  }
`;
