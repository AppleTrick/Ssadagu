# 프로젝트 실행 가이드 (Run Guide)

Ssadagu 프론트엔드 프로젝트의 웹 및 모바일 애플리케이션 실행 방법을 상세히 안내합니다.

## 1. 사전 준비 (Prerequisites)

- **Node.js**: v20 이상 권장
- **pnpm**: v10 이상 (패키지 매니저)
- **Expo Go**: 모바일 앱 테스트를 위해 스마트폰에 설치 권장

## 2. 초기 설정 (Setup)

모노레포의 모든 의존성을 설치하기 위해 루트 디렉토리에서 다음 명령어를 실행합니다.

```bash
pnpm install
```

## 3. 웹 서비스 실행 (Next.js)

`apps/web` 워크스페이스를 실행합니다.

- **명령어**: `pnpm --filter web dev`
- **접속 주소**: `http://localhost:3000`
- **특징**: CSR/SSR이 혼합된 FSD 아키텍처 기반의 웹 서비스입니다.

## 4. 모바일 앱 실행 (Expo / React Native)

`apps/native` 워크스페이스를 실행합니다.

- **기본 실행**: `pnpm --filter native start`
- **Android**: `pnpm --filter native android`
- **iOS**: `pnpm --filter native ios` (macOS 및 Xcode 필요)
- **접속 방법**: 터미널에 나타나는 QR 코드를 Expo Go 앱으로 스캔하여 확인합니다.

## 5. 유용한 명령어

| 작업             | 명령어                            |
| ---------------- | --------------------------------- |
| 전체 빌드        | `pnpm build`                      |
| 전체 린트 체크   | `pnpm lint`                       |
| 타입 체크        | `turbo run type-check`            |
| UI 패키지만 빌드 | `pnpm --filter @ssadagu/ui build` |

## 6. 문제 해결 (Troubleshooting)

- **의존성 충돌 시**: `rm -rf node_modules` 실행 후 `pnpm install` 재시도
- **포트 충돌**: Next.js 기본 포트(3000)가 사용 중인지 확인
