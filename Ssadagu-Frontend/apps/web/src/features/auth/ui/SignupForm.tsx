"use client";

import { useState } from "react";
import Link from "next/link";
import styled from "@emotion/styled";
import { colors, typography } from "@/shared/styles/theme";
import Button from "@/shared/ui/Button";
import { useSignupForm } from "../model/useSignupForm";

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
  border: 1.5px solid
    ${({ hasError }) => (hasError ? colors.red : colors.border)};
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

/* ── Success Screen ─────────────────────────────────── */

const SuccessTitle = styled(Title)`
  font-size: 28px;
  margin-top: 20px;
  margin-bottom: 40px;
  white-space: pre-line;
`;

/* ── Component ───────────────────────────────────────────── */

const SignupForm = ({ onSuccess }: SignupFormProps) => {
  const { signup, loading, error: serverError } = useSignupForm();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = "이메일을 입력해주세요";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "올바른 이메일을 입력해주세요";
    if (!password) errs.password = "비밀번호를 입력해주세요";
    else if (password.length < 6)
      errs.password = "비밀번호는 최소 6자 이상이어야 합니다";
    if (!nickname.trim()) errs.nickname = "닉네임을 입력해주세요";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const fireConfetti = () => {
    const canvas = document.getElementById(
      "confetti-canvas",
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces: any[] = [];
    const colors = ["#3182f6", "#00d084", "#ff4d4f", "#ffcc00", "#9c27b0"];

    const createPiece = (side: "left" | "right") => ({
      x: side === "left" ? 0 : canvas.width,
      y: canvas.height,
      size: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX:
        side === "left" ? Math.random() * 6 + 3 : -(Math.random() * 6 + 3),
      speedY: -(Math.random() * 10 + 10),
      gravity: 0.2,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 8 - 4,
      opacity: 1,
    });

    for (let i = 0; i < 140; i++) {
      pieces.push(createPiece(i % 2 === 0 ? "left" : "right"));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      pieces.forEach((p) => {
        p.speedY += p.gravity;
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.0025;

        if (p.opacity > 0 && p.y < canvas.height + 100) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) requestAnimationFrame(animate);
    };

    animate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await signup({ email, password, nickname });
    if (ok) {
      setIsSuccess(true);
      setTimeout(fireConfetti, 100);
    }
  };

  if (isSuccess) {
    return (
      <Screen>
        <canvas
          id="confetti-canvas"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 100,
          }}
        />
        <Inner>
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>🎉</div>
          <SuccessTitle>{`${nickname}님,\n회원가입에 성공했습니다!`}</SuccessTitle>
          <ButtonArea>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => onSuccess?.()}
            >
              다음
            </Button>
          </ButtonArea>
        </Inner>
      </Screen>
    );
  }

  return (
    <Screen>
      <Inner>
        <IconCircle aria-hidden="true">🤝</IconCircle>
        <Title>회원가입</Title>
        <Subtitle>{"계좌 인증 한번으로 시작하는\n신뢰 기반 중고거래"}</Subtitle>

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
            {fieldErrors.email && (
              <FieldError role="alert">{fieldErrors.email}</FieldError>
            )}
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
            {fieldErrors.password && (
              <FieldError role="alert">{fieldErrors.password}</FieldError>
            )}
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
            {fieldErrors.nickname && (
              <FieldError role="alert">{fieldErrors.nickname}</FieldError>
            )}
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
