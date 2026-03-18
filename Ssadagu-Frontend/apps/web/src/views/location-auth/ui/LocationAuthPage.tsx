'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { Button } from '@/shared/ui';
import { LocationPickerMap } from '@/features/location-picker';
import { useCurrentLocation } from '@/features/location-picker/model/useCurrentLocation';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import {
  colors,
  typography,
  radius,
  shadows,
  HEADER_HEIGHT,
} from '@/shared/styles/theme';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ── Styled ─────────────────────────────────────────────── */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${colors.bg};
`;

const ContentArea = styled.main`
  padding-top: ${HEADER_HEIGHT}px;
  padding-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TitleSection = styled.div`
  padding: 20px 20px 0;
`;

const Title = styled.h2`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size['2xl']};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  margin: 0 0 6px;
`;

const Desc = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

/* 지도 + 현재위치 버튼 묶음 */
const MapBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 20px;
`;

const MapCard = styled.div`
  border-radius: ${radius.lg};
  overflow: hidden;
  box-shadow: ${shadows.md};
`;

const CurrentLocBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 46px;
  width: 100%;
  border-radius: ${radius.pill};
  border: 1.5px solid ${colors.primary};
  background: ${colors.surface};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.semibold};
  color: ${colors.primary};
  cursor: pointer;
  box-shadow: ${shadows.sm};
  transition: background 0.15s, opacity 0.15s;

  &:active:not(:disabled) {
    background: #ebf2fe;
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const LocIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <circle cx="12" cy="12" r="9" strokeWidth="1.2" strokeDasharray="2 3" />
  </svg>
);

/* 선택된 동네 카드 */
const ResultCard = styled.div`
  margin: 0 20px;
  background: ${colors.surface};
  border-radius: ${radius.lg};
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.border};
`;

const ResultIconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ebf2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ResultName = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.lg};
  font-weight: ${typography.weight.semibold};
  color: ${colors.textPrimary};
`;

const ResultSub = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;

const EmptyCard = styled.div`
  margin: 0 20px;
  background: ${colors.surface};
  border-radius: ${radius.lg};
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px dashed ${colors.border};
`;

const EmptyText = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const ErrorMsg = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.red};
  margin: -8px 20px 0;
  padding: 10px 14px;
  background: #fff1f2;
  border-radius: ${radius.md};
`;

const BottomBar = styled.div`
  padding: 0 20px;
  margin-top: 4px;
`;

const PinSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#3182F6">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

/* ── Component ───────────────────────────────────────────── */

export function LocationAuthPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const mapRef = useRef<any>(null);

  const [regionName, setRegionName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { getLocation, loading: geoLoading } = useCurrentLocation({
    onSuccess: (lat, lng) => {
      mapRef.current?.setCenter(new window.kakao.maps.LatLng(lat, lng));
    },
    onError: (msg) => setError(msg),
  });

  const handleConfirm = async () => {
    if (!regionName) return;
    setError('');
    setSubmitting(true);
    try {
      await apiClient.post(ENDPOINTS.USERS.REGION, { regionName }, accessToken ?? undefined);
      router.push('/home');
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.');
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <HeaderBack title="동네 인증" onBack={() => router.back()} />

      <ContentArea>
        {/* 타이틀 — 헤더 바로 아래 */}
        <TitleSection>
          <Title>동네를 인증해주세요</Title>
          <Desc>
            지도를 움직여 거래할 동네를 선택하세요.{'\n'}
            정확한 거래를 위해 실제 거주 지역을 선택해주세요.
          </Desc>
        </TitleSection>

        {/* 지도 + 현재위치 버튼 */}
        <MapBlock>
          <MapCard>
            <LocationPickerMap
              height="240px"
              onLocationChange={setRegionName}
              onMapReady={(map) => { mapRef.current = map; }}
            />
          </MapCard>

          <CurrentLocBtn
            onClick={getLocation}
            disabled={geoLoading || !mapRef.current}
          >
            <LocIcon />
            {geoLoading ? '위치 확인 중...' : '현재 위치로 이동'}
          </CurrentLocBtn>
        </MapBlock>

        {/* 선택 결과 */}
        {regionName ? (
          <ResultCard>
            <ResultIconWrap>
              <PinSvg />
            </ResultIconWrap>
            <ResultInfo>
              <ResultName>{regionName}</ResultName>
              <ResultSub>선택한 동네</ResultSub>
            </ResultInfo>
          </ResultCard>
        ) : (
          <EmptyCard>
            <span style={{ fontSize: 20 }}>🗺️</span>
            <EmptyText>지도를 움직이면 동네가 표시됩니다</EmptyText>
          </EmptyCard>
        )}

        {error && <ErrorMsg>{error}</ErrorMsg>}

        {/* 인증 버튼 */}
        <BottomBar>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!regionName || submitting}
            onClick={handleConfirm}
          >
            이 동네로 인증하기
          </Button>
        </BottomBar>
      </ContentArea>
    </Page>
  );
}
