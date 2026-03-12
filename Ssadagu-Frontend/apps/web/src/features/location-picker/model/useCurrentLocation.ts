import { useState } from 'react';

interface Options {
  onSuccess: (lat: number, lng: number) => void;
  onError?: (message: string) => void;
}

export const useCurrentLocation = ({ onSuccess, onError }: Options) => {
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      onError?.('위치 정보를 지원하지 않는 브라우저입니다.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onSuccess(coords.latitude, coords.longitude);
        setLoading(false);
      },
      () => {
        onError?.('위치 접근 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.');
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 0 },
    );
  };

  return { getLocation, loading };
};
