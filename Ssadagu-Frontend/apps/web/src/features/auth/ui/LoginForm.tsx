'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import Button from '@/shared/ui/Button';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { MOCK_TOKEN } from '@/shared/mocks/mockData';
import { useLoginForm } from '../model/useLoginForm';

const schema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

type FormValues = z.infer<typeof schema>;

interface LoginFormProps {
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
  white-space: pre-line;
  line-height: 1.35;
  margin-bottom: 12px;
`;

const Subtitle = styled.p`
  font-family: ${typography.fontFamily};
  font-size: 14px;
  color: ${colors.textSecondary};
  text-align: center;
  white-space: pre-line;
  line-height: 1.6;
  margin-bottom: 40px;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/* ── Custom field (no external Input to avoid ref conflict) ─ */

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

const DevButton = styled.button`
  margin-top: 24px;
  width: 100%;
  height: 44px;
  border: 1.5px dashed ${colors.border};
  border-radius: 999px;
  background: none;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
  cursor: pointer;
  &:hover { background: ${colors.bg}; }
`;

const SignupLink = styled.div`
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

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const setAuthInfo = useAuthStore((s) => s.setAuthInfo);
  const { login, loading, error: serverError } = useLoginForm();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const handleDevLogin = () => {
    if (process.env.NEXT_PUBLIC_MSW_ENABLED !== 'true') return;
    setAuthInfo(MOCK_TOKEN, 1);
    onSuccess?.();
  };

  const onSubmit = async (data: FormValues) => {
    const ok = await login(data.email, data.password);
    if (ok) onSuccess?.();
  };

  return (
    <Screen>
      <Inner>
        <IconCircle aria-hidden="true">🤝</IconCircle>

        <Title>{'안전하고 빠른\n우리 동네 직거래'}</Title>
        <Subtitle>{'계좌 인증 한번으로 시작하는\n신뢰 기반 중고거래'}</Subtitle>

        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldWrapper>
            <FieldLabel htmlFor="login-email">이메일</FieldLabel>
            <FieldInput
              id="login-email"
              type="email"
              placeholder="이메일을 입력하세요"
              hasError={!!errors.email}
              {...register('email')}
            />
            {errors.email && <FieldError role="alert">{errors.email.message}</FieldError>}
          </FieldWrapper>

          <FieldWrapper>
            <FieldLabel htmlFor="login-password">비밀번호</FieldLabel>
            <FieldInput
              id="login-password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              hasError={!!errors.password}
              {...register('password')}
            />
            {errors.password && <FieldError role="alert">{errors.password.message}</FieldError>}
          </FieldWrapper>

          {serverError && <ServerError role="alert">{serverError}</ServerError>}

          <ButtonArea>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading || isSubmitting}
              disabled={loading || isSubmitting}
            >
              시작하기
            </Button>
          </ButtonArea>
        </Form>

        <SignupLink>
          계정이 없으신가요? <Link href="/signup">회원가입</Link>
        </SignupLink>

        {process.env.NEXT_PUBLIC_MSW_ENABLED === 'true' && (
          <DevButton type="button" onClick={handleDevLogin}>
            🛠 개발 모드로 입장 (Mock)
          </DevButton>
        )}
      </Inner>
    </Screen>
  );
};

export default LoginForm;
