# 싸다구 (SSADAGU)

신뢰 기반 중고거래 플랫폼입니다. 동네 인증과 계좌 인증을 통해 거래 상대를 검증하고, AI 자연어 검색과 실시간 채팅으로 편리한 거래 경험을 제공합니다.

🔗 **배포 주소**: [https://ssadagu.changhee.dev](https://ssadagu.changhee.dev)

## 프로젝트 소개

기존 중고거래 앱은 이메일/소셜 로그인만으로 누구나 계정을 만들 수 있어 사기 거래에 취약하다는 문제가 있었습니다. 싸다구는 가입 → 동네 인증 → 계좌 인증 → 생체 인증의 4단계 검증을 거치게 함으로써, "실제 거주자이고 실명이 확인된 사람"과만 거래할 수 있는 환경을 만들었습니다.

## 핵심 구현 기능

- **4단계 신뢰 인증 시스템**: JWT 로그인 → 동네 인증(위치 기반) → 계좌 인증(1원 송금으로 실명 확인) → 생체 인증(Face ID/지문)으로 이어지는 단계별 인증을 구현했습니다. 사용자 상태(`UNVERIFIED` → `VERIFIED` → `ACTIVE`)에 따라 채팅·거래 가능 범위를 제한합니다.
- **AI 자연어 검색**: "검은 맥북 프로 100만원 이하 미개봉"처럼 입력하면 LLM이 브랜드·제품명·색상·가격·상태를 자동 추출해 단일 쿼리로 결과를 반환하도록 구현했습니다. 기존 6단계 검색 로직(텍스트 LIKE 검색 → 브랜드/색상/가격 필터 → 결과 병합)을 1단계로 단순화했습니다.
- **실시간 채팅**: STOMP WebSocket으로 구매자·판매자 간 1:1 채팅을 구현했습니다. 메시지 발송 시 채팅방 정보(마지막 메시지, 안 읽은 수)를 함께 갱신하고, 채팅방 구독자와 양측 개인 채널로 동시에 브로드캐스트합니다.
- **모바일 네이티브 연동**: React Native(Expo) 앱이 WebView로 Next.js 웹을 호스팅하는 구조에서, 생체 인증처럼 네이티브 API만 가능한 기능을 웹-네이티브 메시지 브릿지로 연결했습니다.
- **FSD 기반 프론트엔드 아키텍처**: `app → views → widgets → features → entities → shared`의 단방향 의존 구조로 기능 단위 응집도를 높였습니다.

## 기술 스택

**Backend** Spring Boot 4.0.3 (Java 21) · Spring Security · JPA · WebSocket(STOMP) · JWT · MySQL 8 · AWS S3
**Web** Next.js 16 · React 19
**Mobile** Expo 54 · React Native 0.81
**Infra** pnpm + Turborepo · Docker · Jenkins · Traefik

## 기술적 의사결정

**FSD(Feature-Sliced Design) 아키텍처를 선택한 이유**
기존 `components/`, `hooks/`, `utils/` 3단 구조는 기능 하나를 수정할 때도 파일이 여러 폴더에 흩어져 있어 찾기 어려웠습니다. FSD로 `app → views → widgets → features → entities → shared`의 단방향 의존 구조를 적용해, 채팅 기능을 수정할 때 `features/chat-messaging/` 한 곳만 보면 되도록 응집도를 높였습니다.

**채팅에 Redis 대신 MySQL을 선택한 이유**
실시간 메시징이라고 해서 반드시 별도 인메모리 큐가 필요한 것은 아니라고 판단했습니다. STOMP WebSocket으로 메시지를 발행하면 서버가 바로 MySQL에 저장하고, 채팅방 구독자 채널과 구매자/판매자 개인 채널 3곳으로 동시에 브로드캐스트합니다. 별도 인프라(Redis) 운영 비용 없이 메시지 영속성과 실시간성을 동시에 확보했습니다.

**AI 자연어 검색에서 LLM 출력을 안전하게 다루는 방법**
LLM이 반환한 문자열을 SQL에 직접 끼워 넣지 않습니다. LLM 응답은 JSON으로 받아 타입을 검증하고, `condition`/`tradeType`/`sort` 같은 enum 값은 화이트리스트를 통과해야만 JPA Specification 쿼리에 포함되도록 했습니다. 또한 LLM 호출이 실패해도 빈 필터를 반환해 전체 검색으로 자동 폴백하므로 검색 기능 자체가 중단되지는 않습니다.

**모바일 생체 인증과 웹뷰 구조**
React Native 앱이 WebView로 Next.js 웹을 그대로 호스팅하는 구조라, Face ID/지문 같은 네이티브 전용 API는 웹에서 직접 호출할 수 없었습니다. 웹이 `postMessage`로 인증을 요청하면 네이티브 브릿지가 `LocalAuthentication`을 호출하고 결과를 다시 웹으로 전달하는 메시지 패싱 구조로 연결했습니다.

**프론트엔드 성능 개선**
- 채팅 입력창에서 한국어 IME 조합 중 `scrollHeight`를 읽고 높이를 쓰는 동작이 같은 프레임에서 반복되며 레이아웃 쓰래싱을 유발해, `requestAnimationFrame`으로 읽기/쓰기를 배치 처리했습니다.
- 상품 카드 리스트에서 `onWishToggle` 핸들러를 인라인으로 넘기면 매 렌더마다 새 함수 참조가 생겨 `React.memo`가 무효화되는 문제를, `useCallback`으로 고정해 해결했습니다.
- React Query의 `staleTime`을 0에서 30초로 올려 변경 빈도가 낮은 상품/채팅방 목록의 불필요한 재요청과 화면 깜빡임을 줄였습니다.

더 많은 의사결정 배경과 대안 비교는 [docs/TECHNICAL_REPORT.md](./docs/TECHNICAL_REPORT.md)에서 다룹니다.


