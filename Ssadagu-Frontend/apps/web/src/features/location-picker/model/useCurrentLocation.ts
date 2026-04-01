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
      () => {
        setLoading(false);
        // WebView 환경에서는 네이티브 설정으로 유도
        if (isWebView()) {
          const webView = (window as any).ReactNativeWebView;
          if (webView) {
            webView.postMessage(
              JSON.stringify({ type: 'openLocationSettings' })
            );
          }
          onError?.('설정 앱에서 위치 접근을 허용해주세요.');
        } else {
          onError?.('위치 접근 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.');
        }
      },
      { timeout: 10000, maximumAge: 0 },
    );
  };

  return { getLocation, loading };
};
