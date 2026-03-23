'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ChatRoom } from '../model/types';

/**
 * 채팅방 데이터를 FSD 구조에 맞게 매핑해주는 유틸리티
 */
export const mapToChatRoomDetail = (d: any, userId: number | null, fallbackNickname: string = ''): ChatRoom => {
  const product = d.product || d.productResponseDto || {};
  const partner = d.partner || d.partnerResponseDto || {};

  const productTitle = product.title || product.productName || d.productTitle || d.title || '상품 정보 없음';
  const productPrice = product.price || product.amount || d.productPrice || d.price || 0;
  const finalImageUrl = product.images && product.images.length > 0 ? product.images[0].imageUrl : (d.images && d.images.length > 0 ? d.images[0].imageUrl : null);
  const productThumbnailUrl = finalImageUrl || product.productThumbnailUrl || product.thumbnailUrl || product.imageUrl || product.image || d.productThumbnailUrl || d.thumbnailUrl || d.productImageUrl || d.imageUrl || d.image || null;
  const productStatus = product.status || d.productStatus || d.status || 'ACTIVE';

  const effectivePartnerId = partner.userId || partner.id || d.partnerId || d.targetId || -1;
  const productSellerId = product.sellerId || product.userId || d.sellerId || d.ownerId || d.adminId;
  const productBuyerId = d.buyerId || d.customerId;

  const currentUserId = userId ? Number(userId) : null;
  const sellerIdAsNum = productSellerId ? Number(productSellerId) : null;
  const buyerIdAsNum = productBuyerId ? Number(productBuyerId) : null;

  let finalBuyerId = buyerIdAsNum;
  let finalSellerId = sellerIdAsNum;

  // 1순위: 판매자 ID와 내 ID 비교
  if (currentUserId && sellerIdAsNum && currentUserId === sellerIdAsNum) {
    finalSellerId = currentUserId;
    finalBuyerId = Number(effectivePartnerId);
  } else if (currentUserId && sellerIdAsNum && currentUserId !== sellerIdAsNum) {
    finalBuyerId = currentUserId;
    finalSellerId = sellerIdAsNum;
  } 
  // 2순위: myRole 필드 확인
  else if (d.myRole === 'BUYER') {
    finalBuyerId = currentUserId || -1;
    finalSellerId = Number(effectivePartnerId);
  } else if (d.myRole === 'SELLER') {
    finalSellerId = currentUserId || -1;
    finalBuyerId = Number(effectivePartnerId);
  }
  // 3순위: 그래도 모르면 partner가 아닌 쪽을 나로 가정
  else {
    finalBuyerId = buyerIdAsNum || (currentUserId === Number(effectivePartnerId) ? -1 : currentUserId || -1);
    finalSellerId = sellerIdAsNum || (currentUserId === Number(effectivePartnerId) ? -1 : currentUserId || -1);
  }

  return {
    id: d.roomId || d.id,
    productId: product.productId || product.id || d.productId || d.id,
    productTitle,
    productThumbnailUrl,
    productPrice,
    productStatus,
    partnerId: Number(effectivePartnerId),
    partnerNickname: partner.nickname || d.partnerNickname || d.targetNickname || '알 수 없음',
    lastMessage: d.lastMessage,
    lastSentAt: d.lastSentAt,
    roomStatus: d.roomStatus || 'ACTIVE',
    buyerId: Number(finalBuyerId ?? -1),
    buyerNickname: (currentUserId && Number(finalBuyerId) === currentUserId) ? fallbackNickname : (d.buyerNickname || partner.nickname || ''),
    sellerId: Number(finalSellerId ?? -1),
    sellerNickname: (currentUserId && Number(finalSellerId) === currentUserId) ? fallbackNickname : (d.sellerNickname || partner.nickname || ''),
    unreadCount: d.unreadCount ?? 0,
  } as ChatRoom;
};

/**
 * 기존 채팅방 상세 조회 훅 (엔터티 계층)
 */
export function useChatRoomDetail(roomId: number, userId: number | null, accessToken: string | null) {
  return useQuery<ChatRoom>({
    queryKey: ['chatRoom', roomId, userId],
    queryFn: async () => {
      const res = await apiClient.get(`${ENDPOINTS.CHATS.DETAIL(roomId)}?userId=${userId}`, accessToken ?? undefined);
      if (!res.ok) throw new Error('채팅방 정보를 불러오지 못했습니다.');
      const json: any = await res.json();
      const d = json.data || json.response || json.result || json;
      const mapped = mapToChatRoomDetail(d, userId);

      // 백엔드 채팅방 상세 API에서 사진을 아예 주지 않을 경우 대비 폴백 패치
      if (!mapped.productThumbnailUrl && mapped.productId > 0) {
         try {
           const prodRes = await apiClient.get(ENDPOINTS.PRODUCTS.DETAIL(mapped.productId), accessToken ?? undefined);
           if (prodRes.ok) {
             const prodJson: any = await prodRes.json();
             const prod = prodJson.data || prodJson;
             const finalImageUrl = (prod.images && prod.images.length > 0) ? prod.images[0].imageUrl : (prod.imageUrl || prod.thumbnailUrl || null);
             if (finalImageUrl) {
                mapped.productThumbnailUrl = finalImageUrl;
             }
           }
         } catch (e) {
           console.warn('상품 썸네일 폴백 조회 실패', e);
         }
      }
      return mapped;
    },
    enabled: roomId > 0 && !!userId && !!accessToken,
  });
}

/**
 * 신규 진입 시 기존 방이 있는지 확인하거나 상품 정보를 조회하는 훅
 */
export function useNewChatRoomInit(productId: number, userId: number | null, accessToken: string | null, userNickname: string = '') {
  return useQuery<ChatRoom>({
    queryKey: ['newChatRoomInit', productId, userId],
    queryFn: async () => {
      // 1. 상품 정보 가져오기
      const prodRes = await apiClient.get(ENDPOINTS.PRODUCTS.DETAIL(productId), accessToken ?? undefined);
      if (!prodRes.ok) throw new Error('상품 정보를 불러오지 못했습니다.');
      const prodJson = await prodRes.json() as any;
      const prod = prodJson.data || prodJson;

      // 2. 채팅방 생성 또는 조회 시도 (기존 방 확인용)
      try {
        const chatRes = await apiClient.post(ENDPOINTS.CHATS.CREATE, { productId }, accessToken ?? undefined);
        if (chatRes.ok) {
           const chatJson = await chatRes.json() as any;
           const chatData = chatJson.data || chatJson;
           if (chatData.roomId || chatData.id) {
              return mapToChatRoomDetail({
                 ...chatData,
                 product: prod, // 상세 정보를 섞어줌
              }, userId, userNickname);
           }
        }
      } catch (e) {
        console.warn('기존 채팅방 조회 실패, 신규 생성이 필요할 수 있음', e);
      }

      // 3. 기존 방이 없을 때 반환할 임시 객체
      return {
        id: -1,
        productId: prod.id,
        productTitle: prod.title,
        productThumbnailUrl: (prod.images && prod.images.length > 0) ? prod.images[0].imageUrl : (prod.imageUrl || prod.thumbnailUrl || null),
        productPrice: prod.price,
        productStatus: prod.status,
        buyerId: userId ?? -1,
        buyerNickname: userNickname,
        sellerId: prod.sellerId || -1,
        sellerNickname: prod.sellerNickname || '',
        lastMessage: null,
        lastSentAt: null,
        unreadCount: 0,
        roomStatus: 'ACTIVE',
        partnerId: prod.sellerId || -1,
        partnerNickname: prod.sellerNickname || '',
      } as ChatRoom;
    },
    enabled: productId > 0 && !!userId && !!accessToken,
  });
}

/**
 * 채팅방 읽음 처리 훅
 */
export function useMarkAsRead(accessToken: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomId: number | string) => {
      const id = typeof roomId === 'string' ? Number(roomId) : Number(roomId);
      if (!id || id <= 0) return null;
      
      const res = await apiClient.patch(ENDPOINTS.CHATS.READ(id), {}, accessToken ?? undefined);
      if (!res.ok) throw new Error('읽음 처리 실패');
      return res.json();
    },
    onSuccess: (_, roomId) => {
      const id = typeof roomId === 'string' ? Number(roomId) : Number(roomId);
      // 채팅 리스트와 특정 채팅방 정보 갱신
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      queryClient.invalidateQueries({ queryKey: ['chatRoom', id] });
    },
  });
}
