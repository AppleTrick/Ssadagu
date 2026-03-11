'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import Button from '@/shared/ui/Button';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { MOCK_TOKEN } from '@/shared/mocks/mockData';

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

/* ── Component ───────────────────────────────────────────── */

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const setToken = useAuthStore((s) => s.setToken);
  const [serverError, setServerError] = useState<string | null>(null);

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
    setToken(MOCK_TOKEN);
    onSuccess?.();
  };

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        email: data.email,
        password: data.password,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        setServerError(
          typeof body?.message === 'string'
            ? body.message
            : '로그인에 실패했습니다. 다시 시도해주세요.',
        );
        return;
      }

      const body = await res.json() as Record<string, unknown>;
      const nested = body?.data as Record<string, unknown> | undefined;
      const token =
        typeof body?.accessToken === 'string'
          ? body.accessToken
          : typeof nested?.accessToken === 'string'
            ? nested.accessToken
            : '';

      if (token) setToken(token);
      onSuccess?.();
    } catch {
      setServerError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
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
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              시작하기
            </Button>
          </ButtonArea>
        </Form>

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
