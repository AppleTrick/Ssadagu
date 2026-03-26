import { useCallback, useState, useRef } from 'react';
import styled from '@emotion/styled';
import MapBase from '@/shared/ui/MapBase';
import MapMarker from './MapMarker';
import { colors, typography, shadows } from '@/shared/styles/theme';

/* eslint-disable @typescript-eslint/no-explicit-any */

const Wrapper = styled.div<{ $height: string }>`
  width: 100%;
  height: ${({ $height }) => $height};
  position: relative;
  overflow: hidden;
`;

const SearchBar = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 20;
  display: flex;
  background: ${colors.surface};
  border-radius: 8px;
  box-shadow: ${shadows.md};
  padding: 4px 12px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 4px;
  border: none;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textPrimary};
  outline: none;
  background: transparent;

  &::placeholder {
    color: ${colors.textSecondary};
  }
`;

const SearchBtn = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.6;
  }
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
  const [keyword, setKeyword] = useState('');
  const mapRef = useRef<any>(null);

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

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!keyword.trim() || !mapRef.current) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const first = data[0];
        const moveLatLng = new window.kakao.maps.LatLng(first.y, first.x);
        mapRef.current.panTo(moveLatLng);
      } else {
        alert('동네를 찾을 수 없습니다. 다시 검색해 보세요!');
      }
    });
  };

  const handleMapReady = useCallback(
    (map: any) => {
      mapRef.current = map;
      onMapReady?.(map);

      const initialC = map.getCenter();
      reverseGeocode(initialC.getLat(), initialC.getLng());

      window.kakao.maps.event.addListener(map, 'idle', () => {
        const c = map.getCenter();
        reverseGeocode(c.getLat(), c.getLng());
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const locPosition = new window.kakao.maps.LatLng(lat, lng);
            
            map.panTo(locPosition);
            reverseGeocode(lat, lng);
          },
          null,
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    },
    [reverseGeocode, onMapReady],
  );

  return (
    <Wrapper $height={height}>
      <SearchBar as="form" onSubmit={handleSearch}>
        <SearchInput 
          placeholder="동네 이름 검색 (예: 역삼동)" 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <SearchBtn type="submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </SearchBtn>
      </SearchBar>
      <MapBase onMapReady={handleMapReady} />
      <CenterMarker>
        <MapMarker size={40} />
      </CenterMarker>
    </Wrapper>
  );
};

export default LocationPickerMap;
