'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ChatRoom } from '../model/types';

/**
 * 채팅방 데이터를 FSD 구조에 맞게 매핑해주는 유틸리티
 */
export const mapToChatRoomDetail = (d: any, userId: number | null, fallbackNickname: string = ''): ChatRoom => {
  const product = d.product || {};
  const partner = d.partner || {};

  const productTitle = product.title || d.productTitle || d.title || '상품 정보 없음';
  const productPrice = product.price || d.productPrice || d.price || 0;
  const productThumbnailUrl = product.imageUrl || product.thumbnailUrl || d.productImageUrl || d.thumbnailUrl || null;
  const productStatus = product.status || d.productStatus || d.status || 'ACTIVE';

  const myRole = d.myRole;
  const buyerId = myRole === 'BUYER' ? (userId ?? -1) : (d.buyerId || d.partnerId);
  const sellerId = myRole === 'SELLER' ? (userId ?? -1) : (d.sellerId || d.partnerId);

  return {
    id: d.roomId || d.id,
    productId: product.productId || d.productId || d.id,
    productTitle,
    productThumbnailUrl,
    productPrice,
    productStatus,
    partnerId: partner.userId || d.partnerId,
    partnerNickname: partner.nickname || d.partnerNickname,
    lastMessage: d.lastMessage,
    lastSentAt: d.lastSentAt,
    roomStatus: d.roomStatus || 'ACTIVE',
    buyerId: buyerId ?? -1,
    buyerNickname: myRole === 'BUYER' ? fallbackNickname : (d.partnerNickname || d.buyerNickname || ''),
    sellerId: sellerId ?? -1,
    sellerNickname: myRole === 'SELLER' ? fallbackNickname : (d.partnerNickname || d.sellerNickname || ''),
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
      return mapToChatRoomDetail(d, userId);
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
                 productTitle: prod.title,
                 productPrice: prod.price,
                 productThumbnailUrl: prod.imageUrl || prod.thumbnailUrl,
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
        productThumbnailUrl: prod.imageUrl || prod.thumbnailUrl,
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
