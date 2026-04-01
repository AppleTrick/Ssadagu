'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { getUserWishes } from '@/entities/product/api/getUserWishes';
import { getUserMe } from '@/entities/user/api/getUserMe';
import type { WishItem } from '@/entities/product';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT } from '@/shared/styles/theme';
import { ProductListSkeleton } from '@/entities/product';
import { FadeIn } from '@/shared/ui';
import { getProxyImageUrl } from '@/shared/utils';

/* ── Styled ─────────────────────────────────────────────── */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: ${colors.bg};
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
`;

const ListWrapper = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  background: ${colors.surface};
`;

const WishCard = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
  cursor: pointer;
  &:active {
    background: ${colors.bg};
  }
`;

const Thumbnail = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: ${colors.bg};
`;

const ThumbnailImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${colors.bg};
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.p`
  margin: 0;
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Region = styled.p`
  margin: 0;
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;

const Price = styled.p`
  margin: 0;
  font-size: ${typography.size.md};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
`;

const CenterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 8px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const RetryButton = styled.button`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.primary};
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
`;

/* ── Utils ───────────────────────────────────────────────── */

const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';

/* ── Component ───────────────────────────────────────────── */

export function MyWishlistPage() {
  const router = useRouter();
  const { accessToken, userId } = useAuthStore();

  // 해당 사용자의 관심 목록 조회
  const { data, isLoading, isError, refetch } = useQuery<WishItem[]>({
    queryKey: ['userWishes', userId],
    queryFn: () => {
      if (!userId) throw new Error('계정 정보가 없습니다.');
      return getUserWishes(userId, accessToken ?? undefined);
    },
    enabled: !!accessToken && !!userId,
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <Page>
      <HeaderBack title="나의 관심 목록" onBack={() => router.back()} />
      <ContentArea>
        {isLoading && <ProductListSkeleton count={5} size={80} />}

        {isError && (
          <CenterWrapper>
            <span>관심 목록을 불러오지 못했습니다.</span>
            <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
          </CenterWrapper>
        )}

        {!isLoading && !isError && (
          <FadeIn>
            {data && data.length > 0 ? (
              <ListWrapper>
                {data.map((wish) => (
                  <WishCard
                    key={wish.id}
                    onClick={() => router.push(`/products/${wish.productId}`)}
                  >
                    <Thumbnail>
                      {wish.thumbnailUrl ? (
                        <ThumbnailImg
                          src={getProxyImageUrl(wish.thumbnailUrl)}
                          alt={wish.productTitle}
                        />
                      ) : (
                        <ThumbnailPlaceholder />
                      )}
                    </Thumbnail>
                    <Info>
                      <Title>{wish.productTitle}</Title>
                      <Region>{wish.regionName}</Region>
                      <Price>{formatPrice(wish.productPrice)}</Price>
                    </Info>
                  </WishCard>
                ))}
              </ListWrapper>
            ) : (
              <CenterWrapper>관심 목록이 없습니다.</CenterWrapper>
            )}
          </FadeIn>
        )}
      </ContentArea>
    </Page>
  );
}
