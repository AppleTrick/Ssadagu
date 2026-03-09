'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { ImageCarousel } from '@/shared/ui';
import { ItemCard, SellerCard, ItemDetailBottomBar } from '@/entities/product';
import type { Product } from '@/entities/product';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT } from '@/shared/styles/theme';

/* ── Styled ─────────────────────────────────────────────── */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${colors.surface};
`;

const ContentArea = styled.main`
  flex: 1;
  padding-top: ${HEADER_HEIGHT}px;
  padding-bottom: 90px;
  overflow-y: auto;
`;

const InfoSection = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid ${colors.border};
`;

const ProductTitle = styled.h1`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xl};
  font-weight: ${typography.weight.semibold};
  color: ${colors.textPrimary};
  line-height: 1.4;
`;

const ProductDescription = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
  line-height: 1.7;
  word-break: keep-all;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 12px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;

const SellerSection = styled.div`
  padding: 0 20px;
  border-bottom: 1px solid ${colors.border};
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  font-weight: ${typography.weight.medium};
  background: ${({ status }) => {
    if (status === 'ON_SALE') return '#E8F4FF';
    if (status === 'RESERVED') return '#FFF8E1';
    if (status === 'SOLD') return colors.bg;
    return colors.bg;
  }};
  color: ${({ status }) => {
    if (status === 'ON_SALE') return colors.primary;
    if (status === 'RESERVED') return '#F59E0B';
    if (status === 'SOLD') return colors.textSecondary;
    return colors.textSecondary;
  }};
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 12px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const BackLink = styled.button`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.primary};
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
`;

/* ── Share Icon ─────────────────────────────────────────── */

const ShareIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ── Helpers ────────────────────────────────────────────── */

const statusLabel: Record<string, string> = {
  ON_SALE: '판매중',
  RESERVED: '예약중',
  SOLD: '판매완료',
};

const formatPrice = (price: number) =>
  price.toLocaleString('ko-KR') + '원';

/* ── Component ───────────────────────────────────────────── */

interface ProductDetailResponse {
  data?: Product;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const productId = Number(rawId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentUserId = useAuthStore((s) => s.accessToken ? -1 : -1); // will be replaced with real user id when profile is fetched

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await apiClient.get(
        ENDPOINTS.PRODUCTS.DETAIL(productId),
        accessToken ?? undefined,
      );
      if (!res.ok) throw new Error('상품 정보를 불러오지 못했습니다.');
      const json = await res.json() as Product | ProductDetailResponse;
      if ((json as ProductDetailResponse).data) return (json as ProductDetailResponse).data as Product;
      return json as Product;
    },
    enabled: !isNaN(productId),
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert('링크가 복사되었습니다.'));
    }
  };

  const shareButton = (
    <button
      onClick={handleShare}
      aria-label="공유"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        color: colors.textPrimary,
        padding: '4px',
      }}
    >
      <ShareIcon />
    </button>
  );

  return (
    <Page>
      <HeaderBack
        title="상품 상세"
        onBack={() => router.back()}
        rightElement={shareButton}
      />

      <ContentArea>
        {isLoading && (
          <LoadingWrapper aria-live="polite" aria-busy="true">
            불러오는 중...
          </LoadingWrapper>
        )}

        {isError && (
          <ErrorWrapper>
            <span>상품 정보를 불러오지 못했습니다.</span>
            <BackLink onClick={() => refetch()}>다시 시도</BackLink>
            <BackLink onClick={() => router.back()}>돌아가기</BackLink>
          </ErrorWrapper>
        )}

        {!isLoading && !isError && product && (
          <>
            <ImageCarousel
              images={product.images.map((img) => img.imageUrl)}
              height="300px"
            />

            <SellerSection>
              <SellerCard
                sellerId={product.sellerId}
                sellerNickname={product.sellerNickname}
              />
            </SellerSection>

            <InfoSection>
              <StatusBadge status={product.status}>
                {statusLabel[product.status] ?? product.status}
              </StatusBadge>
              <ProductTitle>{product.title}</ProductTitle>
              <MetaRow>
                <span>{product.regionName}</span>
                <span>·</span>
                <span>관심 {product.wishCount}</span>
                <span>·</span>
                <span>채팅 {product.chatCount}</span>
              </MetaRow>
              <ProductTitle as="p" style={{ fontSize: '20px', fontWeight: 700 }}>
                {formatPrice(product.price)}
              </ProductTitle>
              <ProductDescription>{product.description}</ProductDescription>
            </InfoSection>

            <ItemDetailBottomBar
              product={product}
              isMine={false}
            />
          </>
        )}
      </ContentArea>
    </Page>
  );
}
