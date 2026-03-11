'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { Button, Input } from '@/shared/ui';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import {
  colors,
  typography,
  radius,
  HEADER_HEIGHT,
  STATUS_BAR_HEIGHT,
} from '@/shared/styles/theme';

/* ── Types ─────────────────────────────────────────────── */

type Step = 'account-input' | 'bank-select' | 'transfer-info' | 'verify-code';

const BANKS = [
  { code: '004', name: '국민은행' },
  { code: '088', name: '신한은행' },
  { code: '020', name: '우리은행' },
  { code: '081', name: '하나은행' },
  { code: '003', name: '기업은행' },
  { code: '011', name: '농협은행' },
  { code: '032', name: '부산은행' },
  { code: '023', name: 'SC제일은행' },
  { code: '039', name: '경남은행' },
  { code: '034', name: '광주은행' },
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
  padding-top: ${HEADER_HEIGHT + STATUS_BAR_HEIGHT}px;
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

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h2`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size['2xl']};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  margin: 0;
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

const BankSelectBox = styled.button`
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
  &:hover { border-color: ${colors.primary}; }
`;

const BankPlaceholder = styled.span`
  color: ${colors.textSecondary};
`;

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

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

/* ── Bank Select List ───────────────────────────────────── */

const BankList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const BankItem = styled.button<{ selected: boolean }>`
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${radius.md};
  border: 1.5px solid ${({ selected }) => (selected ? colors.primary : colors.border)};
  background: ${({ selected }) => (selected ? '#EBF2FE' : colors.surface)};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  font-weight: ${({ selected }) => (selected ? typography.weight.semibold : typography.weight.regular)};
  color: ${({ selected }) => (selected ? colors.primary : colors.textPrimary)};
  cursor: pointer;
`;

/* ── Transfer Info ──────────────────────────────────────── */

const InfoCard = styled.div`
  background: ${colors.bg};
  border-radius: ${radius.lg};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

const HighlightVal = styled(InfoVal)`
  color: ${colors.primary};
  font-weight: ${typography.weight.bold};
`;

/* ── Component ───────────────────────────────────────────── */

export function VerifyAccountPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [step, setStep] = useState<Step>('account-input');
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [accountId, setAccountId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Step 1: 계좌 등록 ─────────────────────────────────── */

  const handleRegisterAccount = async () => {
    if (!bankCode) { setError('은행을 선택해주세요.'); return; }
    if (!accountNumber.trim()) { setError('계좌번호를 입력해주세요.'); return; }
    if (!holderName.trim()) { setError('예금주명을 입력해주세요.'); return; }

    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post(
        ENDPOINTS.ACCOUNTS.BASE,
        { bankCode, accountNumber, accountHolderName: holderName },
        accessToken ?? undefined,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        setError(typeof body.message === 'string' ? body.message : '계좌 등록에 실패했습니다.');
        return;
      }
      const body = await res.json() as Record<string, unknown>;
      const id = typeof body.id === 'number' ? body.id
        : typeof (body.data as Record<string, unknown>)?.id === 'number'
          ? (body.data as Record<string, unknown>).id as number
          : null;
      if (id) setAccountId(id);
      setStep('transfer-info');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 4: 인증번호 확인 ─────────────────────────────── */

  const handleVerifyCode = async () => {
    if (!verifyCode.trim()) { setError('인증번호를 입력해주세요.'); return; }
    if (!accountId) { setError('계좌 정보가 없습니다.'); return; }

    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post(
        ENDPOINTS.ACCOUNTS.VERIFY_CONFIRM(accountId),
        { code: verifyCode },
        accessToken ?? undefined,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        setError(typeof body.message === 'string' ? body.message : '인증에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      router.push('/home');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'bank-select') setStep('account-input');
    else if (step === 'transfer-info') setStep('account-input');
    else if (step === 'verify-code') setStep('transfer-info');
    else router.back();
  };

  const stepTitles: Record<Step, string> = {
    'account-input': '계좌 인증',
    'bank-select': '계좌 인증',
    'transfer-info': '계좌 인증',
    'verify-code': '계좌 인증',
  };

  /* ── Render: Step 1 - 계좌번호 입력 ────────────────────── */

  if (step === 'account-input') {
    return (
      <Page>
        <HeaderBack title={stepTitles[step]} onBack={handleBack} />
        <ContentArea>
          <Section>
            <TitleBlock>
              <Title>계좌를 등록해주세요</Title>
              <Desc>거래에 사용할 계좌를 입력해주세요.</Desc>
            </TitleBlock>
            <FieldGroup>
              <div>
                <FieldLabel>은행</FieldLabel>
                <BankSelectBox type="button" onClick={() => setStep('bank-select')}>
                  {bankName ? <span>{bankName}</span> : <BankPlaceholder>은행을 선택하세요</BankPlaceholder>}
                  <ChevronDown />
                </BankSelectBox>
              </div>
              <div>
                <FieldLabel>계좌번호</FieldLabel>
                <Input
                  placeholder="계좌번호를 입력하세요 (- 없이)"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div>
                <FieldLabel>예금주명</FieldLabel>
                <Input
                  placeholder="예금주명을 입력하세요"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                />
              </div>
              {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
            </FieldGroup>
          </Section>
          <BottomBar>
            <Button variant="primary" size="lg" fullWidth loading={loading} onClick={handleRegisterAccount}>
              다음
            </Button>
          </BottomBar>
        </ContentArea>
      </Page>
    );
  }

  /* ── Render: Step 2 - 은행 선택 ─────────────────────────── */

  if (step === 'bank-select') {
    return (
      <Page>
        <HeaderBack title="은행 선택" onBack={handleBack} />
        <ContentArea>
          <Section>
            <TitleBlock>
              <Title>은행을 선택하세요</Title>
            </TitleBlock>
            <BankList>
              {BANKS.map((bank) => (
                <BankItem
                  key={bank.code}
                  selected={bankCode === bank.code}
                  onClick={() => {
                    setBankCode(bank.code);
                    setBankName(bank.name);
                    setStep('account-input');
                  }}
                >
                  {bank.name}
                </BankItem>
              ))}
            </BankList>
          </Section>
        </ContentArea>
      </Page>
    );
  }

  /* ── Render: Step 3 - 1원 송금 안내 ─────────────────────── */

  if (step === 'transfer-info') {
    return (
      <Page>
        <HeaderBack title={stepTitles[step]} onBack={handleBack} />
        <ContentArea>
          <Section>
            <TitleBlock>
              <Title>1원을 송금했어요</Title>
              <Desc>등록하신 계좌로 1원을 송금했습니다.{'\n'}입금 내역의 인증번호 4자리를 확인해주세요.</Desc>
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
                <InfoKey>예금주</InfoKey>
                <InfoVal>{holderName}</InfoVal>
              </InfoRow>
              <InfoRow>
                <InfoKey>송금 금액</InfoKey>
                <HighlightVal>1원</HighlightVal>
              </InfoRow>
            </InfoCard>
          </Section>
          <BottomBar>
            <Button variant="primary" size="lg" fullWidth onClick={() => setStep('verify-code')}>
              인증번호 입력하기
            </Button>
          </BottomBar>
        </ContentArea>
      </Page>
    );
  }

  /* ── Render: Step 4 - 인증번호 입력 ─────────────────────── */

  return (
    <Page>
      <HeaderBack title={stepTitles[step]} onBack={handleBack} />
      <ContentArea>
        <Section>
          <TitleBlock>
            <Title>인증번호를 입력해주세요</Title>
            <Desc>입금 내역에 표시된{'\n'}4자리 인증번호를 입력하세요.</Desc>
          </TitleBlock>
          <FieldGroup>
            <div>
              <FieldLabel>인증번호</FieldLabel>
              <Input
                placeholder="인증번호 4자리"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={4}
                inputMode="numeric"
              />
            </div>
            {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
          </FieldGroup>
        </Section>
        <BottomBar>
          <Button variant="primary" size="lg" fullWidth loading={loading} onClick={handleVerifyCode}>
            인증 완료
          </Button>
        </BottomBar>
      </ContentArea>
    </Page>
  );
}
