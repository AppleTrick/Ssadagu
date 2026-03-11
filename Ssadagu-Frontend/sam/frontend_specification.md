# Ssadagu 프론트엔드 기술 명세서 (Frontend Specification)

본 문서는 Ssadagu 프로젝트의 프론트엔드 기술 스택, 아키텍처 및 폴더 구조를 정의합니다.

## 1. 핵심 기술 스택 (Tech Stack)

### 인프라 및 환경

- **Monorepo**: Turborepo + pnpm (워크스페이스 관리)
- **Runtime**: Node.js v20+
- **Language**: TypeScript (Strict Mode)

### 웹 애플리케이션 (apps/web)

- **Framework**: Next.js (App Router)
- **Styling**: Emotion (CSS-in-JS)
- **State Management**: Zustand (Client), Tanstack Query (Server)
- **Form**: React Hook Form + Zod (Validation)

### 모바일 애플리케이션 (apps/native)

- **Framework**: Expo (React Native Router)
- **Hybrid**: react-native-webview (Hybrid Webview)
- **Bridge**: postMessage 기반 커스텀 브릿지 이벤트 (docs/bridge_spec.md 참조)

### 품질 및 성능

- **Testing**: Vitest (Unit), Playwright (E2E)
- **Optimization**: Lighthouse 기반 성능 최적화, 스켈레톤 UI 적용

---

## 2. FSD 아키텍처 및 폴더 구조 (Feature-Sliced Design)

웹 애플리케이션(`apps/web/src`)은 FSD 방법론을 준수하여 계층별로 관심사를 분리합니다.

### 레이어(Layers) 구조

1. **app**: 애플리케이션의 최상위 설정 (Provider, Global CSS, Root Layout)
2. **pages**: 실제 URL 경로와 매칭되는 페이지 컴포넌트
3. **widgets**: 독립적으로 사용 가능한 대형 UI 블록 (Header, Sidebar, UserProfileCard 등)
4. **features**: 사용자 액션 및 비즈니스 가치를 담은 기능 단위 (LoginByGoogle, TransferMoney 등)
5. **entities**: 비즈니스 실체 및 데이터 모델 (User, Account, Transaction 등)
6. **shared**: 재사용 가능한 유틸리티, 공통 UI 컴포넌트, API 클라이언트 (packages/ui, shared와 격리)

### 예시 구조

```
src/
  ├── app/                # 전역 설정 및 레이아웃
  ├── pages/              # 실제 페이지 컴포넌트
  ├── widgets/            # 복합 컴포넌트 (Footer, Navbar)
  ├── features/           # 특정 비즈니스 기능 (ChatInput, PaymentForm)
  ├── entities/           # 데이터 모델 및 엔티티 (UserCard, BalanceDisplay)
  └── shared/             # 공통 API, Hooks, Utils
```

---

## 3. 코드 작성 원칙

- **TypeScript**: 타입 정의 우선 (Type > Interface)
- **Component**: 화살표 함수 기반 함수형 컴포넌트 사용
- **Clean Code**: 한 파일당 200라인 준수, 매직 넘버 지양, Props 구조 분해 할당 적용
- **Git**: Conventional Commits 규격 준수 (`feat:`, `fix:`, `docs:` 등)
