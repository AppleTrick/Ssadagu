import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Platform, BackHandler, StatusBar } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

// 배포 URL
const NEXTJS_URL = 'https://j14a202.p.ssafy.io';

export default function AppScreen() {
  const webviewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // 안드로이드 뒤로가기 하드웨어 버튼 감지
  useEffect(() => {
    const handleBackPress = () => {
      if (canGoBack && webviewRef.current) {
        webviewRef.current.goBack();
        return true; // 기본 동작(앱 종료) 방지
      }
      return false; // 더 뒤로갈 곳 없으면 앱 종료 로직으로
    };

    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      backHandlerSubscription.remove();
    };
  }, [canGoBack]);

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Web에서 받은 메시지:', data);
    } catch (e) {
      console.error('메시지 파싱 에러:', e);
    }
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});
