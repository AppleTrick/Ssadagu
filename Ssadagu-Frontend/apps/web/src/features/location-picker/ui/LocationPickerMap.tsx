'use client';

import { useCallback } from 'react';
import styled from '@emotion/styled';
import MapBase from '@/shared/ui/MapBase';
import MapMarker from './MapMarker';

/* eslint-disable @typescript-eslint/no-explicit-any */

const Wrapper = styled.div<{ $height: string }>`
  width: 100%;
  height: ${({ $height }) => $height};
  position: relative;
  overflow: hidden;
`;

/** 마커 포인트(하단 중앙)를 지도 정중앙에 고정 */
const CenterMarker = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  pointer-events: none;
  z-index: 10;
`;

export interface LocationPickerMapProps {
  height?: string;
  onLocationChange: (regionName: string) => void;
  onMapReady?: (map: any) => void;
}

const LocationPickerMap = ({
  height = '240px',
  onLocationChange,
  onMapReady,
}: LocationPickerMapProps) => {
  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2RegionCode(lng, lat, (result: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const region = result.find((r: any) => r.region_type === 'H') ?? result[0];
          onLocationChange(region?.address_name ?? '');
        }
      });
    },
    [onLocationChange],
  );

  const handleMapReady = useCallback(
    (map: any) => {
      window.kakao.maps.event.addListener(map, 'idle', () => {
        const c = map.getCenter();
        reverseGeocode(c.getLat(), c.getLng());
      });
      const c = map.getCenter();
      reverseGeocode(c.getLat(), c.getLng());
      onMapReady?.(map);
    },
    [reverseGeocode, onMapReady],
  );

  return (
    <Wrapper $height={height}>
      <MapBase onMapReady={handleMapReady} />
      <CenterMarker>
        <MapMarker size={40} />
      </CenterMarker>
    </Wrapper>
  );
};

export default LocationPickerMap;
