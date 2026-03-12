'use client';

import { useRef, useState } from 'react';
import styled from '@emotion/styled';
import LocationPickerMap from './LocationPickerMap';
import { useCurrentLocation } from '../model/useCurrentLocation';
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

const Btn = styled.button<{ $primary?: boolean }>`
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

  ${({ $primary }) =>
    $primary
      ? `background: ${colors.primary}; color: #fff; border: none;`
      : `background: transparent; color: ${colors.textPrimary}; border: 1.5px solid ${colors.border};`}
`;

interface LocationPickerProps {
  onSelect: (regionName: string) => void;
}

const LocationPicker = ({ onSelect }: LocationPickerProps) => {
  const mapRef = useRef<any>(null);
  const [selectedName, setSelectedName] = useState('');

  const { getLocation, loading } = useCurrentLocation({
    onSuccess: (lat, lng) => {
      mapRef.current?.setCenter(new window.kakao.maps.LatLng(lat, lng));
    },
  });

  return (
    <Container>
      <MapWrapper>
        <LocationPickerMap
          height="100%"
          onLocationChange={setSelectedName}
          onMapReady={(map) => { mapRef.current = map; }}
        />
      </MapWrapper>

      <InfoBar>
        {selectedName ? (
          <LocationText>📍 {selectedName}</LocationText>
        ) : (
          <PlaceholderText>지도를 움직여서 동네를 선택하세요</PlaceholderText>
        )}
        <ButtonRow>
          <Btn onClick={getLocation} disabled={loading || !mapRef.current}>
            {loading ? '위치 확인 중...' : '현재 위치'}
          </Btn>
          <Btn $primary onClick={() => onSelect(selectedName)} disabled={!selectedName}>
            선택하기
          </Btn>
        </ButtonRow>
      </InfoBar>
    </Container>
  );
};

export default LocationPicker;
