# 데이터 모델 (Frontend TypeScript Types) — Ssadagu

> 프론트엔드에서 사용하는 TypeScript 타입 정의입니다.
> `packages/shared/src/types/` 또는 각 entity 레이어의 `types.ts`에 위치합니다.

---

## 1. 공통 응답 형식

```typescript
// API 공통 응답 래퍼
interface ApiResponse<T> {
  status: "SUCCESS" | "ERROR";
  message: string;
  data: T;
}

// 페이징 응답
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;        // 현재 페이지 (0-indexed)
  first: boolean;
  last: boolean;
}
```

---

## 2. 인증 (Auth)

```typescript
// 로그인 요청
interface LoginRequest {
  email: string;
  password: string;
}

// 토큰 응답
interface TokenResponse {
  grantType: string;       // "Bearer"
  accessToken: string;
  refreshToken: string;
}

// Zustand 인증 스토어 상태
interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: TokenResponse) => void;
  clearToken: () => void;
}
```

---

## 3. 유저 (User)

```typescript
type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

interface User {
  id: number;
  email: string;
  nickname: string;
  status: UserStatus;
  createdAt: string;        // ISO 8601
}

// 내 정보 응답 (GET /api/users/me)
interface MyProfileResponse {
  id: number;
  email: string;
  nickname: string;
  status: UserStatus;
  account: UserAccount | null;   // 계좌 연동 여부
}
```

---

## 4. 계좌 (Account)

```typescript
type VerifiedStatus = "PENDING" | "VERIFIED" | "FAILED";

interface UserAccount {
  id: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;           // 마스킹된 번호 (예: "****-****-1234")
  accountHolderName: string;
  isPrimary: boolean;
  verifiedStatus: VerifiedStatus;
  verifiedAt: string | null;
}

// 계좌 등록 요청
interface RegisterAccountRequest {
  bankCode: string;
  bankName: string;
  accountNumber: string;
}

// 1원 인증 코드 확인 요청
interface VerifyAccountRequest {
  accountId: number;
  code: string;
}
```

---

## 5. 상품 (Product)

```typescript
type ProductStatus = "ON_SALE" | "RESERVED" | "SOLD" | "DELETED";

interface ProductImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

interface Product {
  id: number;
  sellerId: number;
  sellerNickname: string;
  title: string;
  description: string;
  price: number;
  categoryCode: string;
  regionName: string;
  status: ProductStatus;
  wishCount: number;
  chatCount: number;
  images: ProductImage[];
  isWished: boolean;         // 현재 유저의 찜 여부
  createdAt: string;
  updatedAt: string;
}

// 상품 목록 아이템 (카드 표시용 - 요약 정보)
interface ProductSummary {
  id: number;
  title: string;
  price: number;
  regionName: string;
  status: ProductStatus;
  wishCount: number;
  chatCount: number;
  thumbnailUrl: string | null;    // images[0].imageUrl
  isWished: boolean;
  createdAt: string;
}

// 상품 등록/수정 요청
interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  categoryCode: string;
  regionName: string;
  imageUrls: string[];
}

// 상품 목록 조회 필터
interface ProductFilter {
  categoryCode?: string;
  regionName?: string;
  status?: ProductStatus;
  page?: number;
  size?: number;
}
```

---

## 6. 찜 (Wish)

```typescript
interface ProductWish {
  id: number;
  productId: number;
  userId: number;
  createdAt: string;
}

// 찜 토글 응답
interface WishToggleResponse {
  isWished: boolean;
  wishCount: number;
}
```

---

## 7. 채팅 (Chat)

```typescript
type RoomStatus = "ACTIVE" | "CLOSED" | "DELETED";

interface ChatRoom {
  id: number;
  productId: number;
  productTitle: string;
  productThumbnailUrl: string | null;
  buyerId: number;
  buyerNickname: string;
  sellerId: number;
  sellerNickname: string;
  lastMessage: string | null;
  lastSentAt: string | null;
  unreadCount: number;               // 내 기준 읽지 않은 메시지 수
  roomStatus: RoomStatus;
}

interface ChatMessage {
  id: string;                         // MongoDB ObjectId
  roomId: number;
  senderId: number;
  senderNickname: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

// STOMP 메시지 전송 페이로드
interface SendMessagePayload {
  roomId: number;
  content: string;
}
```

---

## 8. 거래 (Transaction)

```typescript
type PaymentMethod = "BANK_TRANSFER" | "CARD" | "PAY";
type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

interface Transaction {
  id: number;
  productId: number;
  productTitle: string;
  buyerId: number;
  buyerNickname: string;
  sellerId: number;
  sellerNickname: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  failReason: string | null;
  createdAt: string;
}

// 결제 요청
interface CreateTransactionRequest {
  productId: number;
  paymentMethod: PaymentMethod;
  accountId: number;               // 결제에 사용할 계좌
}
```

---

## 9. 카테고리 (Category)

```typescript
// categoryCode 목록 (임시 정의 — 백엔드 확정 후 업데이트)
type CategoryCode =
  | "ELECTRONICS"
  | "FASHION"
  | "FURNITURE"
  | "BOOKS"
  | "SPORTS"
  | "BEAUTY"
  | "KIDS"
  | "FOOD"
  | "ETC";

interface Category {
  code: CategoryCode;
  name: string;                   // 한글명 (예: "전자기기", "의류")
}
```
