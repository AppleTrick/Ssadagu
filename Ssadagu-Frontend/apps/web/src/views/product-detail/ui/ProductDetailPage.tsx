'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { ImageCarousel } from '@/shared/ui';
import { SellerCard, ItemDetailBottomBar, getProduct } from '@/entities/product';
import { useDeleteProduct } from '@/features/create-product';
import type { ProductDetail } from '@/entities/product';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT } from '@/shared/styles/theme';

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
  padding: 0 20px;
  border-bottom: 1px solid ${colors.border};
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

const statusLabel: Record<string, string> = { ON_SALE: '판매중', RESERVED: '예약중', SOLD: '판매완료' };

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
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const productId = Number(rawId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [isWished, setIsWished] = useState(false);

  const { data: product, isLoading, isError, refetch } = useQuery<ProductDetail>({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId, accessToken ?? undefined),
    enabled: !isNaN(productId),
  });

  useEffect(() => {
    // Note: ProductDetail에는 isWished가 없으므로 API 변경 전까지는 false로 유지하거나
    // wishCount 등을 활용한 추측이 필요함. 여기서는 API 스펙을 우선함.
  }, [product]);

  const wishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(
        ENDPOINTS.PRODUCTS.WISH(productId),
        {},
        accessToken ?? undefined,
      );
      if (!res.ok) throw new Error('찜 실패');
      const json = await res.json() as { data?: { isWished: boolean } };
      return json.data?.isWished ?? !isWished;
    },
    onSuccess: (newWished) => {
      setIsWished(newWished);
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(
        ENDPOINTS.CHATS.CREATE,
        { productId },
        accessToken ?? undefined,
      );
      if (!res.ok) throw new Error('채팅방 생성 실패');
      const json = await res.json() as { data?: { id: number } };
      return json.data?.id;
    },
    onSuccess: (roomId) => {
      if (roomId) router.push(`/chat/${roomId}`);
    },
  });

  const deleteMutation = useDeleteProduct();

  const handleDelete = async () => {
    if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    
    try {
      await deleteMutation.mutateAsync(productId);
      router.replace('/home');
    } catch (err: any) {
      alert(err.message || '삭제에 실패했습니다.');
    }
  };

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
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: colors.textPrimary, padding: '4px' }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  return (
    <Page>
      <HeaderBack title="상품 상세" onBack={() => router.back()} rightElement={shareButton} />
      <ContentArea>
        {isLoading && <LoadingWrapper aria-live="polite" aria-busy="true">불러오는 중...</LoadingWrapper>}
        {isError && (
          <ErrorWrapper>
            <span>상품 정보를 불러오지 못했습니다.</span>
            <TextButton onClick={() => refetch()}>다시 시도</TextButton>
            <TextButton onClick={() => router.back()}>돌아가기</TextButton>
          </ErrorWrapper>
        )}
        {!isLoading && !isError && product && (
          <>
            {/* API에서 이미지를 제공하지 않으므로 플레이스홀더 처리 */}
            <div style={{ width: '100%', height: '300px', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary }}>
              이미지가 없습니다
            </div>
            <SellerSection>
              {/* API에서 닉네임을 제공하지 않으므로 판매자 ID로 표시 */}
              <SellerCard sellerId={product.sellerId} sellerNickname={`판매자 ${product.sellerId}`} />
            </SellerSection>
            <InfoSection>
              <StatusBadge $status={product.status}>
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
                {product.price.toLocaleString('ko-KR')}원
              </ProductTitle>
              <ProductDescription>{product.description}</ProductDescription>
            </InfoSection>

            {/* 거래 희망 장소 */}
            <MapSection>
              <MapTitle>거래 희망 장소</MapTitle>
              <KakaoMap regionName={product.regionName} />
              <MapLocationText>📍 {product.regionName}</MapLocationText>
            </MapSection>

            <ItemDetailBottomBar
              product={product as any}
              isMine={product.sellerId === 1} // Mock: sellerId가 1이면 내 상품으로 간주
              isWished={isWished}
              onWish={() => wishMutation.mutate()}
              onChat={() => chatMutation.mutate()}
              onEdit={() => router.push(`/products/${productId}/edit`)}
              onDelete={handleDelete}
              bottomOffset={0}
            />
          </>
        )}
      </ContentArea>
    </Page>
  );
}
