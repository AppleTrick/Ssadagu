'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import styled from '@emotion/styled';

// Widgets
import { HeaderBack } from '@/widgets/header';
import { ChatInputArea } from '@/widgets/chat-input';

// Entities
import { 
  ChatBubbleMine, 
  ChatBubbleOther, 
  ChatRoomItemSummary, 
  SystemMessage, 
  MapChatBubble 
} from '@/entities/chat';
import { useChatRoomDetail, useNewChatRoomInit, useMarkAsRead } from '@/entities/chat/api/useChatRoom';
import { useChatHistory } from '@/entities/chat/api/useChatMessages';
import { useUserProfile } from '@/entities/user/api/useProfile';
import type { ChatMessage, ChatRoom } from '@/entities/chat/model/types';
import { User } from '@/entities/user';

// Features
import { TransactionBubble } from '@/entities/transaction';
import { TransactionRequestSheet, TransactionConfirmSheet } from '@/features/transfer-payment';
import TransactionAuthModal from '@/features/transfer-payment/ui/TransactionAuthModal';
import { ChatMapPickerSheet } from '@/features/chat-map-picker';
import { useChatMessaging } from '@/features/chat-messaging/lib/useChatMessaging';

// Shared
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT } from '@/shared/styles/theme';
import { compressImage } from '@/shared/utils/image';
import { useModalStore } from '@/shared/hooks/useModalStore';

const CHAT_INPUT_HEIGHT = 56;

export function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [reqSheetOpen, setReqSheetOpen] = useState(false);
  const [confirmSheetOpen, setConfirmSheetOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mapSheetOpen, setMapSheetOpen] = useState(false);
  const [selectedConfirmMessage, setSelectedConfirmMessage] = useState<ChatMessage | null>(null);

  // 1. 공통 데이터 및 상태 추출 (상단 배치)
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const { alert: showAlert } = useModalStore();

  const rawId = params && params.roomId ? (Array.isArray(params.roomId) ? params.roomId[0] : params.roomId) : '';
  const isNewRoom = rawId === 'new';
  const roomId = isNewRoom ? -1 : Number(rawId);
  const newProductId = Number(searchParams?.get('productId'));

  // 2. 읽음 처리 로직 (ID와 토큰 확보 후)
  const { mutate: markAsRead } = useMarkAsRead(accessToken);
  useEffect(() => {
    if (roomId > 0 && !isNewRoom) {
      markAsRead(roomId);
    }
  }, [roomId, isNewRoom, markAsRead]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesAreaRef = useRef<HTMLDivElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleScroll = () => {
    if (!messagesAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesAreaRef.current;
    // 오차 범위 150px 이내면 맨 아래로 간주
    const atBottom = scrollHeight - scrollTop - clientHeight < 150;
    setIsAtBottom(atBottom);
    if (atBottom && unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  // 1. Entities: 사용자 정보 및 방 정보 초기화
  const { data: currentUser } = useUserProfile(userId, accessToken);
  const { data: newRoomData, isLoading: newRoomLoading } = useNewChatRoomInit(newProductId, userId, accessToken, currentUser?.nickname);
  const { data: fetchedRoom, isLoading: fetchedRoomLoading } = useChatRoomDetail(roomId, userId, accessToken, currentUser?.nickname);
  const room = isNewRoom ? newRoomData : fetchedRoom;
  const isLoading = isNewRoom ? newRoomLoading : (fetchedRoomLoading || !room);

  // 2. Entities: 대화 내역 조회
  const { data: historyMessages, isLoading: messagesLoading } = useChatHistory(roomId, userId, accessToken);

  // 3. Features: 실시간 채팅 핸들링
  const { sessionMessages, isStompConnected, sendMessage, addOptimisticMessage } = useChatMessaging(roomId, accessToken, userId);

  // 역할 판별 (타입 불일치 방지 위해 Number 사용)
  const isSeller = room && userId && Number(userId) > 0 && Number(userId) === Number(room.sellerId);
  const isBuyer = room && userId && Number(userId) > 0 && Number(userId) === Number(room.buyerId) && !isSeller;

  // 리다이렉트 로직 (이미 방이 있을 때)
  useEffect(() => {
    if (isNewRoom && newRoomData && newRoomData.id > 0) {
      router.replace(`/chat/${newRoomData.id}`);
    }
  }, [isNewRoom, newRoomData, router]);

  const displayMessages = useMemo(() => {
    const history = historyMessages ? [...historyMessages].reverse() : [];
    const historyIds = new Set(history.map(m => m.id));
    const filteredSession = sessionMessages.filter(m => !historyIds.has(m.id));
    
    const rawList = [...history, ...filteredSession].sort((a, b) => {
      const timeA = new Date((a.sentAt || (a as any).createdAt || 0) as string).getTime();
      const timeB = new Date((b.sentAt || (b as any).createdAt || 0) as string).getTime();
      return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
    });

    const result: (ChatMessage & { resolvedType?: 'PAYMENT_SUCCESS' | 'PAYMENT_FAIL' })[] = [];
    for (const msg of rawList) {
      const msgType = msg.type || msg.messageType || 'TALK';
      
      // 버그 방지: 결제 요청 메시지의 경우 내용(JSON)이 올바르지 않거나 정보가 없으면 제외
      if (msgType === 'PAYMENT_REQUEST') {
        try {
          const content = JSON.parse(msg.content || '{}');
          if (!content.price || content.price <= 0) {
            // 가격이 없거나 0원인 거래 요청은 비정상 데이터로 간주하고 무시
            continue;
          }
        } catch (e) {
          // JSON 파싱 실패 시에도 비정상 데이터로 간주
          continue;
        }
      }

      if (['PAYMENT_SUCCESS', 'PAYMENT_FAIL'].includes(msgType)) {
        for (let i = result.length - 1; i >= 0; i--) {
          if ((result[i].type || result[i].messageType) === 'PAYMENT_REQUEST' && result[i].content === msg.content && !result[i].resolvedType) {
            result[i].resolvedType = msgType as any;
            break;
          }
        }
      } else {
        result.push({ ...msg });
      }
    }
    return result;
  }, [historyMessages, sessionMessages]);

  useEffect(() => {
    if (displayMessages.length === 0) return;
    const latestMsg = displayMessages[displayMessages.length - 1];
    const isMine = userId !== null && Number(latestMsg.senderId) === Number(userId);

    if (isMine || isAtBottom) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      setUnreadCount((prev) => prev + 1);
    }
  }, [displayMessages.length]);

  const createChatMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(ENDPOINTS.CHATS.CREATE, { productId: newProductId }, accessToken ?? undefined);
      if (!res.ok) throw new Error('채팅방 생성 실패');
      const json = await res.json() as any;
      return json.data?.id || json.id || json.data?.roomId;
    },
  });

  const extractCleanErrorMsg = (msg: string) => {
    if (!msg) return '';
    const match = msg.match(/"responseMessage"\s*:\s*"([^"]+)"/);
    return match ? match[1] : msg;
  };

  const handleSend = async (content: string) => {
    if (isNewRoom) {
      const id = await createChatMutation.mutateAsync();
      if (id) {
        sessionStorage.setItem('pendingChatMsg', content);
        router.replace(`/chat/${id}`);
      }
      return;
    }
    sendMessage('/pub/chat/message', { senderId: userId || -1, content, type: 'TALK' });
  };



  const handleTransactionAction = async (msg: ChatMessage, actionType: 'PAYMENT_SUCCESS' | 'PAYMENT_FAIL') => {
    if (!room) return;
    try {
      const isMine = userId !== null && (Number(msg.senderId) === Number(userId));
      // 결제 승인의 경우, 내가 요청을 받은 입장(!isMine)이라면 내가 곧 구매자임. 아니라면 방 정보를 따름.
      const targetBuyerId = (actionType === 'PAYMENT_SUCCESS' && !isMine) ? userId : room.buyerId;

      const endpoint = actionType === 'PAYMENT_SUCCESS' ? ENDPOINTS.TRANSACTIONS.APPROVE : ENDPOINTS.TRANSACTIONS.CANCEL;
      const body = actionType === 'PAYMENT_SUCCESS' 
        ? { productId: room.productId, buyerId: targetBuyerId, amount: JSON.parse(msg.content || '{}').price || room.productPrice }
        : { productId: room.productId, buyerId: targetBuyerId, roomId };

      const res = await apiClient.post(endpoint, body, accessToken ?? undefined);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        showAlert({ message: extractCleanErrorMsg(errJson.message || '처리 실패') });
        return;
      }

      // 결제 성공 시 추가 후처리
      if (actionType === 'PAYMENT_SUCCESS') {
        const result = await res.json().catch(() => ({}));
        const amount = result?.data?.amount || result?.amount || 0;
        const counterpart = result?.data?.counterpartNickname || result?.counterpartNickname || '판매자';

        showAlert({ 
          title: '결제 완료', 
          message: `${counterpart}님께 ${amount.toLocaleString()}원 송금이 완료되었습니다.\n이제 상품이 '거래완료' 상태로 변경됩니다.` 
        });

        // 관련 데이터 무효화 (실시간 UI 갱신)
        queryClient.invalidateQueries({ queryKey: ['product', room.productId] });
        queryClient.invalidateQueries({ queryKey: ['chatRoom', roomId] });
        queryClient.invalidateQueries({ queryKey: ['myAccount'] });
        queryClient.invalidateQueries({ queryKey: ['userPurchases'] });
      }

      sendMessage('/pub/chat/message', { senderId: userId || -1, content: msg.content, type: actionType });
      setConfirmSheetOpen(false);
      setSelectedConfirmMessage(null);
    } catch (e) { 
      showAlert({ message: '처리 중 오류 발생\n잠시 후 다시 시도해 주세요.' }); 
    }
  };

  const handleMapSubmit = (lat: number, lng: number, locationName: string) => {
    sendMessage('/pub/chat/message', { senderId: userId || -1, content: locationName, type: 'MAP', latitude: lat, longitude: lng, locationName });
    setMapSheetOpen(false);
  };

  const handlePhotosSelected = async (files: File[]) => {
    setIsUploading(true);
    try {
      const compressedFiles = await Promise.all(files.map(f => compressImage(f, 1920, 1920, 2)));
      const formData = new FormData();
      compressedFiles.forEach(f => formData.append('files', f));

      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/files/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('업로드 실패');
      const imageUrls: string[] = await uploadRes.json();
      imageUrls.forEach(url => sendMessage('/pub/chat/message', { senderId: userId || -1, content: '사진', type: 'IMAGE', imageUrl: url }));
    } catch (e) { 
      showAlert({ message: '사진 전송 중 오류가 발생했습니다.' }); 
    }
    finally { setIsUploading(false); }
  };

  const headerTitle = room?.partnerNickname || (room?.buyerId === userId ? room?.sellerNickname : room?.buyerNickname) || '채팅';

  return (
    <Page>
      <HeaderBack title={headerTitle} onBack={() => router.back()} />
      {room && (
        <ItemSummaryBar>
          <ChatRoomItemSummary
            productId={room.productId}
            productTitle={room.productTitle}
            productThumbnailUrl={room.productThumbnailUrl}
            price={room.productPrice ?? 0}
            status={room.productStatus ?? room.roomStatus}
          />
        </ItemSummaryBar>
      )}
      <MessagesArea ref={messagesAreaRef} onScroll={handleScroll}>
        {isLoading && displayMessages.length === 0 && <LoadingWrapper>불러오는 중...</LoadingWrapper>}
        {!isLoading && !messagesLoading && displayMessages.length === 0 && <EmptyMessages>아직 메시지가 없습니다.</EmptyMessages>}
        {displayMessages.map((msg) => {
          const isMine = userId !== null && Number(msg.senderId) === Number(userId);
          const msgType = msg.type || msg.messageType || 'TALK';
          
          // 백엔드에서 닉네임이 안 내려올 경우를 대비해 룸 정보에서 매핑
          const resolvedNickname = isMine 
            ? '나' 
            : (msg.senderNickname || (Number(msg.senderId) === Number(room?.sellerId) ? room?.sellerNickname : room?.buyerNickname) || room?.partnerNickname || '상대방');

          if (['ENTER', 'LEAVE', 'SYSTEM'].includes(msgType)) return <SystemMessage key={msg.id} message={msg.content} />;
          
          if (['PAYMENT_REQUEST', 'PAYMENT_SUCCESS', 'PAYMENT_FAIL'].includes(msgType)) {
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', width: '100%', gap: '4px', padding: '2px 16px' }}>
                {!isMine && (
                  <span style={{ fontSize: typography.size.xs, color: colors.textSecondary, fontWeight: typography.weight.medium, margin: '0 0 0 2px' }}>
                    {resolvedNickname}
                  </span>
                )}
                <TransactionBubble
                  message={msg} productThumbnailUrl={room?.productThumbnailUrl}
                  isMyMessage={isMine} onCancel={() => handleTransactionAction(msg, 'PAYMENT_FAIL')}
                  onReject={() => handleTransactionAction(msg, 'PAYMENT_FAIL')}
                  onAccept={() => { setSelectedConfirmMessage(msg); setConfirmSheetOpen(true); }}
                />
              </div>
            );
          }
          
          if (msgType === 'MAP') {
            return (
              <MapChatBubble 
                key={msg.id} 
                lat={msg.latitude || 0} 
                lng={msg.longitude || 0} 
                label={msg.locationName} 
                isMine={isMine} 
                senderNickname={resolvedNickname}
                sentAt={msg.sentAt || (msg as any).createdAt} 
              />
            );
          }
          
          return isMine 
            ? <ChatBubbleMine key={msg.id} type={msgType} message={msg.content} sentAt={msg.sentAt || (msg as any).createdAt} imageUrl={msg.imageUrl} />
            : <ChatBubbleOther key={msg.id} type={msgType} senderNickname={resolvedNickname} message={msg.content} sentAt={msg.sentAt || (msg as any).createdAt} imageUrl={msg.imageUrl} />;
        })}
        {isUploading && <UploadStatus>사진 전송 중...</UploadStatus>}
        <div ref={bottomRef} style={{ height: '1px' }} />
        
        {/* 채팅방 하단 새 메시지 플로팅 알림 (안 읽음 배지) */}
        {unreadCount > 0 && !isAtBottom && (
          <FloatingBadge onClick={() => {
            setUnreadCount(0);
            setIsAtBottom(true);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}>
            {unreadCount}개의 새 메시지
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </FloatingBadge>
        )}
      </MessagesArea>
      <ChatInputArea 
        onSend={handleSend} 
        onSelectTransaction={isSeller ? () => {
          setReqSheetOpen(true);
        } : undefined} 
        onSelectLocation={() => setMapSheetOpen(true)} 
        onPhotosSelected={handlePhotosSelected} 
      />
      {/* 닉네임 판별 로직: 이제 룸 매퍼에서 처리된 닉네임을 그대로 사용합니다. */}
      {room && (
        <TransactionRequestSheet 
          isOpen={reqSheetOpen} 
          onClose={() => setReqSheetOpen(false)} 
          roomInfo={{ productTitle: room.productTitle, productPrice: room.productPrice ?? 0, productThumbnailUrl: room.productThumbnailUrl }} 
          buyerNickname={room.buyerNickname}
          sellerNickname={room.sellerNickname}
          onSubmit={async (locationName, time, price) => {
            try {
              const targetBuyerId = isSeller ? room.partnerId : room.buyerId;
              const res = await apiClient.post(ENDPOINTS.TRANSACTIONS.REQUEST, { productId: room.productId, buyerId: targetBuyerId, roomId }, accessToken ?? undefined);
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                showAlert({ message: extractCleanErrorMsg(body.message || '결제 요청 실패') });
                return;
              }
              sendMessage('/pub/chat/message', { 
                senderId: userId || -1, 
                content: JSON.stringify({ 
                  locationName, 
                  time, 
                  price,
                  buyerNickname: room.buyerNickname,
                  sellerNickname: room.sellerNickname,
                }), 
                type: 'PAYMENT_REQUEST' 
              });
              setReqSheetOpen(false);
            } catch (e) { 
              showAlert({ message: '요청 중 오류 발생\n잠시 후 다시 시도해 주세요.' }); 
            }
          }} 
        />
      )}
      <TransactionConfirmSheet isOpen={confirmSheetOpen} onClose={() => setConfirmSheetOpen(false)}
        roomInfo={room ? { productTitle: room.productTitle, productThumbnailUrl: room.productThumbnailUrl } : null} content={selectedConfirmMessage ? JSON.parse(selectedConfirmMessage.content || '{}') : undefined}
        onConfirm={() => {
          // 수락 버튼 → 2차 비밀번호/생체인증 확인 후 결제 진행
          setAuthModalOpen(true);
        }} />
      <TransactionAuthModal
        isOpen={authModalOpen}
        onSuccess={() => {
          setAuthModalOpen(false);
          setConfirmSheetOpen(false);
          if (selectedConfirmMessage) {
            handleTransactionAction(selectedConfirmMessage, 'PAYMENT_SUCCESS');
          }
        }}
        onClose={() => setAuthModalOpen(false)}
      />
      <ChatMapPickerSheet isOpen={mapSheetOpen} onClose={() => setMapSheetOpen(false)} onSubmit={handleMapSubmit} />
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: ${colors.surface};
  overflow: hidden;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  position: relative;
`;

const FloatingBadge = styled.button`
  position: sticky;
  bottom: 24px;
  align-self: center;
  background: ${colors.primary};
  color: ${colors.surface};
  border: none;
  border-radius: 999px;
  padding: 10px 20px;
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.semibold};
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.2s, transform 0.2s;
  
  &:active {
    transform: scale(0.96);
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-family: ${typography.fontFamily};
  color: ${colors.textSecondary};
`;

const ItemSummaryBar = styled.div`
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
  flex-shrink: 0;
`;

const EmptyMessages = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: ${colors.textSecondary};
`;

const UploadStatus = styled.div`
  padding: 8px 16px;
  text-align: right;
  font-size: 13px;
  color: ${colors.textSecondary};
`;
