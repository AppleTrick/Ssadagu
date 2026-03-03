# 싸다구(Ssadagu) 프론트엔드 모노레포

Next.js(Web)와 Expo(Native)가 통합된 Turborepo 기반의 프론트엔드 프로젝트입니다.

## 🚀 프로젝트 시작하기

가장 먼저 루트 디렉토리에서 모든 의존성을 설치해야 합니다.

```bash
# Ssadagu-Frontend 디렉토리로 이동 후 실행
pnpm install
```

---

## 💻 웹 실행 방법 (Next.js)

웹 서비스만 단독으로 실행하려면 다음 명령어를 사용하세요.

```bash
# 루트 디렉토리에서 실행
pnpm --filter web dev
```

또는 해당 폴더로 이동하여 실행할 수도 있습니다.

```bash
cd apps/web
pnpm dev
```

---

## 📱 앱 실행 방법 (Expo / React Native)

앱 서비스를 실행하려면 Expo 개발 서버를 실행해야 합니다.

```bash
# 루트 디렉토리에서 실행
pnpm --filter native start
```

### 환경별 실행

- **Android**: `pnpm --filter native android`
- **iOS**: `pnpm --filter native ios` (macOS 전용)
- **Web**: `pnpm --filter native web`

---

## 🏗️ 전체 빌드 및 검사

Turborepo를 사용하여 모든 워크스페이스를 한 번에 빌드하거나 검사할 수 있습니다.

```bash
# 전체 빌드
pnpm build

# 전체 린트 검사
pnpm lint
```

## 📂 주요 폴더 구조

- `apps/web`: Next.js 기반 웹 서비스 (FSD 아키텍처)
- `apps/native`: Expo 기반 모바일 앱 (WebView Bridge 연동)
- `packages/ui`: 공통 UI 컴포넌트 (Emotion + Tailwind)
- `packages/shared`: 공통 로직, 타입, API 클라이언트
- `docs`: 기술 명세서 (한글)
