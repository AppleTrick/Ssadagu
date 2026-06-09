import { useState } from 'react';

interface Options {
  onSuccess: (lat: number, lng: number) => void;
  onError?: (message: string) => void;
}

const isWebView = () => {
  // React Native WebView에서 실행 중인지 확인
  return typeof window !== 'undefined' && (window as any).ReactNativeWebView !== undefined;
};

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
      (err) => {
        setLoading(false);
        if (isWebView()) {
          const webView = (window as any).ReactNativeWebView;
          if (webView) {
            webView.postMessage(JSON.stringify({ type: 'openLocationSettings' }));
          }
          onError?.('설정 앱에서 위치 접근을 허용해주세요.');
          return;
        }
        // 에러 코드별 안내
        if (err.code === err.PERMISSION_DENIED) {
          onError?.('위치 접근 권한이 거부되었습니다. 브라우저 주소창 왼쪽 자물쇠 아이콘에서 위치를 허용해주세요.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          onError?.('현재 위치를 확인할 수 없습니다. 지도를 직접 움직여 동네를 선택해주세요.');
        } else {
          onError?.('위치 확인 시간이 초과됐습니다. 지도를 직접 움직여 동네를 선택해주세요.');
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  };

  return { getLocation, loading };
};
