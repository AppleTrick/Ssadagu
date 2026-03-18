'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { ItemRegistrationForm } from '@/features/create-product';
import { getProduct } from '@/entities/product';
import type { User } from '@/entities/user';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography } from '@/shared/styles/theme';

interface UserResponse {
  data?: User;
}

export function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId, accessToken ?? undefined),
    enabled: !isNaN(productId),
  });

  const { data: myProfile, isLoading: isProfileLoading } = useQuery<User>({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.USERS.PROFILE(userId!), accessToken ?? undefined);
      if (!res.ok) throw new Error('프로필을 불러오지 못했습니다.');
      const json = await res.json() as User | UserResponse;
      if ((json as UserResponse).data) return (json as UserResponse).data as User;
      return json as User;
    },
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (data && myProfile && data.sellerId !== myProfile.id) {
      alert('본인의 게시물만 수정할 수 있습니다.');
      router.replace(`/products/${productId}`);
    }
  }, [data, myProfile, router, productId]);

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
