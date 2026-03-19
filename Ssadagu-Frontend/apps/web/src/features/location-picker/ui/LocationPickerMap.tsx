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
      // 1. 지도가 생성되자마자 즉시 부모에게 알림 (버튼 즉시 활성화)
      onMapReady?.(map);

      // 2. 즉시 현재 지도의 중앙(기본값) 주소부터 가져와서 '미설정' 방지
      const initialC = map.getCenter();
      reverseGeocode(initialC.getLat(), initialC.getLng());

      // 3. 지도 이동이 끝날 때마다 주소 갱신하는 리스너 등록
      window.kakao.maps.event.addListener(map, 'idle', () => {
        const c = map.getCenter();
        reverseGeocode(c.getLat(), c.getLng());
      });

      // 4. HTML5 Geolocation API로 실제 사용자 위치 시도 (백그라운드)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const locPosition = new window.kakao.maps.LatLng(lat, lng);
            
            map.setCenter(locPosition);
            reverseGeocode(lat, lng);
          },
          () => {
            // 실패하더라도 이미 위에 설정한 기본값 유지
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
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
