# 앱 흐름도 / User Flow — Ssadagu

> 유저가 앱에서 어떻게 이동하는지 정의합니다.
> 화면 전환 흐름 및 주요 시나리오를 포함합니다.

---

## 1. 전체 화면 구조 (Screen Map)

```
[앱 진입]
    │
    ├── 비로그인 상태 → /login
    │       └── 로그인 성공 → /home
    │
    └── 로그인 상태 → /home (탭 네비게이션)
            ├── 홈 탭 (/)
            ├── 채팅 탭 (/chat)
            ├── 상품 등록 (/products/new)
            └── 마이페이지 탭 (/my)
```

---

## 2. 인증 플로우 (Auth Flow)

```mermaid
flowchart TD
    A[앱 실행] --> B{토큰 존재?}
    B -- 없음 --> C[/login 페이지]
    B -- 있음 --> D{토큰 유효?}
    D -- 유효 --> E[/home]
    D -- 만료 --> F[Refresh Token으로 재발급]
    F -- 성공 --> E
    F -- 실패 --> C
    C --> G[이메일/비밀번호 입력]
    G --> H[POST /api/auth/login]
    H -- 성공 --> I[Access + Refresh Token 저장]
    I --> E
    H -- 실패 --> J[에러 메시지 표시]
```

---

## 3. 상품 탐색 → 채팅 → 결제 플로우 (구매자 시나리오)

```mermaid
flowchart TD
    A[홈 피드 - 상품 목록] --> B[카테고리/지역 필터]
    B --> C[상품 카드 클릭]
    C --> D[상품 상세 페이지]
    D --> E{관심 있음?}
    E -- 찜하기 --> F[찜 목록에 추가]
    E -- 채팅하기 --> G[채팅방 생성 or 기존 입장]
    G --> H[실시간 채팅 - STOMP]
    H --> I{거래 합의}
    I -- 합의됨 --> J[결제 요청]
    J --> K[계좌이체 / 카드 / PAY 선택]
    K --> L[POST /api/transfers]
    L -- 성공 --> M[거래 완료 - 상품 SOLD 처리]
    L -- 실패 --> N[결제 실패 안내]
```

---

## 4. 상품 등록 플로우 (판매자 시나리오)

```mermaid
flowchart TD
    A[+ 등록 버튼 클릭] --> B[상품 등록 폼]
    B --> C[이미지 업로드 - 복수]
    C --> D[제목 / 설명 / 가격 입력]
    D --> E[카테고리 선택]
    E --> F[지역 선택]
    F --> G[등록 완료]
    G --> H[상품 상세 페이지]
    H --> I{상태 변경}
    I --> J[ON_SALE → RESERVED → SOLD]
```

---

## 5. 채팅 플로우 (실시간 메시지)

```mermaid
sequenceDiagram
    participant Web as Next.js (웹)
    participant WS as Spring Boot (WebSocket)
    participant DB as MongoDB (메시지 저장)

    Web->>WS: WebSocket 연결 [/ws-ssadagu]
    Web->>WS: 채팅방 구독 [/topic/group/{roomId}]
    Web->>WS: 메시지 전송 [/app/chat/{roomId}]
    WS->>DB: 메시지 저장
    WS->>Web: 메시지 브로드캐스트 [/topic/group/{roomId}]
```

---

## 6. 계좌 인증 플로우

```mermaid
flowchart TD
    A[마이페이지 - 계좌 등록] --> B[은행 선택 + 계좌번호 입력]
    B --> C[1원 인증 요청]
    C --> D[소액 송금 - 인증 코드 포함]
    D --> E[사용자가 입금 내역 확인]
    E --> F[인증 코드 입력]
    F --> G{코드 일치?}
    G -- 일치 --> H[계좌 VERIFIED 처리]
    G -- 불일치/만료 --> I[인증 실패 안내]
```

---

## 7. 마이페이지 흐름

```
/my
  ├── 내 정보 (닉네임, 이메일)
  ├── 계좌 관리 → /my/account
  ├── 내 판매 상품 → /my/products
  ├── 거래 내역 → /my/transactions
  ├── 찜 목록 → /my/wishes
  └── 로그아웃 → POST /api/auth/logout → /login
```

---

## 8. 모바일 특이 사항 (Hybrid App)

- 모든 화면은 Next.js 웹을 `react-native-webview`로 렌더링
- 네이티브 뒤로가기 버튼 → `ON_BACK_PRESS` 브릿지 이벤트로 웹에 전달
- 키보드 표시 → `ON_KEYBOARD_SHOW` 이벤트로 레이아웃 조정
- GPS 위치 → `ON_LOCATION_CHANGE` 이벤트로 지역 자동 설정
- 상세 브릿지 이벤트 정의는 `docs/bridge_spec.md` 참조
