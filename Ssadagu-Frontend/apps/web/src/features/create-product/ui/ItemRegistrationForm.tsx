'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { colors, typography, radius, HEADER_HEIGHT, BOTTOM_NAV_HEIGHT } from '@/shared/styles/theme';
import Button from '@/shared/ui/Button';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { useCreateProduct } from '../model/useCreateProduct';
import { useUpdateProduct } from '../model/useUpdateProduct';
import type { ProductDetail } from '@/entities/product';

/* ── Types ─────────────────────────────────────────────── */

interface FormValues {
  title: string;
  categoryCode: string;
  price: string;
  description: string;
  regionName: string;
  status?: string;
}

interface ItemRegistrationFormProps {
  productId?: number;
  initialData?: ProductDetail;
}

const CATEGORIES = [
// ... (omitted if not changing, but I need to show the context)
  { code: 'ELECTRONICS', label: '전자기기' },
  { code: 'CLOTHING', label: '의류' },
  { code: 'BOOKS', label: '도서' },
  { code: 'FURNITURE', label: '가구/인테리어' },
  { code: 'SPORTS', label: '스포츠/레저' },
  { code: 'BEAUTY', label: '뷰티/미용' },
  { code: 'FOOD', label: '식품' },
  { code: 'KIDS', label: '유아동' },
  { code: 'HOBBY', label: '취미/게임' },
  { code: 'ETC', label: '기타' },
];

/* ── Styled ─────────────────────────────────────────────── */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${colors.surface};
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
  z-index: 10;
  padding: 0 16px;
`;

const BackButton = styled.button`
  position: absolute;
  left: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textPrimary};
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.1s;

  &:active {
    background: ${colors.bg};
  }
`;

const HeaderTitle = styled.h1`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.lg};
  font-weight: ${typography.weight.semibold};
  color: ${colors.textPrimary};
`;

const Content = styled.div`
  flex: 1;
  padding-top: ${HEADER_HEIGHT}px;
  padding-bottom: calc(${BOTTOM_NAV_HEIGHT}px + 72px);
  overflow-y: auto;
`;

const Section = styled.div`
  padding: 20px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/* ── Photo Uploader ─────────────────────────────────────── */

const PhotoRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px 20px 0;
  overflow-x: auto;
`;

const PhotoBox = styled.div`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border: 2px dashed ${colors.border};
  border-radius: ${radius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  background: ${colors.bg};
  transition: border-color 0.15s, background 0.15s;

  &:active {
    border-color: ${colors.primary};
    background: #EBF4FF;
  }
`;

const PhotoCount = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
`;

/* ── Field Components ───────────────────────────────────── */

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const FieldInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  color: ${colors.textPrimary};
  background: ${colors.bg};
  border: 1.5px solid ${({ hasError }) => (hasError ? colors.red : colors.border)};
  border-radius: ${radius.sm};
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;

  &::placeholder {
    color: ${colors.textSecondary};
  }

  &:focus {
    border-color: ${({ hasError }) => (hasError ? colors.red : colors.primary)};
    background: ${colors.surface};
  }
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PriceUnit = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
  white-space: nowrap;
`;

const StyledSelect = styled.select<{ hasError?: boolean }>`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  color: ${colors.textPrimary};
  background: ${colors.bg};
  border: 1.5px solid ${({ hasError }) => (hasError ? colors.red : colors.border)};
  border-radius: ${radius.sm};
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%238B95A1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
  box-sizing: border-box;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${colors.primary};
    background-color: ${colors.surface};
  }
`;

const TextArea = styled.textarea<{ hasError?: boolean }>`
  width: 100%;
  min-height: 140px;
  padding: 14px 16px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  color: ${colors.textPrimary};
  background: ${colors.bg};
  border: 1.5px solid ${({ hasError }) => (hasError ? colors.red : colors.border)};
  border-radius: ${radius.sm};
  outline: none;
  resize: vertical;
  line-height: 1.6;
  transition: border-color 0.15s;
  box-sizing: border-box;

  &::placeholder {
    color: ${colors.textSecondary};
  }

  &:focus {
    border-color: ${colors.primary};
    background: ${colors.surface};
  }
`;

const FieldError = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${colors.red};
  padding-left: 4px;
`;

/* ── Location Picker Row ────────────────────────────────── */

const LocationRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: none;
  border: none;
  border-top: 1px solid ${colors.border};
  border-bottom: 1px solid ${colors.border};
  cursor: pointer;
  width: 100%;
  text-align: left;
  margin-top: 4px;
  transition: background 0.1s;

  &:active {
    background: ${colors.bg};
  }
`;

const LocationText = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

/* ── Bottom Button ──────────────────────────────────────── */

const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px 28px;
  background: ${colors.surface};
  border-top: 1px solid ${colors.border};
  z-index: 10;
`;

/* ── Icons ──────────────────────────────────────────────── */

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke={colors.textSecondary}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="13"
      r="4"
      stroke={colors.textSecondary}
      strokeWidth="1.8"
    />
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"
      stroke={colors.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="10"
      r="3"
      stroke={colors.textSecondary}
      strokeWidth="2"
    />
  </svg>
);

/* ── Main Component ─────────────────────────────────────── */

const ItemRegistrationForm = ({ productId, initialData }: ItemRegistrationFormProps) => {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [photoCount, setPhotoCount] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const isEdit = !!productId;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: initialData?.title || '',
      categoryCode: initialData?.categoryCode || '',
      price: initialData?.price?.toString() || '',
      description: initialData?.description || '',
      regionName: initialData?.regionName || '',
      status: initialData?.status || 'ON_SALE',
    },
  });

  const handlePhotoAdd = () => {
    if (photoCount < 10) {
      setPhotoCount((c) => c + 1);
    }
  };

  const handleLocationClick = () => {
    // Location picker — placeholder for future feature
  };

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(productId || 0);
  const currentMutation = isEdit ? updateMutation : createMutation;

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          title: data.title,
          categoryCode: data.categoryCode,
          price: Number(data.price.replace(/[^0-9]/g, '')),
          description: data.description,
          regionName: data.regionName || '미설정',
          status: (data.status as any) || 'ON_SALE',
        });
        router.replace(`/products/${productId}`);
      } else {
        const result = await createMutation.mutateAsync({
          sellerId: 1, // API 명세에 따른 임시 판매자 ID
          title: data.title,
          categoryCode: data.categoryCode,
          price: Number(data.price.replace(/[^0-9]/g, '')),
          description: data.description,
          regionName: data.regionName || '미설정',
        });

        const newProductId =
          typeof result?.id === 'number'
            ? result.id
            : typeof (result?.data as Record<string, unknown>)?.id === 'number'
              ? (result.data as Record<string, unknown>).id
              : null;

        if (newProductId) {
          router.replace(`/products/${newProductId}`);
        } else {
          router.replace('/home');
        }
      }
    } catch (err: any) {
      setServerError(err.message || '요청에 실패했습니다.');
    }
  };

  return (
    <Page>
      <Header>
        <BackButton onClick={() => router.back()} aria-label="뒤로가기">
          <CloseIcon />
        </BackButton>
        <HeaderTitle>{isEdit ? '게시글 수정' : '내 물품 팔기'}</HeaderTitle>
      </Header>

      <Content>
        {/* Photo Uploader */}
        <PhotoRow>
          <PhotoBox onClick={handlePhotoAdd} role="button" aria-label="사진 추가">
            <CameraIcon />
            <PhotoCount>{photoCount}/10</PhotoCount>
          </PhotoBox>
        </PhotoRow>

        <Section>
          {isEdit && (
            <FieldWrapper>
              <StyledSelect
                hasError={!!errors.status}
                {...register('status', { required: '상태를 선택해주세요' })}
              >
                <option value="ON_SALE">판매중</option>
                <option value="RESERVED">예약중</option>
                <option value="SOLD">판매완료</option>
              </StyledSelect>
              {errors.status && <FieldError role="alert">{errors.status.message}</FieldError>}
            </FieldWrapper>
          )}

          {/* Title */}
          <FieldWrapper>
            <FieldInput
              type="text"
              placeholder="물품명"
              hasError={!!errors.title}
              {...register('title', { required: '물품명을 입력해주세요' })}
            />
            {errors.title && <FieldError role="alert">{errors.title.message}</FieldError>}
          </FieldWrapper>

          {/* Category */}
          <FieldWrapper>
            <StyledSelect
              hasError={!!errors.categoryCode}
              defaultValue=""
              {...register('categoryCode', { required: '카테고리를 선택해주세요' })}
            >
              <option value="" disabled>
                카테고리 선택
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.label}
                </option>
              ))}
            </StyledSelect>
            {errors.categoryCode && (
              <FieldError role="alert">{errors.categoryCode.message}</FieldError>
            )}
          </FieldWrapper>

          {/* Price */}
          <FieldWrapper>
            <PriceRow>
              <FieldInput
                type="text"
                inputMode="numeric"
                placeholder="가격"
                hasError={!!errors.price}
                style={{ flex: 1 }}
                {...register('price', {
                  required: '가격을 입력해주세요',
                  pattern: { value: /^[0-9,]+$/, message: '숫자만 입력해주세요' },
                })}
              />
              <PriceUnit>원</PriceUnit>
            </PriceRow>
            {errors.price && <FieldError role="alert">{errors.price.message}</FieldError>}
          </FieldWrapper>

          {/* Description */}
          <FieldWrapper>
            <TextArea
              placeholder="물품에 대한 상세한 설명을 적어주세요"
              hasError={!!errors.description}
              {...register('description', { required: '상품 설명을 입력해주세요' })}
            />
            {errors.description && (
              <FieldError role="alert">{errors.description.message}</FieldError>
            )}
          </FieldWrapper>

          {serverError && (
            <FieldError role="alert" style={{ textAlign: 'center', fontSize: '13px' }}>
              {serverError}
            </FieldError>
          )}
        </Section>

        {/* Location Picker */}
        <LocationRow type="button" onClick={handleLocationClick} aria-label="거래 희망 장소 추가">
          <MapPinIcon />
          <LocationText>거래 희망 장소 추가</LocationText>
        </LocationRow>
      </Content>

      <BottomBar>
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          loading={currentMutation.isPending}
          disabled={currentMutation.isPending}
          onClick={handleSubmit(onSubmit)}
        >
          등록하기
        </Button>
      </BottomBar>
    </Page>
  );
};

export default ItemRegistrationForm;
