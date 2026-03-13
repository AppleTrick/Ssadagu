'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { ItemRegistrationForm } from '@/features/create-product';
import { getProduct } from '@/entities/product';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography } from '@/shared/styles/theme';

export function ProductEditPage() {
  const params = useParams();
  const productId = Number(params.id);
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId, accessToken ?? undefined),
    enabled: !isNaN(productId),
  });

  if (isLoading) {
    return <LoadingWrapper>불러오는 중...</LoadingWrapper>;
  }

  if (isError || !data) {
    return <ErrorWrapper>상품 정보를 불러오지 못했습니다.</ErrorWrapper>;
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
