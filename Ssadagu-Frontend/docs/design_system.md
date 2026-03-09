# 디자인 시스템 — Ssadagu

> `design.pen` 파일의 `$variables` 기반으로 정의된 프론트엔드 디자인 시스템입니다.
> 코드 경로: `apps/web/src/shared/styles/theme.ts`

---

## 1. 컬러 팔레트 (Colors)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `colors.primary` | `#3182F6` | 주요 액션, 버튼, 링크, 활성 탭 |
| `colors.bg` | `#F2F4F6` | 앱 전체 배경, 비활성 채팅 버블 |
| `colors.surface` | `#FFFFFF` | 카드, 헤더, 인풋, 내비게이션 배경 |
| `colors.textPrimary` | `#191F28` | 본문 텍스트, 제목 |
| `colors.textSecondary` | `#8B95A1` | 보조 텍스트, 시간·지역 메타, placeholder |
| `colors.textWhite` | `#FFFFFF` | 컬러 배경 위 텍스트 |
| `colors.border` | `#E5E8EB` | 구분선, 인풋 테두리, 카드 border-bottom |
| `colors.disabled` | `#D1D6DB` | 비활성 버튼 배경 |
| `colors.red` | `#F04452` | 경고, 삭제, 탈퇴, 위험 액션 |
| `colors.chatMine` | `#3182F6` | 내 채팅 버블 배경 (= primary) |
| `colors.chatOther` | `#F2F4F6` | 상대방 채팅 버블 배경 (= bg) |
| `colors.inactiveTab` | `#ADB5BD` | 비활성 탭·바텀내비 아이콘/텍스트 |
| `colors.success` | `#16A34A` | 성공 상태, 인증 완료 |
| `colors.successBg` | `#F0FDF4` | 성공 상태 배경 |
| `colors.warning` | `#F59E0B` | 경고, 대기 상태 |
| `colors.warningBg` | `#FFFBEB` | 경고 상태 배경 |
| `colors.overlay` | `rgba(0,0,0,0.4)` | 모달 오버레이 |

---

## 2. 타이포그래피 (Typography)

**폰트**: `Pretendard Variable` (CDN: `cdn.jsdelivr.net/gh/orioncactus/pretendard`)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `typography.size.xs` | `11px` | 배지, 매우 작은 레이블 |
| `typography.size.sm` | `13px` | 메타 정보, 시간, 지역 |
| `typography.size.base` | `14px` | 기본 본문 |
| `typography.size.md` | `15px` | 상품명, 인풋 텍스트 |
| `typography.size.lg` | `16px` | 섹션 제목, 헤더 |
| `typography.size.xl` | `18px` | 헤더 타이틀 |
| `typography.size.2xl` | `20px` | 페이지 제목 |
| `typography.size.3xl` | `24px` | 랜딩 메인 카피 |
| `typography.weight.regular` | `400` | 일반 텍스트 |
| `typography.weight.medium` | `500` | 강조 텍스트 |
| `typography.weight.semibold` | `600` | 버튼, 가격, 닉네임 |
| `typography.weight.bold` | `700` | 제목, 섹션 헤더 |

---

## 3. 레이아웃 상수 (Layout Constants)

| 상수 | 값 | 용도 |
|------|-----|------|
| `APP_WIDTH` | `390px` | 모바일 앱 기준 너비 |
| `STATUS_BAR_HEIGHT` | `54px` | 상단 상태바 높이 |
| `HEADER_HEIGHT` | `56px` | 헤더 높이 |
| `BOTTOM_NAV_HEIGHT` | `84px` | 바텀 내비게이션 높이 |

> **콘텐츠 영역 계산**:
> - 상단 여백: `padding-top: STATUS_BAR_HEIGHT + HEADER_HEIGHT` (= 110px)
> - 하단 여백: `padding-bottom: BOTTOM_NAV_HEIGHT` (= 84px)

---

## 4. 그림자 (Shadows)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `shadows.sm` | `0 1px 3px rgba(0,0,0,0.08)` | 카드, 인풋 약한 그림자 |
| `shadows.md` | `0 4px 12px rgba(0,0,0,0.10)` | 모달, 드롭다운 |
| `shadows.lg` | `0 8px 24px rgba(0,0,0,0.14)` | FAB, 플로팅 요소 |

---

## 5. 테두리 반경 (Border Radius)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `radius.sm` | `8px` | 썸네일 이미지, 소형 카드 |
| `radius.md` | `12px` | 카드, 배지 |
| `radius.lg` | `16px` | 모달, 바텀 시트 |
| `radius.pill` | `999px` | 버튼, 인풋 필드 |

---

## 6. Z-Index 레이어

| 토큰 | 값 | 용도 |
|------|-----|------|
| `zIndex.header` | `10` | 헤더 |
| `zIndex.bottomNav` | `20` | 바텀 내비게이션 |
| `zIndex.modal` | `50` | 모달, 오버레이 |

---

## 7. 컴포넌트 사용 가이드

### 버튼 (Button)
```tsx
import Button from '@/shared/ui/Button';

// 기본 (Primary, Large, FullWidth)
<Button fullWidth>시작하기</Button>

// 아웃라인
<Button variant="outline" size="md">취소</Button>

// 위험 액션
<Button variant="danger">탈퇴하기</Button>

// 로딩
<Button loading>확인 중...</Button>
```

### 인풋 (Input)
```tsx
import Input from '@/shared/ui/Input';

<Input
  label="이메일"
  type="email"
  placeholder="이메일을 입력해주세요"
  error={errors.email?.message}
  value={value}
  onChange={onChange}
/>
```

### 바텀 시트 / 모달
```tsx
import BottomSheetBase from '@/shared/ui/BottomSheetBase';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';

// 바텀 시트
<BottomSheetBase isOpen={open} onClose={() => setOpen(false)} title="결제 수단 선택">
  {children}
</BottomSheetBase>

// 확인 다이얼로그
<ConfirmDialog
  isOpen={open}
  title="로그아웃"
  message="정말 로그아웃하시겠어요?"
  onConfirm={handleLogout}
  onClose={() => setOpen(false)}
/>
```

---

## 8. 채팅 버블 스타일

| 구분 | 배경 | 텍스트 | 정렬 | border-radius |
|------|------|--------|------|---------------|
| 내 메시지 | `#3182F6` | `#FFFFFF` | 오른쪽 | `18px 18px 4px 18px` |
| 상대방 메시지 | `#F2F4F6` | `#191F28` | 왼쪽 | `18px 18px 18px 4px` |

---

## 9. 상태 배지 (Status Badge)

| 상태 | 배경 | 텍스트 색 | 레이블 |
|------|------|-----------|--------|
| `ON_SALE` | `#EFF6FF` | `#3182F6` | 판매중 |
| `RESERVED` | `#FFFBEB` | `#F59E0B` | 예약중 |
| `SOLD` | `#F2F4F6` | `#8B95A1` | 판매완료 |
| `SUCCESS` | `#F0FDF4` | `#16A34A` | 거래완료 |
| `PENDING` | `#FFFBEB` | `#F59E0B` | 진행중 |
| `FAILED` | `#FFF0F0` | `#F04452` | 실패 |

---

## 10. 코드에서 사용하는 방법

```typescript
// theme 전체 import
import { colors, shadows, zIndex, radius, typography, APP_WIDTH, BOTTOM_NAV_HEIGHT, HEADER_HEIGHT } from '@/shared/styles/theme';

// Emotion styled 사용 예시
import styled from '@emotion/styled';

const Container = styled.div`
  background: ${colors.surface};
  border-radius: ${radius.md};
  box-shadow: ${shadows.sm};
  padding: 16px 20px;
`;
```
