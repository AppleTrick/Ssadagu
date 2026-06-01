# 싸다구 (SSADAGU) - 기술 설계 회고록

중고 거래 플랫폼. 신뢰 기반 거래를 위한 동네 인증, 계좌 인증, AI 자연어 검색, 실시간 채팅을 구현했다.

**기술 스택**: Spring Boot 4.0.3 (Java 21) / Next.js 16 + React 19 (Web) / Expo 54 + React Native 0.81 (Mobile) / MySQL 8 / STOMP WebSocket / AWS S3

---

## 1. 프론트엔드 구조 설계: FSD (Feature-Sliced Design)

### 결정: 컴포넌트 중심 구조 대신 FSD 레이어 아키텍처 적용

**무엇을 했나**

Next.js 앱을 FSD(Feature-Sliced Design) 기반으로 6개 레이어로 분리했다.

```
src/
├── app/        → Next.js 라우팅 & 페이지 진입점
├── views/      → 페이지 단위 컨테이너 (home, chat-room, product-detail 등)
├── widgets/    → 복합 UI 블록 (header, chat-input, product-list, navigation)
├── features/   → 독립 기능 단위 (auth, chat-messaging, create-product, toggle-wish 등)
├── entities/   → 도메인 모델 + API 훅 (chat, product, transaction, user)
└── shared/     → 전역 유틸리티 (api 클라이언트, 디자인 토큰, 공통 컴포넌트)
```

**레이어 간 의존 규칙**: 상위 레이어만 하위 레이어를 참조할 수 있다. `shared`는 어디서도 import되지 않고, `app`은 아무것도 import하지 않는다.

```
app → views → widgets → features → entities → shared
(단방향, 역방향 참조 금지)
```

**실제 적용 예시 - 채팅 기능**

```
entities/chat/api/    → API 훅 (채팅방 목록, 메시지 조회)
entities/chat/model/  → 타입 정의 (ChatRoom, ChatMessage, MessageType)
entities/chat/ui/     → 재사용 가능한 채팅 컴포넌트
features/chat-messaging/  → 실시간 STOMP 연결 + 메시지 전송 로직
features/send-message/    → 메시지 전송 폼
widgets/chat-input/       → 자동 리사이즈 입력창 (features 조합)
views/chat-room/          → 전체 채팅방 페이지 컨테이너
app/(routes)/chat/[id]/   → Next.js 라우트 진입점
```

**왜 이 선택을 했나**

기존 프로젝트에서 자주 쓰는 `components/`, `hooks/`, `utils/` 3단 구조는 기능이 여러 폴더에 흩어지는 문제가 있다. 예를 들어 채팅 기능을 수정할 때 `components/ChatInput.tsx`, `hooks/useChatSocket.ts`, `utils/formatMessage.ts`를 따로 찾아야 한다. FSD는 **기능 단위로 응집**하기 때문에 `features/chat-messaging/` 하나만 보면 된다.

또한 의존 방향이 단방향으로 강제되기 때문에 순환 참조가 생기지 않는다. 새 기능을 추가할 때 어느 레이어에 넣어야 할지 명확한 기준이 생긴다.

**대안으로 고려한 것**

- **도메인 중심 폴더 구조** (`chat/`, `product/`, `auth/`): 도메인별 분리는 명확하지만 도메인 간 공유 컴포넌트나 공통 훅의 위치가 모호해진다.
- **기존 3단 구조** (`components/`, `hooks/`, `pages/`): 팀 친숙도는 높지만 규모가 커지면 각 폴더 내에서 다시 카테고리를 만들어야 해서 결국 FSD와 비슷한 구조가 된다.

**회고: 아쉬운 점**

FSD는 레이어 규칙을 팀원 전원이 이해하고 지켜야 효과가 있다. 규칙을 강제하는 ESLint 플러그인(`eslint-plugin-feature-sliced-design`)을 설정하지 않아 일부 레이어 간 규칙 위반이 발생했다. CI 단계에서 linting을 강제했다면 더 일관성 있게 유지됐을 것이다.

---

## 2. 채팅 구현: Redis 대신 MySQL 선택

### 결정: 인메모리 메시지 큐 없이 WebSocket(STOMP) + MySQL 직접 저장

**무엇을 했나**

실시간 채팅을 STOMP 프로토콜 기반 WebSocket으로 구현하고, 모든 메시지를 MySQL에 직접 영속화했다.

```
클라이언트
  └→ WebSocket 연결 (/ws-stomp, SockJS fallback)
  └→ STOMP 메시지 발행 (/pub/chat/message)
        └→ Spring MessageBroker
              └→ 메시지 DB 저장 (chat_messages 테이블)
              └→ 안 읽은 수 업데이트 (chat_rooms 테이블)
              └→ 3개 채널로 브로드캐스트
                    ├─ /sub/chat/room/{roomId}   → 채팅방 구독자
                    ├─ /sub/chat/user/{buyerId}  → 구매자 개인 채널
                    └─ /sub/chat/user/{sellerId} → 판매자 개인 채널
```

**DB 스키마**

```sql
CREATE TABLE chat_rooms (
    room_id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id         BIGINT NOT NULL,
    buyer_id           BIGINT NOT NULL,
    seller_id          BIGINT NOT NULL,
    last_message       TEXT,
    last_sent_at       DATETIME(6),
    unread_count_buyer INT NOT NULL DEFAULT 0,
    unread_count_seller INT NOT NULL DEFAULT 0,
    room_status        VARCHAR(20),
    UNIQUE KEY uk_product_buyer (product_id, buyer_id)
);

CREATE TABLE chat_messages (
    message_id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_id      BIGINT NOT NULL,
    sender_id    BIGINT,
    content      TEXT,
    image_url    VARCHAR(500),
    latitude     DOUBLE,
    longitude    DOUBLE,
    location_name VARCHAR(255),
    message_type ENUM('ENTER','IMAGE','LEAVE','MAP',
                      'PAYMENT_FAIL','PAYMENT_REQUEST',
                      'PAYMENT_SUCCESS','SYSTEM','TALK'),
    is_read      BIT(1) DEFAULT 0,
    created_at   DATETIME(6)
);
```

**9가지 메시지 타입**: 단순 텍스트(`TALK`)와 이미지(`IMAGE`) 외에도 위치 공유(`MAP`), 결제 요청/성공/실패(`PAYMENT_REQUEST`, `PAYMENT_SUCCESS`, `PAYMENT_FAIL`), 입장/퇴장(`ENTER`, `LEAVE`), 시스템 안내(`SYSTEM`)를 동일 테이블에서 처리한다.

**이전 메시지 로딩 - 커서 기반 페이지네이션**

```
첫 진입: 최신 30개 메시지 로드
위로 스크롤: 커서 ID 이전 메시지 30개 추가 로드
(오프셋 페이지네이션 대신 커서 기반 → 대용량에서 쿼리 성능 안정적)
```

**왜 Redis를 쓰지 않았나**

Redis를 채팅에 사용하는 주된 이유는 **Pub/Sub 브로커**와 **메시지 캐싱**이다. 그런데 중고거래 플랫폼에서 채팅은 핵심 기능이 아니라 거래 완료를 위한 보조 수단이다. 채팅량이 SNS나 메신저 수준으로 폭증할 가능성이 낮고, 거래 히스토리 보존이 오히려 더 중요하다.

Redis를 추가하면 다음 비용이 발생한다.
- 서버 인프라 비용 (별도 Redis 인스턴스)
- 운영 복잡도 (MySQL + Redis 이중 동기화, 장애 시 데이터 정합성)
- 개발 공수 (메시지 영속화 전략 설계: write-through vs. write-back)

Spring의 내장 Simple Message Broker만으로도 단일 서버 환경에서는 STOMP 브로드캐스팅이 충분히 동작한다. MySQL은 이미 운영 중이므로 추가 인프라 없이 메시지를 영구 저장할 수 있다.

**대안으로 고려한 것**

- **Redis Pub/Sub + MySQL 영속화**: 실시간 브로드캐스팅은 Redis, 영구 저장은 MySQL로 분리. 성능상 최선이지만 인프라 이중화와 동기화 로직 구현 비용이 크다.
- **Redis Streams**: 메시지 큐 + 영속성을 동시에 제공. 그러나 MySQL을 완전히 대체하려면 ORM 없이 직접 Redis 자료구조를 다뤄야 한다.
- **Polling 방식**: WebSocket 없이 주기적 HTTP 요청. 구현은 단순하지만 실시간성이 크게 떨어지고 서버 부하가 높다.

**회고: 한계와 개선 방향**

Spring Simple Message Broker는 **단일 서버** 환경에서만 동작한다. 서버를 수평 확장하면 각 서버의 브로커가 독립적이어서 서버 A에 연결된 클라이언트가 서버 B에 연결된 클라이언트에게 메시지를 받지 못한다. 운영 확장 시에는 Redis Pub/Sub를 외부 브로커로 교체(`spring-messaging` + `RedisMessageListenerContainer`)해야 한다.

---

## 3. 인증 시스템: 다단계 인증 구현

### 결정: JWT + 동네 인증 + 계좌 인증(1원 송금) + 생체 인증 4단계 설계

**무엇을 했나**

신뢰 기반 중고거래라는 서비스 특성에 맞춰 단순 로그인을 넘어 4단계 인증 체계를 설계했다.

```
1단계: 이메일 + 비밀번호 로그인  → JWT 발급 (accessToken + refreshToken)
2단계: 동네 인증 (지역 선택)      → 사용자 상태: UNVERIFIED → VERIFIED
3단계: 계좌 인증 (1원 송금)       → 사용자 상태: VERIFIED → ACTIVE
4단계: 생체 인증 (Face ID/지문)  → 모바일 앱 재진입 시
```

**1단계: JWT 기반 기본 인증**

로그인 성공 시 `accessToken`과 `refreshToken`을 발급한다. 프론트엔드는 토큰을 `localStorage`에 AES-256으로 암호화하여 저장한다.

```typescript
// 토큰 암호화 저장 (XSS 공격 시 직접 토큰 탈취 방지)
setItem: (name, value) => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(value), SECRET_KEY
  ).toString();
  localStorage.setItem(name, encrypted);
},
getItem: (name) => {
  const bytes = CryptoJS.AES.decrypt(localStorage.getItem(name), SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
```

**2단계: 동네 인증 (지역 기반 신뢰 확보)**

Kakao Maps API로 현재 위치를 확인하고 거주 지역을 등록한다. 인증 전(`UNVERIFIED`) 상태에서는 채팅 시작과 거래가 차단된다. 동네 인증은 "실제 그 지역 주민인지"를 간접적으로 검증하여 출처 불명 계정의 사기 거래를 줄이는 역할을 한다.

**3단계: 계좌 인증 (1원 송금)**

계좌 실명 인증 방식이다.

```
1. 사용자가 본인 계좌번호 입력
2. 백엔드가 해당 계좌로 1원 송금 (메모에 인증번호 포함)
3. 사용자가 통장 입금 내역에서 인증번호 확인
4. 인증번호 입력 → 계좌 소유자 본인 확인 완료
5. 사용자 상태: ACTIVE → 전체 기능 접근 가능
```

계좌번호는 DB에 AES로 암호화하여 저장한다(JPA 컨버터로 등록하여 읽기/쓰기 시 자동 암호화·복호화).

**4단계: 생체 인증 (모바일 앱 재진입)**

React Native(Expo) 앱에서 Face ID 또는 지문 인식으로 앱 재진입 시 신원을 검증한다.

구현 상 특이한 점은 React Native 앱이 **WebView 안에 Next.js 웹 앱을 호스팅**하는 구조다. 생체 인증 API는 네이티브 레이어에만 존재하므로, 웹에서 요청을 보내면 네이티브 브릿지가 처리하고 결과를 웹으로 반환하는 메시지 패싱 구조를 구현했다.

```typescript
// 네이티브 브릿지 - 생체 인증 처리
case 'requestBiometricAuth':
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled  = await LocalAuthentication.isEnrolledAsync();
  
  if (!hasHardware || !isEnrolled) {
    웹으로전송({ type: 'biometricResult', success: false, error: 'not_supported' });
    return;
  }
  
  const 지원인증수단 = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const isFaceId = 지원인증수단.includes(AuthenticationType.FACIAL_RECOGNITION);
  
  const 인증결과 = await LocalAuthentication.authenticateAsync({
    promptMessage: isFaceId ? 'Face ID로 인증' : '지문으로 인증',
    disableDeviceFallback: false,
  });
  
  웹으로전송({ type: 'biometricResult', success: 인증결과.success });
  break;

// 디바이스 토큰 생성 후 Keychain에 보관
case 'generateDeviceToken':
  const token = Crypto.randomUUID();
  await SecureStore.setItemAsync('device_token', token);
  웹으로전송({ type: 'deviceTokenGenerated', token });
  break;
```

**인증 상태 체크 필터**

모든 API 요청에 인증 상태 체크 필터가 적용되어 사용자 상태에 따라 접근을 제한한다.

```
UNVERIFIED → 동네 인증 페이지로 리다이렉트
VERIFIED   → 계좌 인증 페이지로 리다이렉트
ACTIVE     → 전체 기능 접근 가능
```

**왜 이 선택을 했나**

중고거래 플랫폼의 핵심 과제는 **사기 방지와 신뢰 형성**이다. 이메일 가입만으로 계정을 만들면 사기꾼이 다수의 계정을 생성하기 쉽다. 동네 인증은 지역 기반 신뢰를, 계좌 인증은 실명 기반 신뢰를 확보한다. 생체 인증은 타인이 스마트폰을 가져가도 앱 내 결제를 막는 역할을 한다.

**대안으로 고려한 것**

- **SMS 본인인증 (PASS 앱)**: 가장 일반적인 방식이지만 API 비용이 발생하고 SSAFY 환경에서 외부 통신사 연동이 어렵다.
- **이메일 인증만**: 구현은 단순하지만 신뢰 기반 중고거래라는 서비스 정체성에 맞지 않는다.
- **OAuth 소셜 로그인**: 카카오/네이버 계정 연동으로 신원 확인. 빠르게 적용 가능하지만 동네/계좌 인증과 별도로 구현해야 한다.

**회고: 2차 비밀번호 미완성**

DB에는 2차 비밀번호 해시 필드가 존재하고 프론트엔드에도 설정 페이지가 있지만, 결제 시 강제 입력하는 로직이 완성되지 않았다. 인증 인프라는 준비됐지만 실제 거래 플로우에 통합하지 못한 채 프로젝트가 끝났다. 우선순위를 더 명확하게 설정했어야 했다.

---

## 4. AI 자연어 검색: 6단계 → 1단계

### 결정: LLM으로 자연어를 구조화된 검색 필터로 변환

**무엇을 했나**

기존 키워드 검색 방식에서 자연어 쿼리를 입력하면 LLM이 검색 의도를 분석하여 필터를 자동 구성하는 방식으로 전환했다. 사용자가 "검은 맥북 프로 100만원 이하 미개봉"이라고 입력하면 백엔드가 직접 브랜드, 제품명, 색상, 최대 가격, 상태를 추출해 단일 SQL 쿼리로 실행한다.

**기존 방식의 문제 (6단계)**

| 단계 | 작업 | 문제 |
|------|------|------|
| 1 | 원문 텍스트 전달 | 한/영 표기 혼재 ("맥북" vs "MacBook") |
| 2 | 제목 LIKE 검색 | 동의어 미포함 (맥북 검색 시 MacBook 누락) |
| 3 | 브랜드 필드 검색 | 별도 쿼리 실행 |
| 4 | 색상 필드 검색 | 또 별도 쿼리 |
| 5 | 가격/상태 필터 | 파라미터 파싱 후 쿼리 |
| 6 | 결과 병합 및 중복 제거 | 애플리케이션 레이어에서 처리 |

**새로운 방식 (1단계)**

```
사용자 입력: "검은 맥북 프로 100만원 이하 미개봉"
     ↓
GMS API (LLM) 분석
     ↓
{
  "filters": {
    "brand": "Apple",
    "productName": "MacBook Pro",
    "colors": ["검정"],
    "maxPrice": 1000000,
    "condition": "새상품"
  },
  "expanded": {
    "brandAliases":   ["Apple", "애플"],
    "productAliases": ["MacBook Pro", "맥북프로", "맥북"],
    "colorAliases":   ["검은색", "블랙", "검정", "black"]
  }
}
     ↓
JPA Specification으로 단일 안전 SQL 쿼리 실행
     ↓
페이지네이션된 결과 반환
```

**3단계 파이프라인 구현**

```
[생성 시점] 상품 등록
  └→ LLM 메타데이터 추출 (제목 + 설명 + 이미지 분석)
  └→ product 테이블에 인덱싱 컬럼에 미리 저장
        브랜드 컬럼           → "Apple"
        제품명 컬럼           → "MacBook Pro"
        대표 색상 컬럼        → "검정,은색"
        상태 컬럼             → "새상품"
        검색 동의어 컬럼      → "Apple 애플 MacBook Pro 맥북프로 맥북"

[검색 시점] 사용자 쿼리
  └→ LLM으로 자연어 → 구조화 필터 변환
  └→ JPA Specification으로 안전한 쿼리 조립
  └→ 단일 SQL 실행
```

**이미지도 분석에 활용**

상품 등록 시 이미지 최대 3장을 LLM에 전달하여 텍스트로 설명되지 않은 정보를 추출한다.
- 로고/모델명 텍스트 OCR
- 상태 판단 (새상품, 사용감 있음, 상태 나쁨, 파손)
- 눈에 띄는 흠집이나 결함 감지

**SQL Injection 방지**

LLM이 반환한 문자열을 절대 직접 SQL에 삽입하지 않는다. JSON 응답을 파싱하여 타입을 검증한 뒤 JPA Criteria API로 안전하게 쿼리를 조립한다.

```java
// LLM 출력을 절대 SQL로 직접 실행하지 않음
// JPA Specification이 파라미터화된 쿼리 생성
if (필터.getBrand() != null) {
    조건 = 조건.and(브랜드필드검색(
        Arrays.asList(필터.getBrand()),
        확장검색어.getBrandAliases()    // 동의어 포함 LIKE 검색
    ));
}

if (필터.getCondition() != null) {
    // 화이트리스트 검증 후 쿼리 실행
    if (허용상태목록.contains(필터.getCondition())) {
        조건 = 조건.and(상태일치(필터.getCondition()));
    }
}
```

모든 `enum` 필드(`condition`, `tradeType`, `sort`)는 화이트리스트 검증을 통과해야 쿼리에 포함된다.

**왜 이 선택을 했나**

중고거래에서 사용자는 정확한 카테고리 분류보다 자연스러운 언어로 검색한다. "맥북" 이라고 검색해도 "MacBook", "애플 노트북"까지 같이 보여줘야 하고, "100만원 이하 미개봉"처럼 조건을 한 문장에 담아서 입력한다. 기존 키워드 검색으로는 이 사용 패턴을 만족시키기 어렵다.

LLM을 활용하면 동의어 확장, 의도 파악, 다중 필터 동시 추출을 한 번에 처리할 수 있다.

**대안으로 고려한 것**

- **Elasticsearch + 형태소 분석**: 동의어 사전, 자동완성, 풀텍스트 검색에 최적화된 방식. 성능은 뛰어나지만 별도 인프라 운영과 인덱스 설계 비용이 크다. SSAFY 환경에서 별도 서버 추가가 어려웠다.
- **직접 동의어 사전 구축**: 브랜드별 한/영 매핑 테이블을 수작업 관리. 신규 상품 카테고리가 생길 때마다 수작업이 필요해 확장성이 없다.
- **사용자에게 카테고리 선택 강제**: 검색 단계를 세분화하여 브랜드 → 제품명 → 조건 순서로 선택. 정확도는 높지만 UX가 나빠지고 이게 바로 6단계 문제의 원인이다.

**회고: LLM 호출 레이턴시**

GMS API 호출이 검색마다 추가되므로 응답 시간이 일반 DB 쿼리보다 늘어난다. 현재는 검색 요청마다 실시간으로 LLM을 호출하는데, 동일한 쿼리가 반복되는 경우 결과를 캐싱하거나, 검색어 입력 완료(디바운싱) 시점에만 LLM을 호출하는 방식으로 개선할 수 있다. 또한 LLM 호출이 실패하면 일반 키워드 검색으로 폴백하는 로직이 이미 구현되어 있어(빈 필터를 반환하여 전체 검색으로 대체) 서비스 중단은 없다.

---

## 5. 프론트엔드 성능 최적화

### 주요 이슈와 해결 내역

**채팅 입력 레이아웃 쓰래싱 (High Priority)**

한국어 IME(입력기) 조합 중 `textarea`의 `scrollHeight`를 읽고 높이를 바꾸는 동작이 Layout Thrashing을 유발했다. `scrollHeight` 읽기와 높이 쓰기가 같은 프레임에서 반복되면 브라우저가 강제 리플로우를 계속 실행한다.

```typescript
// 변경 전: 매 입력마다 즉시 DOM 읽기/쓰기
onInput: () => { textarea.style.height = textarea.scrollHeight + 'px'; }

// 변경 후: requestAnimationFrame으로 배치
onInput: () => {
  requestAnimationFrame(() => {
    textarea.style.height = textarea.scrollHeight + 'px';
  });
}
```

**상품 목록 불필요한 리렌더링 (High Priority)**

스크롤 중 상품 카드가 계속 리렌더링되어 버벅임이 발생했다. `React.memo` + `useCallback`으로 불필요한 리렌더링을 방지했다. 부모에서 `onWishToggle` 핸들러를 `useCallback` 없이 인라인으로 전달하면 매 렌더마다 새 함수 참조가 생겨 `React.memo`가 무효화된다.

**TanStack React Query 캐시 설정**

초기에 `staleTime: 0`으로 설정하여 페이지 이동마다 데이터를 재요청했다. 상품 목록, 채팅방 목록 등 변경 빈도가 낮은 데이터는 `staleTime: 30_000`으로 설정하여 불필요한 API 호출과 빈 화면 깜빡임을 줄였다.

**이미지 CLS (Cumulative Layout Shift)**

`<img>` 태그에 `width`/`height` 속성이 없으면 이미지 로드 전후로 레이아웃이 이동한다. 모든 상품 이미지에 명시적 크기를 지정하여 레이아웃 안정성을 확보했다.

**STOMP 디버그 로그 제거**

개발 환경에서 활성화한 STOMP 연결 로그가 프로덕션 빌드에 그대로 포함되어 있었다. 매 메시지마다 콘솔에 출력되어 성능에 영향을 줬다. 빌드 환경 변수로 제어하도록 수정했다.

---

## 6. 최종 기술 수치

| 지표 | 내용 |
|------|------|
| 자연어 검색 단계 | 6단계 → 1단계 |
| 인증 체계 | 4단계 (JWT + 동네 + 계좌 + 생체) |
| 채팅 메시지 타입 | 9종 (텍스트/이미지/위치/결제/시스템) |
| 프론트 레이어 구조 | FSD 6계층 (app/views/widgets/features/entities/shared) |
| 채팅 페이지네이션 | 커서 기반 (30건 단위) |
| LLM 폴백 | 검색 실패 시 일반 키워드 검색으로 자동 전환 |
| 토큰 저장 | AES-256 암호화 localStorage |
| 생체인증 | Face ID / 지문 (expo-local-authentication) |
| 디바이스 토큰 저장 | iOS Keychain / Android Keystore (expo-secure-store) |

---

## 7. AI 활용 개발 프로세스

### 개요

제품 기능에 AI를 사용하는 것과 별개로, **개발 프로세스 자체에도 AI를 체계적으로 도입**했다. 단순히 코드를 생성시키는 수준이 아니라, 작업 범위 이탈 방지·검증 가능성 확보·재현성 확보를 목표로 세 가지 워크플로우를 운영했다.

---

### 1. Plan-First Workflow + Human Approval Gate

**문제 인식**

AI에게 "이 기능 구현해줘"라고 바로 시키면 예상치 못한 파일이 바뀌거나, 기존 API 계약이 깨지거나, 테스트 없이 코드가 병합되는 상황이 생긴다. 특히 이 프로젝트처럼 Spring Boot 백엔드와 Next.js 웹, Expo 네이티브 앱이 함께 있는 구조에서는 한쪽 변경이 다른 쪽에 조용히 영향을 주는 경우가 많았다.

**적용 방식**

구현 요청 전에 반드시 계획 수립 단계를 거치도록 강제했다. AI가 계획을 제출하기 전까지는 코드 생성을 승인하지 않는 규칙을 팀 내 합의로 운영했다.

계획서에 포함해야 하는 항목:

| 항목 | 목적 |
|------|------|
| 변경되는 파일 목록 | 작업 범위 명시, 예상 외 파일 변경 방지 |
| DB 스키마 영향 | 마이그레이션 필요 여부 사전 확인 |
| API 계약 영향 | 웹·네이티브·백엔드 간 인터페이스 변경 여부 |
| 필요한 테스트 | 어떤 시나리오를 검증해야 하는지 |
| 이번 작업에서 하지 말아야 할 것 | 범위 외 리팩토링·최적화 금지 항목 |

**이 프로젝트에서의 실제 효과**

WebView ↔ 네이티브 브릿지 생체 인증 작업에서 이 방식이 효과를 발휘했다. 계획 단계에서 "웹 측 메시지 타입 정의가 바뀌면 네이티브 수신 핸들러도 동시에 변경해야 한다"는 의존 관계가 사전 식별됐다. 덕분에 웹만 수정하고 네이티브를 빠뜨리는 상황을 방지했다.

---

### 2. AI 역할 분리 (Researcher → Planner → Reviewer)

**문제 인식**

하나의 AI에게 조사·설계·구현·검증을 모두 맡기면 각 단계의 품질이 낮아진다. 구현을 맡은 AI가 스스로 자신의 코드를 검토하면 편향이 생기고, 놓친 버그를 찾기 어렵다.

**적용 방식**

작업 유형에 따라 AI의 역할을 세 가지로 분리하여 독립적으로 운영했다.

```
Researcher  → 기술 조사, 라이브러리 선택, 선례 탐색
              (예: "Redis vs MySQL 채팅 구현 비교 분석")

Planner     → 구현 계획 수립, 파일 영향 범위 산정, 테스트 시나리오 정의
              (예: "STOMP 병렬 브로드캐스트 채널 설계 계획서")

Reviewer    → 완성된 코드 독립 검토, 보안 취약점·엣지케이스 지적
              (예: "이 Race Condition 방어 로직에서 단일 인스턴스 외 환경 한계 검토")
```

Reviewer는 구현한 AI와 다른 컨텍스트에서 실행하여 구현 의도를 모르는 상태에서 코드만 보고 판단하게 했다.

**이 프로젝트에서의 실제 효과**

자연어 검색 구현 시 Researcher가 Elasticsearch vs LLM 기반 검색 방식을 먼저 분석했고, Planner가 JPA Specification 기반 안전 쿼리 조립 방식을 확정했다. Reviewer가 이후 "LLM 반환 문자열이 SQL에 직접 삽입될 경우 Injection 가능성"을 지적하여 화이트리스트 검증 단계를 추가했다.

---

### 3. 프롬프트 및 작업 로그 관리

**문제 인식**

AI가 생성한 코드가 왜 그런 구조로 나왔는지 나중에 추적할 수 없으면, 버그가 발생했을 때 원인을 찾기 어렵다. 또한 같은 작업을 다시 시킬 때 매번 처음부터 설명해야 한다.

**적용 방식**

- **프롬프트 버전 관리**: 주요 작업에 사용한 프롬프트를 문서로 보관하여 재현 가능성 확보
- **작업 훅 로그**: AI 도구 실행 전·후 로그를 기록하여 어떤 파일이 언제 어떤 이유로 변경됐는지 추적
- **결정 근거 기록**: 특정 구현 방식을 선택한 이유를 코드 주석이 아니라 작업 문서에 남겨 코드 리뷰 시 맥락 공유

**이 프로젝트에서의 실제 효과**

FSD 레이어 구조 설계 시 "왜 이 컴포넌트를 `features`가 아닌 `widgets`에 배치했는가"를 작업 문서에 남겨뒀기 때문에 신규 기능 추가 시 레이어 결정 기준을 재합의 없이 일관되게 유지할 수 있었다.

---

### 요약

| 워크플로우 | 해결한 문제 | 효과 |
|-----------|-----------|------|
| Plan-First + 승인 게이트 | AI 코드 생성 시 작업 범위 이탈, 예상 외 변경 리스크 | 구현 전 영향 범위 사전 확정 |
| 역할 분리 (Researcher / Planner / Reviewer) | 단일 AI의 구현·검증 편향 | 구현과 검증 과정 독립 운영 |
| 프롬프트 및 훅 로그 관리 | AI 작업의 재현 불가·원인 추적 불가 | 오류 원인 추적 및 작업 재현성 확보 |

---

**작성자**: S14P11A202 팀  
**작성일**: 2026.05.28
