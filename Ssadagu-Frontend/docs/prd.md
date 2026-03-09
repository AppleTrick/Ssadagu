# PRD (Product Requirements Document) — Ssadagu

> AI 및 팀원에게 가장 먼저 공유할 제품 정의 문서입니다.

---

## 1. 제품 개요 (Product Overview)

**Ssadagu(싸다구)** 는 지역 기반 중고거래 플랫폼입니다.
사용자는 물건을 등록·탐색하고, 채팅으로 거래를 협의한 뒤 앱 내 계좌 이체로 안전하게 결제합니다.

- **플랫폼**: 모바일 앱 (Android / iOS) + 웹
- **구조**: Next.js 웹을 Expo WebView로 감싼 하이브리드 앱
- **팀명**: TwoTwo (S14P21A202)

---

## 2. 핵심 기능 목록 (Core Features)

### 2-1. 인증 (Auth)
- 이메일 + 비밀번호 로그인
- JWT 기반 Access Token / Refresh Token 발급 및 재발급
- 로그아웃 (서버 측 토큰 삭제)

### 2-2. 상품 (Product)
- 상품 등록 (제목, 설명, 가격, 카테고리, 지역, 이미지 복수 업로드)
- 상품 목록 조회 (카테고리·지역 필터, 최신순 정렬)
- 상품 상세 조회
- 상품 상태 변경: `ON_SALE` → `RESERVED` → `SOLD`
- 찜하기 / 찜 취소 (Wishlist)

### 2-3. 채팅 (Chat)
- 상품별 1:1 채팅방 생성 (구매자 ↔ 판매자)
- 실시간 메시지 송수신 (STOMP over WebSocket)
- 채팅방 목록 조회 및 읽지 않은 메시지 카운트
- 채팅 내역 페이징 조회

### 2-4. 계좌 및 결제 (Account & Payment)
- 은행 계좌 등록 및 1원 인증 (소액 송금 인증)
- 앱 내 계좌이체로 거래 대금 결제
- 결제 수단: 계좌이체 / 카드 / PAY

### 2-5. 마이페이지 (My Page)
- 내 정보 조회 (닉네임, 계좌 상태)
- 내 판매 상품 목록
- 거래 내역 (구매 / 판매)
- 찜 목록

---

## 3. 비기능 요구사항 (Non-Functional Requirements)

### 성능
- Lighthouse Performance 점수 80점 이상 목표
- 상품 목록 첫 로드 2초 이내 (Skeleton UI 적용으로 체감 속도 개선)
- 채팅 메시지 지연 500ms 이하

### 보안
- JWT Secret Key 환경변수 관리 (절대 클라이언트 노출 금지)
- Access Token은 메모리(Zustand) 저장, Refresh Token은 HttpOnly Cookie
- API 요청 시 `Authorization: Bearer <token>` 헤더 필수

### 접근성 & UX
- 모바일 앱: iOS / Android 양쪽 동작
- 반응형 웹 지원
- 키보드 등장 시 WebView 레이아웃 자동 조정 (Bridge 이벤트 처리)

### 코드 품질
- TypeScript Strict Mode 사용
- 파일당 최대 200라인 준수
- Conventional Commits 규칙 (`feat:`, `fix:`, `docs:` 등)
- Unit Test (Vitest), E2E Test (Playwright) 작성

---

## 4. 유저 타입 (User Roles)

| 역할 | 설명 |
|------|------|
| 구매자 (Buyer) | 상품 탐색, 찜하기, 채팅 시작, 결제 |
| 판매자 (Seller) | 상품 등록, 채팅 응대, 상태 변경, 정산 수령 |
| (동일 계정이 두 역할 모두 가능) | |

---

## 5. 범위 외 (Out of Scope)

- 소셜 로그인 (Google, Kakao 등) — 현재 미구현
- 상품 리뷰 / 평점 시스템
- 푸시 알림 (FCM)
- 관리자 페이지
