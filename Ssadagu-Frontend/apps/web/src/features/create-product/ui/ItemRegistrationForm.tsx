'use client';

import { useState, useEffect, useRef } from 'react';
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
import { LocationPicker } from '@/features/location-picker';
import type { ProductDetail } from '@/entities/product';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/entities/user';
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
  { code: 'ELEC', label: '전자기기' },
  { code: 'CLOT', label: '의류' },
  { code: 'BOOK', label: '도서' },
  { code: 'FURN', label: '가구/인테리어' },
  { code: 'SPOR', label: '스포츠/레저' },
  { code: 'BEAU', label: '뷰티/미용' },
  { code: 'FOOD', label: '식품' },
  { code: 'KID', label: '유아동' },
  { code: 'HOBB', label: '취미/게임' },
  { code: 'ETC', label: '기타' },
];

/* ── Utilities ──────────────────────────────────────────── */

const compressImage = (file: File, maxWidth = 1024, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context is null'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Canvas to Blob failed'));
            const newFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          file.type || 'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image loop failed'));
    };
    reader.onerror = () => reject(new Error('File read error'));
  });
};

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

const PhotoPreviewBox = styled.div`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: ${radius.md};
  position: relative;
  background-color: ${colors.bg};
  overflow: hidden;
  border: 1px solid ${colors.border};
`;

const DeleteBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  padding: 0;
  svg {
    width: 14px;
    height: 14px;
  }
`;

/* ── Field Components ───────────────────────────────────── */

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
`;

const Label = styled.label`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.semibold};
  color: ${colors.textSecondary};
`;

const FieldInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  color: ${colors.textPrimary};
  background: ${colors.surface};
  border: 1px solid ${({ hasError }) => (hasError ? colors.red : colors.border)};
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
  background: ${colors.surface};
  border: 1px solid ${({ hasError }) => (hasError ? colors.red : colors.border)};
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
  background: ${colors.surface};
  border: 1px solid ${({ hasError }) => (hasError ? colors.red : colors.border)};
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
  padding: 16px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  cursor: pointer;
  width: 100%;
  text-align: left;
  margin-top: 8px;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviews, setImagePreviews] = useState<{ id?: number; url: string; file?: File }[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: myProfile } = useQuery<User>({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.USERS.ME, accessToken ?? undefined);
      if (!res.ok) throw new Error('프로필을 불러오지 못했습니다.');
      const json = await res.json() as any;
      if (json.data) return json.data as User;
      return json as User;
    },
    enabled: !!accessToken,
  });

  const isEdit = !!productId;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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

  const selectedRegion = watch('regionName');
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        categoryCode: initialData.categoryCode,
        price: initialData.price?.toString() || '',
        description: initialData.description,
        regionName: initialData.regionName,
        status: initialData.status,
      });
      if (initialData.images && initialData.images.length > 0) {
        setImagePreviews(
          [...initialData.images]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((img) => ({ id: img.id, url: img.imageUrl }))
        );
      }
    }
  }, [initialData, reset]);

  const handlePhotoAdd = () => {
    if (imagePreviews.length >= 5) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 5 - imagePreviews.length;
    const filesToProcess = files.slice(0, remainingSlots);

    try {
      const compressedFiles = await Promise.all(
        filesToProcess.map((file) => compressImage(file))
      );

      const newPreviews = compressedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      }));

      setImagePreviews((prev) => [...prev, ...newPreviews]);
    } catch (err) {
      console.error('이미지 처리 중 오류 발생', err);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocationClick = () => {
    setIsLocationPickerOpen(true);
  };

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(productId || 0);
  const currentMutation = isEdit ? updateMutation : createMutation;

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const imagesToUpload = imagePreviews.filter((p) => p.file).map((p) => p.file as File);
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          title: data.title,
          categoryCode: data.categoryCode,
          price: Number(data.price.replace(/[^0-9]/g, '')),
          description: data.description,
          regionName: data.regionName || '미설정',
          status: (data.status as any) || 'ON_SALE',
          images: imagesToUpload,
        });
        router.replace(`/products/${productId}`);
      } else {
        const result = await createMutation.mutateAsync({
          sellerId: myProfile?.id || 0,
          title: data.title,
          categoryCode: data.categoryCode,
          price: Number(data.price.replace(/[^0-9]/g, '')),
          description: data.description,
          regionName: data.regionName || '미설정',
          images: imagesToUpload,
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
            <PhotoCount>{imagePreviews.length}/5</PhotoCount>
          </PhotoBox>
          {imagePreviews.map((preview, i) => (
            <PhotoPreviewBox key={preview.url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt={`preview-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <DeleteBtn type="button" onClick={() => handleRemoveImage(i)}>
                <CloseIcon />
              </DeleteBtn>
            </PhotoPreviewBox>
          ))}
        </PhotoRow>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

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
            <Label>물품명</Label>
            <FieldInput
              type="text"
              hasError={!!errors.title}
              {...register('title', { required: '물품명을 입력해주세요' })}
            />
            {errors.title && <FieldError role="alert">{errors.title.message}</FieldError>}
          </FieldWrapper>

          {/* Category */}
          <FieldWrapper>
            <Label>카테고리 선택</Label>
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
            <Label>가격 (원)</Label>
            <PriceRow>
              <FieldInput
                type="text"
                inputMode="numeric"
                hasError={!!errors.price}
                style={{ flex: 1 }}
                {...register('price', {
                  required: '가격을 입력해주세요',
                  pattern: { value: /^[0-9,]+$/, message: '숫자만 입력해주세요' },
                })}
              />
            </PriceRow>
            {errors.price && <FieldError role="alert">{errors.price.message}</FieldError>}
          </FieldWrapper>

          {/* Description */}
          <FieldWrapper>
            <Label>상세 설명</Label>
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

          {/* Location Picker */}
          <LocationRow type="button" onClick={handleLocationClick} aria-label="거래 희망 장소 추가">
            <MapPinIcon />
            <LocationText>{selectedRegion ? selectedRegion : '거래 희망 장소 추가'}</LocationText>
          </LocationRow>
        </Section>
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

      {/* Location Picker Overlay */}
      {isLocationPickerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: colors.surface,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Header>
            <BackButton type="button" onClick={() => setIsLocationPickerOpen(false)} aria-label="닫기">
              <CloseIcon />
            </BackButton>
            <HeaderTitle>거래 희망 장소 선택</HeaderTitle>
          </Header>
          <div style={{ flex: 1, paddingTop: HEADER_HEIGHT }}>
            <LocationPicker
              onSelect={(regionName) => {
                setValue('regionName', regionName, { shouldValidate: true, shouldDirty: true });
                setIsLocationPickerOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </Page>
  );
};

export default ItemRegistrationForm;
