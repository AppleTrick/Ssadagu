'use client';

import { useCallback } from 'react';
import styled from '@emotion/styled';
import MapBase from '@/shared/ui/MapBase';
import { getMarkerDataUrl } from '@/features/location-picker/ui/MapMarker';
import { radius, typography } from '@/shared/styles/theme';

/* eslint-disable @typescript-eslint/no-explicit-any */

const Wrapper = styled.div<{ $height: string }>`
  width: 100%;
  height: ${({ $height }) => $height};
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
  backdrop-filter: blur(4px);
`;

interface SharedLocationViewerProps {
  lat: number;
  lng: number;
  label?: string;
  height?: string;
  zoom?: number;
  panY?: number;
}

const SharedLocationViewer = ({ lat, lng, label, height = '200px', zoom = 4, panY = 0 }: SharedLocationViewerProps) => {
  const handleMapReady = useCallback(
    (map: any) => {
      const position = new window.kakao.maps.LatLng(lat, lng);

      const markerImage = new window.kakao.maps.MarkerImage(
        getMarkerDataUrl(),
        new window.kakao.maps.Size(40, 54),
        { offset: new window.kakao.maps.Point(20, 54) },
      );

      new window.kakao.maps.Marker({ position, map, image: markerImage });
      map.setDraggable(false);
      map.setZoomable(false);

      if (panY !== 0) {
        setTimeout(() => map.panBy(0, panY), 50);
      }
    },
    [lat, lng, panY],
  );

  return (
    <Wrapper $height={height}>
      <MapBase lat={lat} lng={lng} zoom={zoom} minHeight="0px" onMapReady={handleMapReady} />
      {label && <Label>📍 {label}</Label>}
    </Wrapper>
  );
};

export default SharedLocationViewer;
