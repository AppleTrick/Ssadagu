"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import styled from "@emotion/styled";
import { HeaderBack } from "@/widgets/header";
import { Button, Input } from "@/shared/ui";
import { useRegisterAccount } from "@/features/register-account";
import {
  colors,
  typography,
  radius,
  HEADER_HEIGHT,
} from "@/shared/styles/theme";

/* ── Types ─────────────────────────────────────────────── */

type Step = "account-number" | "bank-select" | "transfer-info" | "verify-code";

const BANKS = [
  { code: "001", name: "한국은행" },
  { code: "004", name: "국민은행" },
  { code: "088", name: "신한은행" },
  { code: "020", name: "우리은행" },
  { code: "081", name: "하나은행" },
  { code: "003", name: "기업은행" },
  { code: "011", name: "농협은행" },
  { code: "090", name: "카카오뱅크" },
  { code: "089", name: "케이뱅크" },
  { code: "032", name: "부산은행" },
  { code: "023", name: "SC제일은행" },
];

/* ── Styled ─────────────────────────────────────────────── */

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
  gap: 32px;
  padding: 24px;
`;

const StepDots = styled.div`
  display: flex;
  gap: 6px;
`;

const Dot = styled.div<{ active: boolean }>`
  width: ${({ active }) => (active ? "20px" : "6px")};
  height: 6px;
  border-radius: 3px;
  background: ${({ active }) => (active ? colors.primary : colors.border)};
  transition: all 0.2s;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h2`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size["2xl"]};
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

/* ── Bank Select Dropdown ───────────────────────────────── */

const SelectWrapper = styled.div`
  position: relative;
`;

const SelectBox = styled.button`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${colors.surface};
  border: 1.5px solid ${colors.border};
  border-radius: ${radius.pill};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  color: ${colors.textPrimary};
  cursor: pointer;
  &:focus {
    border-color: ${colors.primary};
    outline: none;
  }
`;

const SelectPlaceholder = styled.span`
  color: ${colors.textSecondary};
`;

const Chevron = styled.span<{ open: boolean }>`
  transition: transform 0.2s;
  transform: ${({ open }) => (open ? "rotate(180deg)" : "rotate(0deg)")};
  display: flex;
`;

const DropdownList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${colors.surface};
  border: 1.5px solid ${colors.border};
  border-radius: ${radius.md};
  max-height: 240px;
  overflow-y: auto;
  z-index: 10;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const DropdownItem = styled.li<{ selected: boolean }>`
  padding: 14px 16px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  color: ${({ selected }) => (selected ? colors.primary : colors.textPrimary)};
  font-weight: ${({ selected }) =>
    selected ? typography.weight.semibold : typography.weight.regular};
  background: ${({ selected }) => (selected ? "#EBF2FE" : "transparent")};
  cursor: pointer;
  &:hover {
    background: ${colors.bg};
  }
`;

/* ── Account Number Display ─────────────────────────────── */

const AccountChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #ebf2fe;
  border-radius: ${radius.pill};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.primary};
  font-weight: ${typography.weight.medium};
`;

/* ── Info Card ──────────────────────────────────────────── */

const InfoCard = styled.div`
  background: ${colors.bg};
  border-radius: ${radius.lg};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoKey = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const InfoVal = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
`;

const InfoValHighlight = styled(InfoVal)`
  color: ${colors.primary};
  font-weight: ${typography.weight.bold};
`;

/* ── 4-digit Code Input ─────────────────────────────────── */

const CodeInputRow = styled.div`
  display: flex;
  gap: 8px;
`;

const CodeBox = styled.input`
  flex: 1;
  min-width: 0;
  height: 64px;
  border: 1.5px solid ${colors.border};
  border-radius: ${radius.md};
  text-align: center;
  font-family: ${typography.fontFamily};
  font-size: 22px;
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  background: ${colors.surface};
  outline: none;
  caret-color: ${colors.primary};

  &:focus {
    border-color: ${colors.primary};
  }
`;

const TimerNote = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
`;

/* ── Error / Bottom Bar ─────────────────────────────────── */

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

/* ── SVG Icons ──────────────────────────────────────────── */

const ChevronIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CardIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={colors.primary}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/* ── Step Dots Helper ───────────────────────────────────── */

const STEPS: Step[] = [
  "account-number",
  "bank-select",
  "transfer-info",
  "verify-code",
];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <StepDots>
      {STEPS.map((_, i) => (
        <Dot key={i} active={i === idx} />
      ))}
    </StepDots>
  );
}

/* ── Component ───────────────────────────────────────────── */

export function VerifyAccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);
  const clearToken = useAuthStore((s) => s.clearToken);
  const { register, sendVerification, confirmCode } = useRegisterAccount();
  const [accountId, setAccountId] = useState<number | null>(null);

  const [step, setStep] = useState<Step>("account-number");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankOpen, setBankOpen] = useState(false);
  const [codeDigits, setCodeDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const codeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleBack = () => {
    if (step === "bank-select") setStep("account-number");
    else if (step === "transfer-info") setStep("bank-select");
    else if (step === "verify-code") setStep("transfer-info");
    else {
      // 첫 단계에서 뒤로가기: 토큰 제거 후 로그인 페이지로
      clearToken();
      router.replace("/");
    }
  };

  /* ── Step 1 → 2 ────────────────────────────────────────── */
  const goToBankSelect = () => {
    if (!accountNumber.trim()) {
      setError("계좌번호를 입력해주세요.");
      return;
    }
    if (!accountHolderName.trim()) {
      setError("예금주명을 입력해주세요.");
      return;
    }
    setError("");
    setStep("bank-select");
  };

  /* ── Step 2 → 3 ────────────────────────────────────────── */
  const goToTransferInfo = () => {
    if (!bankCode) {
      setError("은행을 선택해주세요.");
      return;
    }
    setError("");
    setStep("transfer-info");
  };

  /* ── Step 3: 계좌 등록 + 1원 송금 (POST /accounts 단일 호출) ── */
  const handleSendTransfer = async () => {
    setError("");
    setLoading(true);
    try {
      const id = await register({ bankCode, bankName, accountNumber, accountHolderName });
      setAccountId(id);
      setStep("verify-code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 4: 인증번호 확인 (실제 API 연동) ── */
  const handleVerifyCode = async () => {
    const code = codeDigits.join("");
    if (code.length < 4) {
      setError("인증번호 4자리를 모두 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (!accountId) throw new Error("계좌 정보를 찾을 수 없습니다.");
      await confirmCode(accountId, code);
      await queryClient.invalidateQueries({ queryKey: ['myProfile', userId] });
      router.replace("/location-auth");
    } catch (e) {
      setError(e instanceof Error ? e.message : "인증에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Code digit handler ─────────────────────────────────── */
  const handleDigit = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...codeDigits];
    next[i] = digit;
    setCodeDigits(next);
    if (digit && i < 3) codeRefs[i + 1].current?.focus();
  };

  const handleDigitKey = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !codeDigits[i] && i > 0) {
      codeRefs[i - 1].current?.focus();
    }
  };

  /* ══ Render ════════════════════════════════════════════════ */

  /* Step 1 – 계좌번호 */
  if (step === "account-number") {
    return (
      <Page>
        <HeaderBack title="계좌 인증" onBack={handleBack} />
        <ContentArea>
          <Section>
            <StepIndicator current={step} />
            <TitleBlock>
              <Title>{"어떤 계좌를\n사용하시나요?"}</Title>
            </TitleBlock>
            <FieldGroup>
              <div>
                <FieldLabel>계좌번호</FieldLabel>
                <Input
                  placeholder="계좌번호를 입력해주세요 (- 없이)"
                  value={accountNumber}
                  onChange={(e) => {
                    const onlyNum = e.target.value.replace(/[^0-9]/g, '');
                    e.target.value = onlyNum;
                    setAccountNumber(onlyNum);
                    setError("");
                  }}
                  inputMode="numeric"
                />
              </div>
              <div>
                <FieldLabel>예금주명</FieldLabel>
                <Input
                  placeholder="예금주명을 입력해주세요"
                  maxLength={20}
                  value={accountHolderName}
                  onChange={(e) => {
                    const filtered = e.target.value.replace(/[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣 ]/g, '');
                    setAccountHolderName(filtered);
                    setError("");
                  }}
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
              disabled={!accountNumber.trim() || !accountHolderName.trim()}
              onClick={goToBankSelect}
            >
              다음
            </Button>
          </BottomBar>
        </ContentArea>
      </Page>
    );
  }

  /* Step 2 – 은행 선택 */
  if (step === "bank-select") {
    return (
      <Page>
        <HeaderBack title="계좌 인증" onBack={handleBack} />
        <ContentArea>
          <Section>
            <StepIndicator current={step} />
            <TitleBlock>
              <Title>{"어느 은행\n계좌인가요?"}</Title>
              <AccountChip>
                <CardIcon />
                {accountNumber}
              </AccountChip>
            </TitleBlock>
            <FieldGroup>
              <div>
                <FieldLabel>은행 선택</FieldLabel>
                <SelectWrapper>
                  <SelectBox
                    type="button"
                    onClick={() => {
                      setBankOpen((o) => !o);
                      setError("");
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={bankOpen}
                  >
                    {bankName ? (
                      <span>{bankName}</span>
                    ) : (
                      <SelectPlaceholder>은행을 선택하세요</SelectPlaceholder>
                    )}
                    <Chevron open={bankOpen}>
                      <ChevronIcon />
                    </Chevron>
                  </SelectBox>
                  {bankOpen && (
                    <DropdownList role="listbox">
                      {BANKS.map((b) => (
                        <DropdownItem
                          key={b.code}
                          selected={bankCode === b.code}
                          onClick={() => {
                            setBankCode(b.code);
                            setBankName(b.name);
                            setBankOpen(false);
                          }}
                          role="option"
                          aria-selected={bankCode === b.code}
                        >
                          {b.name}
                        </DropdownItem>
                      ))}
                    </DropdownList>
                  )}
                </SelectWrapper>
              </div>
              {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
            </FieldGroup>
          </Section>
          <BottomBar>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!bankCode}
              onClick={goToTransferInfo}
            >
              다음
            </Button>
          </BottomBar>
        </ContentArea>
      </Page>
    );
  }

  /* Step 3 – 1원 송금 안내 */
  if (step === "transfer-info") {
    return (
      <Page>
        <HeaderBack title="계좌 인증" onBack={handleBack} />
        <ContentArea>
          <Section>
            <StepIndicator current={step} />
            <TitleBlock>
              <Title>{"1원을 송금해\n드릴게요"}</Title>
              <Desc>
                {
                  "아래 계좌로 1원을 보내드릴게요.\n입금자명 끝 3자리로 인증해요"
                }
              </Desc>
            </TitleBlock>
            <InfoCard>
              <InfoRow>
                <InfoKey>은행</InfoKey>
                <InfoVal>{bankName}</InfoVal>
              </InfoRow>
              <InfoRow>
                <InfoKey>계좌번호</InfoKey>
                <InfoVal>{accountNumber}</InfoVal>
              </InfoRow>
              <InfoRow>
                <InfoKey>송금 금액</InfoKey>
                <InfoValHighlight>1원</InfoValHighlight>
              </InfoRow>
            </InfoCard>
            {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
          </Section>
          <BottomBar>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onClick={handleSendTransfer}
            >
              1원 송금받기
            </Button>
          </BottomBar>
        </ContentArea>
      </Page>
    );
  }

  /* Step 4 – 인증번호 입력 (입금자명 끝 4자리) */
  return (
    <Page>
      <HeaderBack title="계좌 인증" onBack={handleBack} />
      <ContentArea>
        <Section>
          <StepIndicator current={step} />
          <TitleBlock>
            <Title>{"입금자명 끝\n4자리를 입력해주세요"}</Title>
            <Desc>{`${bankName} ${accountNumber}로\n1원을 송금했어요`}</Desc>
          </TitleBlock>
          <FieldGroup>
            <CodeInputRow>
              {codeDigits.map((d, i) => (
                <CodeBox
                  key={i}
                  ref={codeRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKey(i, e)}
                  aria-label={`인증번호 ${i + 1}번째 자리`}
                />
              ))}
            </CodeInputRow>
            <TimerNote>
              <ClockIcon />
              입금 완료까지 최대 30초 소요될 수 있어요
            </TimerNote>
            {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
          </FieldGroup>
        </Section>
        <BottomBar>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!codeDigits.every(Boolean)}
            loading={loading}
            onClick={handleVerifyCode}
          >
            인증 완료
          </Button>
        </BottomBar>
      </ContentArea>
    </Page>
  );
}
