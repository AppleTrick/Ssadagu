'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { Button } from '@/shared/ui';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import {
  colors,
  typography,
  radius,
  HEADER_HEIGHT,
  STATUS_BAR_HEIGHT,
} from '@/shared/styles/theme';

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

const LocationCard = styled.div`
  background: ${colors.bg};
  border-radius: ${radius.lg};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LocationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #EBF2FE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const LocationText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const LocationName = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.lg};
  font-weight: ${typography.weight.semibold};
  color: ${colors.textPrimary};
`;

const LocationSub = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;

const StatusBox = styled.div<{ status: 'idle' | 'loading' | 'success' | 'error' }>`
  padding: 16px;
  border-radius: ${radius.md};
  background: ${({ status }) => {
    if (status === 'success') return colors.successBg;
    if (status === 'error') return '#FFF1F2';
    return colors.bg;
  }};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${({ status }) => {
    if (status === 'success') return colors.success;
    if (status === 'error') return colors.red;
    return colors.textSecondary;
  }};
  text-align: center;
`;

const BottomBar = styled.div`
  padding: 16px 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={colors.primary}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

/* ── Component ───────────────────────────────────────────── */

export function LocationAuthPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [regionName, setRegionName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('위치 정보를 지원하지 않는 브라우저입니다.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await apiClient.post(
            '/users/me/region',
            { latitude, longitude },
            accessToken ?? undefined,
          );
          if (!res.ok) throw new Error('인증 실패');
          const body = await res.json() as Record<string, unknown>;
          const name = typeof body.regionName === 'string' ? body.regionName
            : typeof (body.data as Record<string, unknown>)?.regionName === 'string'
              ? (body.data as Record<string, unknown>).regionName as string
              : `위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)}`;
          setRegionName(name);
          setStatus('success');
        } catch {
          setStatus('error');
          setErrorMsg('위치 인증에 실패했습니다. 다시 시도해주세요.');
        }
      },
      () => {
        setStatus('error');
        setErrorMsg('위치 접근 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.');
      },
      { timeout: 10000, maximumAge: 0 },
    );
  };

  const handleConfirm = () => {
    router.push('/home');
  };

  return (
    <Page>
      <HeaderBack title="동네 인증" onBack={() => router.back()} />
      <ContentArea>
        <Section>
          <TitleBlock>
            <Title>동네를 인증해주세요</Title>
            <Desc>현재 위치를 기반으로 동네를 인증합니다.{'\n'}정확한 거래를 위해 실제 거주 지역을 인증해주세요.</Desc>
          </TitleBlock>

          {status === 'success' && regionName && (
            <LocationCard>
              <LocationRow>
                <LocationIcon>
                  <PinIcon />
                </LocationIcon>
                <LocationText>
                  <LocationName>{regionName}</LocationName>
                  <LocationSub>현재 인증된 동네</LocationSub>
                </LocationText>
              </LocationRow>
            </LocationCard>
          )}

          {status !== 'idle' && (
            <StatusBox status={status}>
              {status === 'loading' && '위치 정보를 가져오는 중...'}
              {status === 'success' && '동네 인증이 완료되었습니다!'}
              {status === 'error' && errorMsg}
            </StatusBox>
          )}
        </Section>

        <BottomBar>
          {status !== 'success' ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={status === 'loading'}
              onClick={handleGetLocation}
            >
              현재 위치로 인증하기
            </Button>
          ) : (
            <Button variant="primary" size="lg" fullWidth onClick={handleConfirm}>
              완료
            </Button>
          )}
        </BottomBar>
      </ContentArea>
    </Page>
  );
}
