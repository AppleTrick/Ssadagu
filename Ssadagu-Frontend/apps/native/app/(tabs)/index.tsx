import React from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

// 로컬 테스트용 Next.js 주소
const NEXTJS_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  web: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export default function HomeScreen() {
  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Web에서 받은 메시지:', data);
    } catch (e) {
      console.error('메시지 파싱 에러:', e);
    }
  };

  // 웹 브라우저(Expo Web)에서 실행 중일 때의 처리
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
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: NEXTJS_URL }}
        style={styles.webview}
        onMessage={onMessage}
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