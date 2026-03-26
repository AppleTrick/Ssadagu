'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { ImageCarousel, FadeIn } from '@/shared/ui';
import { SellerCard, ItemDetailBottomBar, getProduct, ProductDetailSkeleton } from '@/entities/product';
import { useMyProfile } from '@/entities/user';
import { useDeleteProduct } from '@/features/create-product';
import type { ProductDetail } from '@/entities/product';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { useModalStore } from '@/shared/hooks/useModalStore';
import { colors, typography, HEADER_HEIGHT } from '@/shared/styles/theme';
import type { User } from '@/entities/user';

interface UserResponse {
  data?: User;
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: ${colors.surface};
  position: relative;
`;

const ContentArea = styled.main`
  flex: 1;
  padding-top: ${HEADER_HEIGHT}px;
  padding-bottom: 90px;
  overflow-y: auto;
  overflow-x: hidden;
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
  white-space: pre-line;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 12px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;

const SellerSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MapSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${colors.border};
`;

const MapTitle = styled.h3`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.semibold};
  color: ${colors.textPrimary};
  margin: 0 0 12px;
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 180px;
  background: ${colors.bg};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${colors.textSecondary};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  border: 1px solid ${colors.border};
`;

const MapKakao = styled.div`
  width: 100%;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${colors.border};
`;

const MapLocationText = styled.p`
  margin: 8px 0 0;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  font-weight: ${typography.weight.medium};
  background: ${({ $status }) => {
    if ($status === 'ON_SALE') return '#E8F4FF';
    if ($status === 'RESERVED') return '#FFF8E1';
    return colors.bg;
  }};
  color: ${({ $status }) => {
    if ($status === 'ON_SALE') return colors.primary;
    if ($status === 'RESERVED') return '#F59E0B';
    return colors.textSecondary;
  }};
`;

const LoadingWrapper = styled.div`
  display: flex; align-items: center; justify-content: center; height: 300px;
  font-family: ${typography.fontFamily}; font-size: ${typography.size.base}; color: ${colors.textSecondary};
`;

const ErrorWrapper = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 12px;
  font-family: ${typography.fontFamily}; font-size: ${typography.size.base}; color: ${colors.textSecondary};
`;

const TextButton = styled.button`
  font-family: ${typography.fontFamily}; font-size: ${typography.size.sm}; color: ${colors.primary};
  background: none; border: none; cursor: pointer; text-decoration: underline;
`;

const HeaderIconButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: ${colors.textPrimary};
  &:active {
    background: ${colors.bg};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-top: 8px;
  min-width: 120px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DropdownItem = styled.button<{ $danger?: boolean }>`
  background: none;
  border: none;
  padding: 12px 16px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${({ $danger }) => ($danger ? colors.red : colors.textPrimary)};
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  width: 100%;

  &:active {
    background: ${colors.bg};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${colors.border};
  }
`;

const statusLabel: Record<string, string> = { ON_SALE: '판매중', RESERVED: '판매중', SOLD: '거래완료' };

// 카카오맵 컴포넌트
function KakaoMap({ regionName }: { regionName: string }) {
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  const mapId = 'kakao-map-container';

  useEffect(() => {
    if (!apiKey || typeof window === 'undefined') return;

    const initMap = () => {
      const kakao = (window as unknown as { kakao?: { maps?: { Map?: unknown; services?: { Geocoder?: unknown } } } }).kakao;
      if (!kakao?.maps) return;
      const maps = kakao.maps as {
        Map: new (el: HTMLElement | null, opts: object) => object;
        LatLng: new (lat: number, lng: number) => object;
        Marker: new (opts: object) => { setMap: (m: object) => void };
        services: { Geocoder: new () => { addressSearch: (addr: string, cb: (result: Array<{ y: string; x: string }>, status: string) => void) => void }; Status: { OK: string } };
      };
      const geocoder = new maps.services.Geocoder();
      geocoder.addressSearch(regionName, (result, status) => {
        if (status !== maps.services.Status.OK || !result[0]) return;
        const coords = new maps.LatLng(Number(result[0].y), Number(result[0].x));
        const container = document.getElementById(mapId);
        const map = new maps.Map(container, { center: coords, level: 4 });
        const marker = new maps.Marker({ position: coords });
        marker.setMap(map as object);
      });
    };

    if ((window as unknown as { kakao?: object }).kakao) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
      script.onload = () => {
        const k = (window as unknown as { kakao: { maps: { load: (cb: () => void) => void } } }).kakao;
        k.maps.load(initMap);
      };
      document.head.appendChild(script);
    }
  }, [regionName, apiKey]);

  if (!apiKey) {
    return (
      <MapPlaceholder>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        <span>{regionName}</span>
        <span style={{ fontSize: '11px' }}>지도를 표시하려면 카카오 API 키가 필요합니다</span>
      </MapPlaceholder>
    );
  }

  return <MapKakao id={mapId} />;
}

export function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawId = params ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;
  const productId = Number(rawId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const { alert: modalAlert, confirm: modalConfirm } = useModalStore();
  const [isWished, setIsWished] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleCloseMenu = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      window.addEventListener('click', handleCloseMenu);
    }
    return () => window.removeEventListener('click', handleCloseMenu);
  }, [isMenuOpen]);

  const { data: product, isLoading, isError, refetch } = useQuery<ProductDetail>({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId, accessToken ?? undefined),
    enabled: !isNaN(productId),
  });

  const { data: myProfile } = useMyProfile();

  useEffect(() => {
    if (product) {
      setIsWished((product as any).isLiked ?? false);
    }
  }, [product]);

  const wishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(
        ENDPOINTS.PRODUCTS.WISH(productId),
        {},
        accessToken ?? undefined,
      );
      if (!res.ok) throw new Error('찜 실패');
      return !isWished;
    },
    onMutate: async () => {
      // 낙관적 업데이트: 즉시 UI 변경
      setIsWished(!isWished);
    },
    onSuccess: () => {
      // 서버와 동기화
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
    onError: () => {
      // 실패 시 롤백
      setIsWished(isWished);
    },
  });

  const handleChatClick = () => {
    router.push(`/chat/new?productId=${productId}`);
  };

  const deleteMutation = useDeleteProduct();

  const handleDelete = async () => {
    const isConfirmed = await modalConfirm({
      title: '삭제 확인',
      message: '정말 이 상품을 삭제하시겠습니까?',
      variant: 'danger',
    });
    
    if (!isConfirmed) return;
    
    try {
      await deleteMutation.mutateAsync(productId);
      router.replace('/home');
    } catch (err: any) {
      modalAlert({ message: err.message || '삭제에 실패했습니다.' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        modalAlert({ message: '링크가 복사되었습니다.' });
      });
    }
  };

  const headerRight = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
      <HeaderIconButton onClick={handleShare} aria-label="공유">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
        </svg>
      </HeaderIconButton>
      {product?.isMine && (
        <>
          <HeaderIconButton 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} 
            aria-label="메뉴"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="6" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="18" r="1" fill="currentColor" />
            </svg>
          </HeaderIconButton>
          {isMenuOpen && (
            <DropdownMenu>
              <DropdownItem onClick={() => { setIsMenuOpen(false); router.push(`/products/${productId}/edit`); }}>
                수정하기
              </DropdownItem>
              <DropdownItem $danger onClick={() => { setIsMenuOpen(false); handleDelete(); }}>
                삭제하기
              </DropdownItem>
            </DropdownMenu>
          )}
        </>
      )}
    </div>
  );

  return (
    <Page>
      <HeaderBack title="상품 상세" onBack={() => router.back()} rightElement={headerRight} />
      <ContentArea>
        {isLoading && <ProductDetailSkeleton />}
        {isError && (
          <ErrorWrapper>
            <span>상품 정보를 불러오지 못했습니다.</span>
            <TextButton onClick={() => refetch()}>다시 시도</TextButton>
            <TextButton onClick={() => router.back()}>돌아가기</TextButton>
          </ErrorWrapper>
        )}
        {!isLoading && !isError && product && (
          <FadeIn>
            {product.images && product.images.length > 0 ? (
              <ImageCarousel images={product.images.map(img => img.imageUrl)} />
            ) : (
              <div style={{ width: '100%', height: '300px', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary }}>
                이미지가 없습니다
              </div>
            )}
            <SellerSection>
              <SellerCard 
                sellerId={product.sellerId} 
                sellerNickname={product.sellerNickname || `판매자 ${product.sellerId}`} 
                sellerProfileImageUrl={product.sellerProfileImageUrl}
              />
              <StatusBadge $status={product.status}>
                {statusLabel[product.status] ?? product.status}
              </StatusBadge>
            </SellerSection>
            <InfoSection>
              <ProductTitle>{product.title}</ProductTitle>
              <MetaRow>
                <span>{product.regionName}</span>
              </MetaRow>
              <ProductTitle as="p" style={{ fontSize: '20px', fontWeight: 700 }}>
                {product.price.toLocaleString('ko-KR')}원
              </ProductTitle>
              <ProductDescription>{product.description}</ProductDescription>
            </InfoSection>

            {/* 거래 희망 장소 */}
            <MapSection>
              <MapTitle>거래 희망 장소</MapTitle>
              <KakaoMap regionName={product.regionName} />
              <MapLocationText>📍 {product.regionName}</MapLocationText>
              <MetaRow style={{ marginTop: '16px' }}>
                <span>관심 {product.wishCount}</span>
                <span>·</span>
                {/* <span>채팅 {product.chatCount}</span> */}
              </MetaRow>
            </MapSection>

          </FadeIn>
        )}
      </ContentArea>
      {product && (
        <ItemDetailBottomBar
          product={product as any}
          isMine={product.isMine ?? false}
          isWished={isWished}
          onWish={() => wishMutation.mutate()}
          onChat={handleChatClick}
          onEdit={() => router.push(`/products/${productId}/edit`)}
          onDelete={handleDelete}
          bottomOffset={0}
        />
      )}
    </Page>
  );
}
