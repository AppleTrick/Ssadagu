import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import styled from "@emotion/styled";
import { colors, typography } from "@/shared/styles/theme";
import Button from "@/shared/ui/Button";
import { useSignupForm } from "../model/useSignupForm";

interface SignupFormProps {
  onSuccess?: () => void;
}

/* ── Validation Schema ──────────────────────────────────── */

const signupSchema = z
  .object({
    email: z.string().min(1, "이메일을 입력해주세요").email("올바른 이메일을 입력해주세요"),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요"),
    nickname: z.string().min(1, "닉네임을 입력해주세요").trim(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });

type SignupSchema = z.infer<typeof signupSchema>;

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

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const FieldInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  padding-right: 48px; /* For toggle button */
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

const ToggleButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${colors.textPrimary};
  }
`;

const FieldError = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${colors.red};
  padding-left: 12px;
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
  margin-bottom: 12px;
  white-space: pre-line;
`;

const SuccessNotice = styled.p`
  font-family: ${typography.fontFamily};
  font-size: 14px;
  color: ${colors.textSecondary};
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32px;
  white-space: pre-line;

  strong {
    color: ${colors.primary};
    font-weight: ${typography.weight.bold};
  }
`;

/* ── Icons ─────────────────────────────────────────────── */

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ── Component ───────────────────────────────────────────── */

const SignupForm = ({ onSuccess }: SignupFormProps) => {
  const { signup, loading, error: serverError } = useSignupForm();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const nicknameValue = watch("nickname");

  const fireConfetti = () => {
    const canvas = document.getElementById("confetti-canvas") as HTMLCanvasElement;
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
      speedX: side === "left" ? Math.random() * 6 + 3 : -(Math.random() * 6 + 3),
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

  const onSubmit = async (data: SignupSchema) => {
    const ok = await signup({
      email: data.email,
      password: data.password,
      nickname: data.nickname,
    });
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
          <SuccessTitle>{`${nicknameValue}님,\n환영합니다!`}</SuccessTitle>
          <SuccessNotice>
            {"회원가입이 완료되었습니다.\n"}
            {"로그인 후 서비스를 이용해주세요."}
          </SuccessNotice>
          <ButtonArea>
            <Button variant="primary" size="lg" fullWidth onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}>
              로그인하러 가기
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

        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldWrapper>
            <FieldLabel htmlFor="signup-email">이메일</FieldLabel>
            <FieldInput
              id="signup-email"
              type="email"
              placeholder="이메일을 입력하세요"
              hasError={!!errors.email}
              {...register("email")}
            />
            {errors.email && <FieldError role="alert">{errors.email.message}</FieldError>}
          </FieldWrapper>

          <FieldWrapper>
            <FieldLabel htmlFor="signup-password">비밀번호</FieldLabel>
            <InputContainer>
              <FieldInput
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요 (6자 이상)"
                hasError={!!errors.password}
                {...register("password")}
              />
              <ToggleButton type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보이기"}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </ToggleButton>
            </InputContainer>
            {errors.password && <FieldError role="alert">{errors.password.message}</FieldError>}
          </FieldWrapper>

          <FieldWrapper>
            <FieldLabel htmlFor="signup-password-confirm">비밀번호 확인</FieldLabel>
            <InputContainer>
              <FieldInput
                id="signup-password-confirm"
                type={showPasswordConfirm ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                hasError={!!errors.passwordConfirm}
                {...register("passwordConfirm")}
              />
              <ToggleButton type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} aria-label={showPasswordConfirm ? "비밀번호 숨기기" : "비밀번호 보이기"}>
                {showPasswordConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </ToggleButton>
            </InputContainer>
            {errors.passwordConfirm && <FieldError role="alert">{errors.passwordConfirm.message}</FieldError>}
          </FieldWrapper>

          <FieldWrapper>
            <FieldLabel htmlFor="signup-nickname">닉네임</FieldLabel>
            <FieldInput
              id="signup-nickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              hasError={!!errors.nickname}
              {...register("nickname")}
            />
            {errors.nickname && <FieldError role="alert">{errors.nickname.message}</FieldError>}
          </FieldWrapper>

          {serverError && <ServerError role="alert">{serverError}</ServerError>}

          <ButtonArea>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={loading}>
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
