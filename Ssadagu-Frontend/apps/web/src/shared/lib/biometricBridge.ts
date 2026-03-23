/**
 * WebView <-> Native 생체인증 브리지
 *
 * 흐름:
 *  [등록] UUID 디바이스 토큰 생성 → Keychain 저장(생체인증 보호)
 *         → POST /biometric/register { publicKey: uuid } 백엔드 등록
 *
 *  [인증] 네이티브 생체인증 → Keychain에서 UUID 꺼냄
 *         → POST /biometric/verify { publicKey: uuid } 백엔드 검증
 */

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (msg: string) => void;
    };
  }
}

/** WebView 환경 감지 */
export function isInWebView(): boolean {
  return typeof window !== 'undefined' && !!window.ReactNativeWebView;
}

/** 네이티브에 메시지 전송 */
function postToNative(data: object): void {
  window.ReactNativeWebView!.postMessage(JSON.stringify(data));
}

/** 네이티브에서 오는 단회성 메시지를 기다린다 */
function waitForNativeMessage(
  type: string,
  timeoutMs = 30000
): Promise<Record<string, any>> {
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
      reject(new Error('생체인증 응답 시간 초과'));
    }, timeoutMs);

    window.addEventListener('message', handler);
  });
}

/**
 * 새 디바이스 토큰(UUID) 생성을 네이티브에 요청한다.
 * 네이티브는 UUID를 Keychain에 저장하고 토큰 값을 반환한다.
 */
export async function generateAndStoreDeviceToken(): Promise<string> {
  if (!isInWebView()) throw new Error('WebView 환경이 아닙니다.');

  postToNative({ type: 'generateDeviceToken' });
  const result = await waitForNativeMessage('deviceTokenGenerated');

  if (!result.token) throw new Error('디바이스 토큰 생성 실패');
  return result.token as string;
}

/**
 * 생체인증 수행 후 저장된 디바이스 토큰을 반환한다.
 * 생체인증 실패 시 success: false 반환.
 */
export async function requestBiometricAuth(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  if (!isInWebView()) return { success: false, error: 'not_webview' };

  postToNative({ type: 'requestBiometric' });

  try {
    const result = await waitForNativeMessage('biometricResult');
    if (result.success && result.token) {
      return { success: true, token: result.token as string };
    }
    return { success: false, error: result.error as string };
  } catch (e) {
    return { success: false, error: 'timeout' };
  }
}

/**
 * Keychain에서 디바이스 토큰 삭제 (생체인증 비활성화 시)
 */
export function clearBiometricToken(): void {
  if (!isInWebView()) return;
  postToNative({ type: 'clearBiometricToken' });
}
