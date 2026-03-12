'use client';

import { useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import MapBase from '@/shared/ui/MapBase';
import { radius, typography } from '@/shared/styles/theme';

/* eslint-disable @typescript-eslint/no-explicit-any */

const Wrapper = styled.div`
  width: 100%;
  height: 200px;
  border-radius: ${radius.md};
  overflow: hidden;
  position: relative;
`;

const Label = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 14px;
  border-radius: 999px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  z-index: 10;
  white-space: nowrap;
  pointer-events: none;
`;

interface SharedLocationViewerProps {
  lat: number;
  lng: number;
  label?: string;
}

const SharedLocationViewer = ({ lat, lng, label }: SharedLocationViewerProps) => {
  const markerRef = useRef<any>(null);

  const handleMapReady = useCallback(
    (map: any) => {
      const position = new window.kakao.maps.LatLng(lat, lng);
      markerRef.current = new window.kakao.maps.Marker({ position, map });
      map.setDraggable(false);
      map.setZoomable(false);
    },
    [lat, lng],
  );

  return (
    <Wrapper>
      <MapBase lat={lat} lng={lng} zoom={4} onMapReady={handleMapReady} />
      {label && <Label>📍 {label}</Label>}
    </Wrapper>
  );
};

export default SharedLocationViewer;
