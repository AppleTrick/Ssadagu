# Tech Stack 문서 — Ssadagu Frontend

> 프론트엔드에서 사용하는 기술 스택을 명확히 정의합니다.
> AI가 임의로 라이브러리를 선택하지 않도록 이 문서를 우선 참고합니다.

---

## 1. 모노레포 환경 (Monorepo)

| 항목 | 선택 | 비고 |
|------|------|------|
| 패키지 매니저 | **pnpm** v10+ | npm/yarn 사용 금지 |
| 워크스페이스 | **pnpm workspaces** | `pnpm-workspace.yaml` 기반 |
| 빌드 오케스트레이터 | **Turborepo** | `turbo.json` 설정 |
| 런타임 | **Node.js** v20+ | |
| 언어 | **TypeScript** (Strict Mode) | `"strict": true` 필수 |

---

## 2. 웹 애플리케이션 (apps/web)

### 프레임워크 & 라우팅
| 항목 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | **Next.js** (App Router) | Pages Router 사용 금지 |
| 라우팅 | App Router (`src/app/`) | 파일 기반 라우팅 |

### 스타일링
| 항목 | 선택 | 비고 |
|------|------|------|
| CSS-in-JS | **Emotion** | 스타일링 전담 |
| 기타 | CSS Modules, Tailwind CSS 사용 금지 | Emotion으로 통일 |

### 상태관리
| 항목 | 선택 | 비고 |
|------|------|------|
| 클라이언트 상태 | **Zustand** | Redux 사용 금지 |
| 서버 상태 (캐싱) | **TanStack Query** (React Query) | SWR 사용 금지 |

### 폼 & 유효성 검사
| 항목 | 선택 | 비고 |
|------|------|------|
| 폼 라이브러리 | **React Hook Form** | |
| 유효성 스키마 | **Zod** | TypeScript 타입 자동 추론 |

### 실시간 통신
| 항목 | 선택 | 비고 |
|------|------|------|
| 채팅 프로토콜 | **STOMP** over WebSocket | |
| WebSocket 엔드포인트 | `/ws-ssadagu` | |
| 라이브러리 | `@stomp/stompjs` 또는 `sockjs-client` | |

---

## 3. 모바일 애플리케이션 (apps/native)

| 항목 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | **Expo** (SDK 최신) | Bare workflow 아님 |
| 라우팅 | **Expo Router** (파일 기반) | |
| 렌더링 방식 | **Hybrid WebView** | 네이티브 셸 + Next.js 웹 |
| WebView 라이브러리 | **react-native-webview** | |
| 네이티브 ↔ 웹 통신 | **postMessage 기반 커스텀 브릿지** | `docs/bridge_spec.md` 참조 |

---

## 4. 공유 패키지 (packages/)

| 패키지 | 경로 | 역할 |
|--------|------|------|
| `@ssadagu/shared` | `packages/shared` | 공통 유틸리티, 타입 정의 |
| `@ssadagu/ui` | `packages/ui` | 공통 UI 컴포넌트 (웹·모바일 공유) |

---

## 5. 테스트

| 종류 | 도구 | 대상 |
|------|------|------|
| Unit Test | **Vitest** | 유틸 함수, 훅, 컴포넌트 |
| E2E Test | **Playwright** | 주요 유저 시나리오 (웹) |

---

## 6. 코드 품질

| 항목 | 도구 |
|------|------|
| 린터 | ESLint (Next.js 기본 설정 + 커스텀 룰) |
| 포매터 | Prettier |
| Git 커밋 규약 | Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:` 등) |

---

## 7. 백엔드 연동 정보 (프론트 관점)

| 항목 | 값 |
|------|----|
| API Base URL (Local) | `http://localhost:8080/api` |
| 인증 방식 | `Authorization: Bearer <accessToken>` 헤더 |
| 토큰 재발급 헤더 | `Refresh-Token: <refreshToken>` |
| 공통 응답 형식 | `{ status, message, data }` |

---

## 8. 사용하지 않는 기술 (명시적 제외)

- `Redux` / `Redux Toolkit` → Zustand 사용
- `SWR` → TanStack Query 사용
- `styled-components` → Emotion 사용
- `axios` → 기본 `fetch` 또는 TanStack Query의 queryFn에서 처리 (필요 시 팀 논의 후 결정)
- `react-query` v3 → TanStack Query v5 사용
- `Tailwind CSS` → Emotion 사용
- CSS Modules → Emotion으로 통일
