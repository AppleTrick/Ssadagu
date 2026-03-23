'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { ItemRegistrationForm } from '@/features/create-product';
import { getProduct } from '@/entities/product';
import { useMyProfile, type User } from '@/entities/user';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography } from '@/shared/styles/theme';
import { useModalStore } from '@/shared/hooks/useModalStore';

interface UserResponse {
  data?: User;
}

export function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params && params.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  const productId = Number(rawId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const { alert: showAlert } = useModalStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId, accessToken ?? undefined),
    enabled: !isNaN(productId),
  });

  const { data: myProfile, isLoading: isProfileLoading } = useMyProfile();

  useEffect(() => {
    const checkPermission = async () => {
      if (data && myProfile && data.sellerId !== myProfile.id) {
        await showAlert({ message: '본인의 게시물만 수정할 수 있습니다.' });
        router.replace(`/products/${productId}`);
      }
    };
    checkPermission();
  }, [data, myProfile, router, productId, showAlert]);

  if (isLoading || isProfileLoading) {
    return <LoadingWrapper>불러오는 중...</LoadingWrapper>;
  }

  if (isError || !data || data.sellerId !== myProfile?.id) {
    return <ErrorWrapper>접근 권한이 없거나 상품 정보를 불러오지 못했습니다.</ErrorWrapper>;
  }

  return <ItemRegistrationForm productId={productId} initialData={data} />;
}

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  font-family: ${typography.fontFamily};
  color: ${colors.textSecondary};
`;

const ErrorWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  font-family: ${typography.fontFamily};
  color: ${colors.red};
`;
