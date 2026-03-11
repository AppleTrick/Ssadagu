'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import Button from '@/shared/ui/Button';
import { useSignupForm } from '../model/useSignupForm';

interface SignupFormProps {
  onSuccess?: () => void;
}

/* ── Layout ─────────────────────────────────────────────── */

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  width: 100%;
  background: ${colors.surface};
  padding: 0 24px;
  box-sizing: border-box;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 390px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin-bottom: 28px;
  flex-shrink: 0;
`;

const Title = styled.h1`
  font-family: ${typography.fontFamily};
  font-size: 24px;
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  text-align: center;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-family: ${typography.fontFamily};
  font-size: 14px;
  color: ${colors.textSecondary};
  text-align: center;
  line-height: 1.6;
  margin-bottom: 40px;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const FieldLabel = styled.label`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
`;

const FieldInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  color: ${colors.textPrimary};
  background: ${colors.surface};
  border: 1.5px solid ${({ hasError }) => (hasError ? colors.red : colors.border)};
  border-radius: 999px;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;

  &::placeholder {
    color: ${colors.textSecondary};
  }

  &:focus {
    border-color: ${({ hasError }) => (hasError ? colors.red : colors.primary)};
  }
`;

const FieldError = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${colors.red};
  padding-left: 4px;
`;

const ServerError = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.red};
  text-align: center;
  padding-top: 4px;
`;

const ButtonArea = styled.div`
  width: 100%;
  padding-top: 8px;
`;

const LoginLink = styled.div`
  margin-top: 20px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
  text-align: center;

  a {
    color: ${colors.primary};
    font-weight: ${typography.weight.medium};
    text-decoration: none;
  }
`;

/* ── Component ───────────────────────────────────────────── */

const SignupForm = ({ onSuccess }: SignupFormProps) => {
  const { signup, loading, error: serverError } = useSignupForm();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = '이메일을 입력해주세요';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = '올바른 이메일을 입력해주세요';
    if (!password) errs.password = '비밀번호를 입력해주세요';
    else if (password.length < 6) errs.password = '비밀번호는 최소 6자 이상이어야 합니다';
    if (!nickname.trim()) errs.nickname = '닉네임을 입력해주세요';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await signup({ email, password, nickname });
    if (ok) onSuccess?.();
  };

  return (
    <Screen>
      <Inner>
        <IconCircle aria-hidden="true">🤝</IconCircle>
        <Title>회원가입</Title>
        <Subtitle>{'계좌 인증 한번으로 시작하는\n신뢰 기반 중고거래'}</Subtitle>

        <Form onSubmit={handleSubmit} noValidate>
          <FieldWrapper>
            <FieldLabel htmlFor="signup-email">이메일</FieldLabel>
            <FieldInput
              id="signup-email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              hasError={!!fieldErrors.email}
            />
            {fieldErrors.email && <FieldError role="alert">{fieldErrors.email}</FieldError>}
          </FieldWrapper>

          <FieldWrapper>
            <FieldLabel htmlFor="signup-password">비밀번호</FieldLabel>
            <FieldInput
              id="signup-password"
              type="password"
              placeholder="비밀번호를 입력하세요 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hasError={!!fieldErrors.password}
            />
            {fieldErrors.password && <FieldError role="alert">{fieldErrors.password}</FieldError>}
          </FieldWrapper>

          <FieldWrapper>
            <FieldLabel htmlFor="signup-nickname">닉네임</FieldLabel>
            <FieldInput
              id="signup-nickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              hasError={!!fieldErrors.nickname}
            />
            {fieldErrors.nickname && <FieldError role="alert">{fieldErrors.nickname}</FieldError>}
          </FieldWrapper>

          {serverError && <ServerError role="alert">{serverError}</ServerError>}

          <ButtonArea>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              가입하기
            </Button>
          </ButtonArea>
        </Form>

        <LoginLink>
          이미 계정이 있으신가요? <Link href="/">로그인</Link>
        </LoginLink>
      </Inner>
    </Screen>
  );
};

export default SignupForm;
