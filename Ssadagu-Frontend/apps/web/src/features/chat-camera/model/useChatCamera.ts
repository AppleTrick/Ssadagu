'use client';

import { useRef, useCallback } from 'react';
import { isInWebView, requestNativeCamera } from '@/shared/lib/cameraBridge';

interface UseChatCameraOptions {
  onCapture: (files: File[]) => void;
  onError?: (message: string) => void;
}

/**
 * 채팅 카메라 기능 훅
 *
 * - React Native WebView: 네이티브 카메라 앱 호출 (cameraBridge)
 * - 웹 브라우저: hidden <input capture="environment"> 트리거
 *
 * 사용 방법:
 * ```tsx
 * const { openCamera, inputRef, handleInputChange } = useChatCamera({ onCapture });
 *
 * // JSX에 hidden input 렌더링
 * <input ref={inputRef} type="file" accept="image/*" capture="environment"
 *   style={{ display: 'none' }} onChange={handleInputChange} />
 * ```
 */
export function useChatCamera({ onCapture, onError }: UseChatCameraOptions) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openCamera = useCallback(async () => {
    if (isInWebView()) {
      const file = await requestNativeCamera();
      if (file) {
        onCapture([file]);
      } else {
        onError?.('카메라 촬영이 취소되었습니다.');
      }
    } else {
      inputRef.current?.click();
    }
  }, [onCapture, onError]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onCapture([files[0]]);
    }
    if (e.target) e.target.value = '';
  }, [onCapture]);

  return { openCamera, inputRef, handleInputChange };
}
