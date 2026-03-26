'use client';

import { useState, useCallback } from 'react';
import { isInWebView, requestNativeCamera } from '@/shared/lib/cameraBridge';

interface UseChatCameraOptions {
  onCapture: (files: File[]) => void;
  onError?: (message: string) => void;
}

/**
 * 채팅 카메라 기능 훅
 *
 * - React Native WebView: 네이티브 카메라 앱 호출 (cameraBridge)
 * - 웹 브라우저: getUserMedia 기반 CameraModal 표시
 */
export function useChatCamera({ onCapture, onError }: UseChatCameraOptions) {
  const [cameraOpen, setCameraOpen] = useState(false);

  const openCamera = useCallback(async () => {
    if (isInWebView()) {
      const file = await requestNativeCamera();
      if (file) {
        onCapture([file]);
      } else {
        onError?.('카메라 촬영이 취소되었습니다.');
      }
    } else {
      setCameraOpen(true);
    }
  }, [onCapture, onError]);

  const handleModalCapture = useCallback((file: File) => {
    setCameraOpen(false);
    onCapture([file]);
  }, [onCapture]);

  const handleModalClose = useCallback(() => {
    setCameraOpen(false);
  }, []);

  return { openCamera, cameraOpen, handleModalCapture, handleModalClose };
}
