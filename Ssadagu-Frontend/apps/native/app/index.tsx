import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Platform, BackHandler, Linking } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// 배포 URL
// const NEXTJS_URL = 'https://j14a202.p.ssafy.io';

const DEV_MACHINE_IP = '192.168.45.45';

let NEXTJS_URL = 'http://localhost:3000';
if (__DEV__) {
  if (Platform.OS === 'android') {
    NEXTJS_URL = 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    NEXTJS_URL = `http://${DEV_MACHINE_IP}:3000`;
  }
}

/** Keychain 저장 키 */
const DEVICE_TOKEN_KEY = 'ssadagu_biometric_device_token';

export default function AppScreen() {
  const webviewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const handleBackPress = () => {
      if (canGoBack && webviewRef.current) {
        webviewRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => sub.remove();
  }, [canGoBack]);

  /** 웹 → 네이티브 메시지 처리 */
  const onMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {

        // 위치 설정 열기
        case 'openLocationSettings':
          if (Platform.OS === 'ios') {
            Linking.openURL('App-Prefs:root=Privacy&path=LOCATION');
          } else {
            Linking.openSettings();
          }
          break;

        // UUID 생성 → Keychain(생체인증 보호) 저장 → 웹으로 반환
        case 'generateDeviceToken':
          await handleGenerateDeviceToken();
          break;

        // 생체인증 수행 → Keychain에서 UUID 꺼내 웹으로 반환
        case 'requestBiometric':
          await handleBiometricAuth();
          break;

        // Keychain에서 디바이스 토큰 삭제
        case 'clearBiometricToken':
          await SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY);
          break;
      }
    } catch (e) {
      console.error('메시지 파싱 에러:', e);
    }
  };

  /**
   * UUID 생성 후 생체인증 보호 Keychain에 저장.
   * 토큰 값을 웹으로 전달한다.
   */
  const handleGenerateDeviceToken = async () => {
    try {
      // UUID v4 생성
      const token = Crypto.randomUUID();

      // 생체인증 보호 저장 (저장 시 생체인증 요구)
      await SecureStore.setItemAsync(DEVICE_TOKEN_KEY, token, {
        requireAuthentication: true,
        authenticationPrompt: '생체인증으로 본인을 확인합니다',
      });

      sendToWeb({ type: 'deviceTokenGenerated', token });
    } catch (err) {
      console.error('디바이스 토큰 생성 실패:', err);
      sendToWeb({ type: 'deviceTokenGenerated', token: null, error: 'generation_failed' });
    }
  };

  /**
   * 생체인증 수행 후 Keychain에서 UUID 토큰을 꺼내 웹으로 전달.
   */
  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        sendToWeb({ type: 'biometricResult', success: false, error: 'not_supported' });
        return;
      }

      // 플랫폼별 인증 메시지
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isFaceId = supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      );
      const promptMessage = isFaceId
        ? 'Face ID로 본인인증을 진행합니다'
        : '지문으로 본인인증을 진행합니다';

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: '취소',
        fallbackLabel: '비밀번호 사용',
        disableDeviceFallback: false,
      });

      if (!authResult.success) {
        sendToWeb({ type: 'biometricResult', success: false, error: 'cancelled' });
        return;
      }

      // 생체인증 성공 → Keychain에서 디바이스 토큰 읽기
      const token = await SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
      if (!token) {
        sendToWeb({ type: 'biometricResult', success: false, error: 'no_token_stored' });
        return;
      }

      sendToWeb({ type: 'biometricResult', success: true, token });
    } catch (err) {
      console.error('생체인증 오류:', err);
      sendToWeb({ type: 'biometricResult', success: false, error: 'error' });
    }
  };

  /** 웹으로 메시지 주입 */
  const sendToWeb = (data: object) => {
    const script = `
      (function() {
        var event = new MessageEvent('message', { data: ${JSON.stringify(JSON.stringify(data))} });
        window.dispatchEvent(event);
      })();
      true;
    `;
    webviewRef.current?.injectJavaScript(script);
  };

  const onNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          src={NEXTJS_URL}
          style={{ border: 'none', width: '100%', height: '100%' }}
          title="Next.js Webview"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WebView
        ref={webviewRef}
        source={{ uri: NEXTJS_URL }}
        style={styles.webview}
        onMessage={onMessage}
        onNavigationStateChange={onNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        originWhitelist={['*']}
        scalesPageToFit={true}
        scrollEnabled={true}
        geolocationEnabled={true}
        injectedJavaScript={`
          const meta = document.createElement('meta');
          meta.setAttribute('name', 'viewport');
          meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          document.getElementsByTagName('head')[0].appendChild(meta);
        `}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },
});
