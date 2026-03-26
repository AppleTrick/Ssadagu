# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## 안드로이드 실기기 테스트 및 빌드 가이드 📱

Windows 환경에서 안드로이드 앱을 빌드할 때 파일 경로 260자 제한(Path too long) 에러가 발생할 수 있습니다. 이를 방지하고 기기에 직접 앱을 띄워 테스트하는 방법은 다음과 같습니다.

### 1️⃣ 경로 길이 제한 우회 (가상 드라이브 설정)
기본 경로가 너무 길면 빌드에 실패하므로 `subst` 명령어로 짧은 가상 드라이브(N:)를 생성합니다. (PC 재부팅 시 초기화되므로 매번 설정하거나, 레지스트리의 `LongPathsEnabled`를 활성화하여 영구 우회해야 합니다.)
```bash
subst N: "C:\Users\SSAFY\Desktop\SSADAGU\S14P21A202"
```

### 2️⃣ 기기 설정 (어떤 안드로이드 폰이든 무관!)
갤럭시 S10뿐만 아니라 **모든 안드로이드 스마트폰**에서 동일하게 적용됩니다.
1. 기기 설정 > **휴대전화 정보** > **소프트웨어 정보**에서 **'빌드 번호'**를 7번 연속 터치해 개발자 모드를 켭니다.
2. 기기 설정 > **개발자 옵션**으로 가서 **'USB 디버깅'**을 켜줍니다.
3. PC와 USB 케이블로 연결한 뒤, 폰 화면에 뜨는 **'USB 디버깅 허용'** 팝업에서 **'항상 허용 및 괏인'**을 누릅니다.

### 3️⃣ 빌드 및 실행
단축된 경로(N 드라이브)로 이동하여 실행 명령어를 입력합니다.
```bash
cd N:/Ssadagu-Frontend/apps/native
npm run android
```
- 명령어를 실행하면 앱이 자동으로 빌드(APK)되어 스마트폰에 설치되고 켜집니다.
- 코드 변경 시 바로 기기에 반영(Hot Reloading)되는 로컬 서버(Metro Bundler)가 함께 실행됩니다.

### 💡 빌드된 최종 APK 파일 위치
빌드된 APK 설치 파일은 아래 경로에 생성됩니다. 직접 설치가 필요한 경우 기기로 파일을 옮겨 설치하면 됩니다.
```text
N:\Ssadagu-Frontend\apps\native\android\app\build\outputs\apk\debug\app-debug.apk
```
*(참고: 빌드 시점의 최적화 설정, 아키텍처 지원 범위, 추가된 패키지 등의 차이로 생성된 `app-debug.apk` 파일의 용량은 과거와 다를 수 있습니다.)*


.\gradlew.bat app:assembleDebug
