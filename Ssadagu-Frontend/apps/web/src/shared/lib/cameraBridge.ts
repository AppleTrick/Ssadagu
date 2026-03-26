'use client';

/**
 * WebView <-> Native 카메라 브릿지
 *
 * 흐름:
 *  [Web → Native] postMessage({ type: 'requestCamera' })
 *  [Native → Web] dispatchEvent({ type: 'cameraResult', success: true, dataUrl: 'data:image/jpeg;base64,...' })
 */

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (msg: string) => void;
    };
  }
}

export function isInWebView(): boolean {
  return typeof window !== 'undefined' && !!window.ReactNativeWebView;
}

function postToNative(data: object): void {
  window.ReactNativeWebView!.postMessage(JSON.stringify(data));
}

function waitForNativeMessage(type: string, timeoutMs = 60000): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === type) {
          window.removeEventListener('message', handler);
          clearTimeout(timer);
          resolve(data);
        }
      } catch {
        // ignore parse errors
      }
    };

    const timer = setTimeout(() => {
      window.removeEventListener('message', handler);
      reject(new Error('카메라 응답 시간 초과'));
    }, timeoutMs);

    window.addEventListener('message', handler);
  });
}

/**
 * 네이티브 카메라 앱을 열고 촬영된 사진을 File로 반환한다.
 * 취소하거나 실패하면 null 반환.
 */
export async function requestNativeCamera(): Promise<File | null> {
  if (!isInWebView()) return null;

  postToNative({ type: 'requestCamera' });

  try {
    const result = await waitForNativeMessage('cameraResult');
    if (!result.success || !result.dataUrl) return null;

    // base64 data URL → Blob → File
    const res = await fetch(result.dataUrl);
    const blob = await res.blob();
    return new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
  } catch {
    return null;
  }
}
