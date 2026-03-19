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
      // 1. 즉시 현재 지도의 중앙(기본값) 주소부터 가져와서 '미설정' 방지
      const initialC = map.getCenter();
      reverseGeocode(initialC.getLat(), initialC.getLng());

      // 2. 지도 이동이 끝날 때마다 주소 갱신하는 리스너 등록
      window.kakao.maps.event.addListener(map, 'idle', () => {
        const c = map.getCenter();
        reverseGeocode(c.getLat(), c.getLng());
      });

      // 3. HTML5 Geolocation API로 실제 사용자 위치 시도
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const locPosition = new window.kakao.maps.LatLng(lat, lng);
            
            map.setCenter(locPosition);
            reverseGeocode(lat, lng); // 위치 잡히면 즉시 주소 업데이트
            onMapReady?.(map);
          },
          () => {
            // 실패하더라도 이미 1번에서 기본값 주소를 가져왔으므로 '미설정'은 아님
            onMapReady?.(map);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        onMapReady?.(map);
      }
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
