"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useNotificationStore } from "@/features/chat-messaging/lib/useGlobalChatStomp";
import type { ChatRoom } from "../model/types";

/**
 * 채팅방 데이터를 FSD 구조에 맞게 매핑해주는 유틸리티
 */
export const mapToChatRoomDetail = (
  d: any,
  userId: number | null,
  fallbackNickname: string = "",
): ChatRoom => {
  const product = d.product || d.productResponseDto || {};
  const partner = d.partner || d.partnerResponseDto || {};

  const productTitle =
    product.title ||
    product.productName ||
    d.productTitle ||
    d.title ||
    "상품 정보 없음";
  const productPrice =
    product.price || product.amount || d.productPrice || d.price || 0;
  const finalImageUrl =
    product.images && product.images.length > 0
      ? product.images[0].imageUrl
      : d.images && d.images.length > 0
        ? d.images[0].imageUrl
        : null;
  const productThumbnailUrl =
    finalImageUrl ||
    product.productThumbnailUrl ||
    product.thumbnailUrl ||
    product.imageUrl ||
    product.image ||
    d.productThumbnailUrl ||
    d.thumbnailUrl ||
    d.productImageUrl ||
    d.imageUrl ||
    d.image ||
    null;
  const productStatus =
    product.status || d.productStatus || d.status || "ACTIVE";

  const effectivePartnerId =
    partner.userId || partner.id || d.partnerId || d.targetId || -1;
  const productSellerId =
    product.sellerId ||
    product.userId ||
    d.sellerId ||
    d.ownerId ||
    d.adminId ||
    d.productSellerId;
  const productBuyerId = d.buyerId || d.customerId || d.productBuyerId;

  const currentUserId = userId ? Number(userId) : null;
  const sellerIdAsNum = productSellerId ? Number(productSellerId) : null;
  const buyerIdAsNum = productBuyerId ? Number(productBuyerId) : null;
  const partnerIdNum = Number(effectivePartnerId);

  let finalBuyerId = -1;
  let finalSellerId = -1;

  // 로직 개선: 상호 배타적으로 할당
  // 1. 내가 판매자인 경우
  if (currentUserId && sellerIdAsNum && currentUserId === sellerIdAsNum) {
    finalSellerId = currentUserId;
    finalBuyerId = partnerIdNum;
  }
  // 2. 내가 구매자인 경우
  else if (currentUserId && buyerIdAsNum && currentUserId === buyerIdAsNum) {
    finalBuyerId = currentUserId;
    finalSellerId = partnerIdNum;
  }
  // 3. 내가 구매자임이 확실한 경우 (판매자가 나랑 다름)
  else if (
    currentUserId &&
    sellerIdAsNum &&
    currentUserId !== sellerIdAsNum &&
    currentUserId !== partnerIdNum
  ) {
    finalBuyerId = currentUserId;
    finalSellerId = sellerIdAsNum;
  }
  // 4. 역할 필드 기반
  else if (d.myRole === "BUYER" || d.role === "BUYER") {
    finalBuyerId = currentUserId || -1;
    finalSellerId = partnerIdNum;
  } else if (d.myRole === "SELLER" || d.role === "SELLER") {
    finalSellerId = currentUserId || -1;
    finalBuyerId = partnerIdNum;
  }
  // 5. 최후의 보루: 내가 파트너가 아니라면 확실한 정보를 기반으로만 할당
  else if (currentUserId && currentUserId !== partnerIdNum) {
    if (sellerIdAsNum && sellerIdAsNum !== currentUserId) {
      finalBuyerId = currentUserId;
      finalSellerId = partnerIdNum;
    } else if (buyerIdAsNum && buyerIdAsNum !== currentUserId) {
      finalSellerId = currentUserId;
      finalBuyerId = partnerIdNum;
    } else if (d.sellerNickname && d.sellerNickname === fallbackNickname) {
      finalSellerId = currentUserId;
      finalBuyerId = partnerIdNum;
    } else if (d.buyerNickname && d.buyerNickname === fallbackNickname) {
      finalBuyerId = currentUserId;
      finalSellerId = partnerIdNum;
    } else {
      // 확실하지 않은 경우 섣불리 판매자(권한자)로 지정하지 않음
      finalBuyerId = buyerIdAsNum || -1;
      finalSellerId = sellerIdAsNum || -1;
    }
  }

  const finalBuyerNickname =
    currentUserId && finalBuyerId === currentUserId
      ? fallbackNickname
      : d.buyerNickname ||
        (finalBuyerId === partnerIdNum ? partner.nickname : "") ||
        "";
  const finalSellerNickname =
    currentUserId && finalSellerId === currentUserId
      ? fallbackNickname
      : d.sellerNickname ||
        (finalSellerId === partnerIdNum ? partner.nickname : "") ||
        "";

  return {
    id: d.roomId || d.id,
    productId: product.productId || product.id || d.productId || d.id,
    productTitle,
    productThumbnailUrl,
    productPrice,
    productStatus,
    partnerId: partnerIdNum,
    partnerNickname:
      partner.nickname || d.partnerNickname || d.targetNickname || "알 수 없음",
    lastMessage: d.lastMessage,
    lastSentAt: d.lastSentAt,
    roomStatus: d.roomStatus || "ACTIVE",
    buyerId: finalBuyerId,
    buyerNickname: finalBuyerNickname || "구매자",
    sellerId: finalSellerId,
    sellerNickname: finalSellerNickname || "판매자",
    unreadCount: d.unreadCount ?? 0,
  } as ChatRoom;
};

/**
 * 기존 채팅방 상세 조회 훅 (엔터티 계층)
 */
export function useChatRoomDetail(
  roomId: number,
  userId: number | null,
  accessToken: string | null,
  userNickname: string = "",
) {
  return useQuery<ChatRoom>({
    queryKey: ["chatRoom", roomId, userId, userNickname],
    queryFn: async () => {
      const res = await apiClient.get(
        `${ENDPOINTS.CHATS.DETAIL(roomId)}?userId=${userId}`,
        accessToken ?? undefined,
      );
      if (!res.ok) throw new Error("채팅방 정보를 불러오지 못했습니다.");
      const json: any = await res.json();
      const d = json.data || json.response || json.result || json;
      // 백엔드 채팅방 응답에 정보가 누락되었을 수 있으므로 방어 로직 추가
      // productId가 있다면 상품 상세 정보를 직접 조회하여 병합합니다. (역할 판별 및 썸네일 표시용)
      let productInfo = {};
      const targetProductId =
        d.productId || d.product?.id || d.product?.productId;

      const missingSeller = !d.sellerId && !d.productSellerId;
      const finalImageUrl =
        d.product?.images && d.product?.images.length > 0
          ? d.product.images[0].imageUrl
          : d.product?.imageUrl ||
            d.product?.thumbnailUrl ||
            d.productThumbnailUrl ||
            d.thumbnailUrl ||
            d.productImageUrl ||
            d.imageUrl;
      const missingImage = !finalImageUrl;

      if ((missingSeller || missingImage) && targetProductId) {
        try {
          const pRes = await apiClient.get(
            ENDPOINTS.PRODUCTS.DETAIL(targetProductId),
            accessToken ?? undefined,
          );
          if (pRes.ok) {
            const pJson: any = await pRes.json();
            productInfo = pJson.data || pJson;
          }
        } catch (e) {
          console.warn("역할/썸네일 판별을 위한 상품 정보 추가 조회 실패", e);
        }
      }

      return mapToChatRoomDetail(
        {
          ...d,
          product: { ...(d.product || {}), ...productInfo },
        },
        userId,
        userNickname,
      );
    },
    enabled: roomId > 0 && !!userId && !!accessToken,
  });
}

/**
 * 신규 진입 시 기존 방이 있는지 확인하거나 상품 정보를 조회하는 훅
 */
export function useNewChatRoomInit(
  productId: number,
  userId: number | null,
  accessToken: string | null,
  userNickname: string = "",
) {
  return useQuery<ChatRoom>({
    queryKey: ["newChatRoomInit", productId, userId],
    queryFn: async () => {
      // 1. 상품 정보 가져오기
      const prodRes = await apiClient.get(
        ENDPOINTS.PRODUCTS.DETAIL(productId),
        accessToken ?? undefined,
      );
      if (!prodRes.ok) throw new Error("상품 정보를 불러오지 못했습니다.");
      const prodJson = (await prodRes.json()) as any;
      const prod = prodJson.data || prodJson;

      // 2. [변경] 채팅방 생성(POST) 대신 기존 방 목록(GET)에서 조회
      // 메시지를 보내기 전에는 서버에 방을 생성하지 않기 위함 (임시 채팅방 로직)
      try {
        const roomsRes = await apiClient.get(
          `${ENDPOINTS.CHATS.USER_ROOMS}?userId=${userId}`,
          accessToken ?? undefined,
        );
        if (roomsRes.ok) {
          const roomsJson = (await roomsRes.json()) as any;
          const rooms =
            (Array.isArray(roomsJson)
              ? roomsJson
              : roomsJson?.data || roomsJson?.content) || [];

          // 해당 상품에 대해 이미 채팅 중인 방이 있는지 확인
          const existingRoom = rooms.find(
            (r: any) => Number(r.productId) === Number(productId),
          );

          if (existingRoom) {
            return mapToChatRoomDetail(
              {
                ...existingRoom,
                product: prod, // 최신 상품 정보를 병합
              },
              userId,
              userNickname,
            );
          }
        }
      } catch (e) {
        console.warn("기존 채팅방 목록 조회 실패", e);
      }

      // 3. 기존 방이 없을 때 반환할 임시 객체 (id: -1)
      // 이 상태에서는 ChatRoomPage가 '/chat/new' 경로를 유지하며, 첫 메시지 발송 시점에 실제 방이 생성됨
      return {
        id: -1,
        productId: prod.id,
        productTitle: prod.title,
        productThumbnailUrl:
          prod.images && prod.images.length > 0
            ? prod.images[0].imageUrl
            : prod.imageUrl || prod.thumbnailUrl || null,
        productPrice: prod.price,
        productStatus: prod.status,
        buyerId: userId ?? -1,
        buyerNickname: userNickname,
        sellerId: prod.sellerId || -1,
        sellerNickname: prod.sellerNickname || "",
        lastMessage: null,
        lastSentAt: null,
        unreadCount: 0,
        roomStatus: "ACTIVE",
        partnerId: prod.sellerId || -1,
        partnerNickname: prod.sellerNickname || "",
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
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  return useMutation({
    mutationFn: async (roomId: number | string) => {
      const id = typeof roomId === "string" ? Number(roomId) : Number(roomId);
      if (!id || id <= 0) return null;

      const res = await apiClient.patch(
        ENDPOINTS.CHATS.READ(id),
        {},
        accessToken ?? undefined,
      );
      if (!res.ok) throw new Error("읽음 처리 실패");
      return res.json();
    },
    onSuccess: async (_, roomId) => {
      const id = typeof roomId === "string" ? Number(roomId) : Number(roomId);
      // 채팅 리스트와 특정 채팅방 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["chatRoom", id] });

      // 탭 바의 글로벌 배지 카운트도 100% 동기화 (Badge 초기화 목적)
      const userId = useAuthStore.getState().userId;
      if (userId && accessToken) {
        try {
          // 🔔 [백엔드 DB 지연 대응] 읽음 처리 트랜잭션이 DB에 반영될 시간을 살짝 벌어줍니다.
          await new Promise((resolve) => setTimeout(resolve, 300));

          const res = await apiClient.get(
            `${ENDPOINTS.CHATS.USER_ROOMS}?userId=${userId}`,
            accessToken,
          );
          if (!res.ok) return;
          const json: any = await res.json();
          const rooms =
            (Array.isArray(json)
              ? json
              : json?.data || json?.content || json?.response) || [];
          if (Array.isArray(rooms)) {
            const sum = rooms.reduce(
              (acc: number, r: any) => acc + (r.unreadCount || 0),
              0,
            );
            setUnreadCount(sum);
          }
        } catch (e) {
          console.warn("글로벌 배지 동기화 실패", e);
        }
      }
    },
  });
}
