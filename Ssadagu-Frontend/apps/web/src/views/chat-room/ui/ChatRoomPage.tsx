'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
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
import { useChatRoomDetail, useNewChatRoomInit } from '@/entities/chat/api/useChatRoom';
import { useChatHistory } from '@/entities/chat/api/useChatMessages';
import { useUserProfile } from '@/entities/user/api/useProfile';
import type { ChatMessage, ChatRoom } from '@/entities/chat/model/types';
import { User } from '@/entities/user';

// Features
import { TransactionBubble } from '@/entities/transaction';
import { TransactionRequestSheet, TransactionConfirmSheet } from '@/features/transfer-payment';
import { ChatMapPickerSheet } from '@/features/chat-map-picker';
import { useChatMessaging } from '@/features/chat-messaging/lib/useChatMessaging';

// Shared
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT } from '@/shared/styles/theme';
import { compressImage } from '@/shared/utils/image';

const CHAT_INPUT_HEIGHT = 56;
const CHAT_INPUT_BOTTOM_OFFSET = 0;
const MESSAGES_BOTTOM_PAD = CHAT_INPUT_HEIGHT + CHAT_INPUT_BOTTOM_OFFSET + 16;

export function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reqSheetOpen, setReqSheetOpen] = useState(false);
  const [confirmSheetOpen, setConfirmSheetOpen] = useState(false);
  const [mapSheetOpen, setMapSheetOpen] = useState(false);
  const [selectedConfirmMessage, setSelectedConfirmMessage] = useState<ChatMessage | null>(null);

  const rawId = params && params.roomId ? (Array.isArray(params.roomId) ? params.roomId[0] : params.roomId) : '';
  const isNewRoom = rawId === 'new';
  const roomId = isNewRoom ? -1 : Number(rawId);
  const newProductId = Number(searchParams?.get('productId'));

  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Entities: 사용자 정보 및 방 정보 초기화
  const { data: currentUser } = useUserProfile(userId, accessToken);
  const { data: newRoomData, isLoading: newRoomLoading } = useNewChatRoomInit(newProductId, userId, accessToken, currentUser?.nickname);
  const { data: fetchedRoom, isLoading: fetchedRoomLoading } = useChatRoomDetail(roomId, userId, accessToken);
  const room = isNewRoom ? newRoomData : fetchedRoom;
  const isLoading = isNewRoom ? newRoomLoading : (fetchedRoomLoading || !room);

  // 2. Entities: 대화 내역 조회
  const { data: historyMessages, isLoading: messagesLoading } = useChatHistory(roomId, userId, accessToken);

  // 3. Features: 실시간 채팅 핸들링
  const { sessionMessages, isStompConnected, sendMessage, addOptimisticMessage } = useChatMessaging(roomId, accessToken, userId);

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
      const timeA = new Date((a.sentAt || (a as any).createdAt) as string).getTime();
      const timeB = new Date((b.sentAt || (b as any).createdAt) as string).getTime();
      return timeA - timeB;
    });

    const result: (ChatMessage & { resolvedType?: 'PAYMENT_SUCCESS' | 'PAYMENT_FAIL' })[] = [];
    for (const msg of rawList) {
      const msgType = msg.type || msg.messageType || 'TALK';
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
    if (displayMessages.length > 0) bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [displayMessages.length]);

  const createChatMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(ENDPOINTS.CHATS.CREATE, { productId: newProductId }, accessToken ?? undefined);
      if (!res.ok) throw new Error('채팅방 생성 실패');
      const json = await res.json() as any;
      return json.data?.id || json.id || json.data?.roomId;
    },
  });

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

  const handleTransactionRequestSubmit = async (location: string, time: string, price: number) => {
    if (isNewRoom || !room) return;
    try {
      const res = await apiClient.post(ENDPOINTS.TRANSACTIONS.REQUEST, { productId: room.productId, buyerId: room.buyerId, roomId }, accessToken ?? undefined);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.message || '결제 요청 실패');
        return;
      }
      sendMessage('/pub/chat/message', { senderId: userId || -1, content: JSON.stringify({ locationName: location, time, price }), type: 'PAYMENT_REQUEST' });
      setReqSheetOpen(false);
    } catch (e) { alert('요청 중 오류 발생'); }
  };

  const handleTransactionAction = async (msg: ChatMessage, actionType: 'PAYMENT_SUCCESS' | 'PAYMENT_FAIL') => {
    if (!room) return;
    try {
      const endpoint = actionType === 'PAYMENT_SUCCESS' ? ENDPOINTS.TRANSACTIONS.APPROVE : ENDPOINTS.TRANSACTIONS.CANCEL;
      const body = actionType === 'PAYMENT_SUCCESS' 
        ? { productId: room.productId, buyerId: room.buyerId, amount: JSON.parse(msg.content || '{}').price || room.productPrice }
        : { productId: room.productId, buyerId: room.buyerId, roomId };

      const res = await apiClient.post(endpoint, body, accessToken ?? undefined);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.message || '처리 실패');
        return;
      }
      sendMessage('/pub/chat/message', { senderId: userId || -1, content: msg.content, type: actionType });
      setConfirmSheetOpen(false);
      setSelectedConfirmMessage(null);
    } catch (e) { alert('처리 중 오류 발생'); }
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
    } catch (e) { alert('사진 전송 오류'); }
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
      <MessagesArea>
        {isLoading && displayMessages.length === 0 && <LoadingWrapper>불러오는 중...</LoadingWrapper>}
        {!isLoading && !messagesLoading && displayMessages.length === 0 && <EmptyMessages>아직 메시지가 없습니다.</EmptyMessages>}
        {displayMessages.map((msg) => {
          const isMine = userId !== null && msg.senderId === userId;
          const msgType = msg.type || msg.messageType || 'TALK';
          if (['ENTER', 'LEAVE', 'SYSTEM'].includes(msgType)) return <SystemMessage key={msg.id} message={msg.content} />;
          if (['PAYMENT_REQUEST', 'PAYMENT_SUCCESS', 'PAYMENT_FAIL'].includes(msgType)) {
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', width: '100%' }}>
                <TransactionBubble
                  message={msg} productThumbnailUrl={room?.productThumbnailUrl}
                  isMyMessage={isMine} onCancel={() => handleTransactionAction(msg, 'PAYMENT_FAIL')}
                  onReject={() => handleTransactionAction(msg, 'PAYMENT_FAIL')}
                  onAccept={() => { setSelectedConfirmMessage(msg); setConfirmSheetOpen(true); }}
                />
              </div>
            );
          }
          if (msgType === 'MAP') return <MapChatBubble key={msg.id} lat={msg.latitude || 0} lng={msg.longitude || 0} label={msg.locationName} isMine={isMine} sentAt={msg.sentAt || (msg as any).createdAt} />;
          return isMine 
            ? <ChatBubbleMine key={msg.id} type={msgType} message={msg.content} sentAt={msg.sentAt || (msg as any).createdAt} imageUrl={msg.imageUrl} />
            : <ChatBubbleOther key={msg.id} type={msgType} senderNickname={msg.senderNickname} message={msg.content} sentAt={msg.sentAt || (msg as any).createdAt} imageUrl={msg.imageUrl} />;
        })}
        {isUploading && <UploadStatus>사진 전송 중...</UploadStatus>}
        <div ref={bottomRef} />
      </MessagesArea>
      <ChatInputArea onSend={handleSend} onSelectTransaction={() => setReqSheetOpen(true)} onSelectLocation={() => setMapSheetOpen(true)} onPhotosSelected={handlePhotosSelected} bottomOffset={CHAT_INPUT_BOTTOM_OFFSET} />
      <TransactionRequestSheet isOpen={reqSheetOpen} onClose={() => setReqSheetOpen(false)} 
        roomInfo={room ? { productTitle: room.productTitle, productPrice: room.productPrice, productThumbnailUrl: room.productThumbnailUrl } : null} onSubmit={handleTransactionRequestSubmit} />
      <TransactionConfirmSheet isOpen={confirmSheetOpen} onClose={() => setConfirmSheetOpen(false)} 
        roomInfo={room ? { productTitle: room.productTitle, productThumbnailUrl: room.productThumbnailUrl } : null} content={selectedConfirmMessage ? JSON.parse(selectedConfirmMessage.content || '{}') : undefined}
        onConfirm={() => selectedConfirmMessage && handleTransactionAction(selectedConfirmMessage, 'PAYMENT_SUCCESS')} />
      <ChatMapPickerSheet isOpen={mapSheetOpen} onClose={() => setMapSheetOpen(false)} onSubmit={handleMapSubmit} />
    </Page>
  );
}

const Page = styled.div` display: flex; flex-direction: column; height: 100dvh; background: ${colors.surface}; overflow: hidden; `;
const MessagesArea = styled.div` flex: 1; overflow-y: auto; padding: ${HEADER_HEIGHT + 80}px 0 ${MESSAGES_BOTTOM_PAD}px; display: flex; flex-direction: column; gap: 8px; `;
const LoadingWrapper = styled.div` display: flex; align-items: center; justify-content: center; flex: 1; font-family: ${typography.fontFamily}; color: ${colors.textSecondary}; `;
const ItemSummaryBar = styled.div` position: fixed; top: ${HEADER_HEIGHT}px; left: 0; right: 0; z-index: 4; background: ${colors.surface}; border-bottom: 1px solid ${colors.border}; `;
const EmptyMessages = styled.div` display: flex; align-items: center; justify-content: center; height: 120px; color: ${colors.textSecondary}; `;
const UploadStatus = styled.div` padding: 8px 16px; text-align: right; font-size: 13px; color: ${colors.textSecondary}; `;
