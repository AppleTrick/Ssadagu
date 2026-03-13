'use client';

import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: any;
  }
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  min-height: 300px;
`;

const ErrorBox = styled.div`
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f4f6;
  color: #8b95a1;
  font-size: 14px;
`;

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? '';

let loadPromise: Promise<void> | null = null;

const loadKakao = (): Promise<void> => {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('SSR'));
      return;
    }
    if (window.kakao?.maps) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services`;
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Kakao Maps 로드 실패'));
    };
    document.head.appendChild(script);
  });
  return loadPromise;
};

export interface MapBaseProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  onMapReady?: (map: any) => void;
}

const MapBase = ({ lat = 37.5665, lng = 126.978, zoom = 4, onMapReady }: MapBaseProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadKakao()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const center = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(containerRef.current, {
          center,
          level: zoom,
        });
        mapRef.current = map;
        onMapReady?.(map);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
    // onMapReady는 최초 마운트 시에만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
  }, [lat, lng]);

  if (loadError) return <ErrorBox>지도를 불러올 수 없습니다.</ErrorBox>;

  return <Container ref={containerRef} />;
};

export default MapBase;
