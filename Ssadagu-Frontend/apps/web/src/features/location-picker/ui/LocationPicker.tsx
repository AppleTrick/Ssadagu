'use client';

import { useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';
import MapBase from '@/shared/ui/MapBase';
import { colors, radius, typography } from '@/shared/styles/theme';

/* eslint-disable @typescript-eslint/no-explicit-any */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const MapWrapper = styled.div`
  flex: 1;
  min-height: 300px;
  position: relative;
`;

const CenterPin = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  font-size: 32px;
  pointer-events: none;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
`;

const InfoBar = styled.div`
  padding: 16px;
  background: ${colors.surface};
  border-top: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LocationText = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textPrimary};
  margin: 0;
`;

const PlaceholderText = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
  margin: 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Btn = styled.button<{ primary?: boolean }>`
  flex: 1;
  height: 48px;
  border-radius: ${radius.pill};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.semibold};
  cursor: pointer;
  transition: opacity 0.15s;

  &:active:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  ${({ primary }) =>
    primary
      ? `background: ${colors.primary}; color: #fff; border: none;`
      : `background: transparent; color: ${colors.textPrimary}; border: 1.5px solid ${colors.border};`}
`;

interface LocationPickerProps {
  onSelect: (regionName: string) => void;
}

const LocationPicker = ({ onSelect }: LocationPickerProps) => {
  const mapRef = useRef<any>(null);
  const [selectedName, setSelectedName] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(lng, lat, (result: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        // 행정동(H) 우선, 없으면 첫 번째 결과
        const region = result.find((r: any) => r.region_type === 'H') ?? result[0];
        setSelectedName(region?.address_name ?? '');
      }
    });
  }, []);

  const handleMapReady = useCallback(
    (map: any) => {
      mapRef.current = map;

      // 지도가 멈출 때마다 중심 좌표로 역지오코딩
      window.kakao.maps.event.addListener(map, 'idle', () => {
        const center = map.getCenter();
        reverseGeocode(center.getLat(), center.getLng());
      });

      // 초기 중심 역지오코딩
      const center = map.getCenter();
      reverseGeocode(center.getLat(), center.getLng());
    },
    [reverseGeocode],
  );

  const handleCurrentLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        mapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
    );
  };

  return (
    <Container>
      <MapWrapper>
        <MapBase onMapReady={handleMapReady} />
        <CenterPin aria-hidden="true">📍</CenterPin>
      </MapWrapper>

      <InfoBar>
        {selectedName ? (
          <LocationText>📍 {selectedName}</LocationText>
        ) : (
          <PlaceholderText>지도를 움직여서 동네를 선택하세요</PlaceholderText>
        )}

        <ButtonRow>
          <Btn
            onClick={handleCurrentLocation}
            disabled={geoLoading || !mapRef.current}
          >
            {geoLoading ? '위치 확인 중...' : '현재 위치'}
          </Btn>
          <Btn primary onClick={() => onSelect(selectedName)} disabled={!selectedName}>
            선택하기
          </Btn>
        </ButtonRow>
      </InfoBar>
    </Container>
  );
};

export default LocationPicker;
