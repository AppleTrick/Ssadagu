'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { ChatInputArea } from '@/widgets/chat-input';
import { ChatBubbleMine, ChatBubbleOther, ChatRoomItemSummary, SystemMessage, PaymentChatBubble, MapChatBubble } from '@/entities/chat';
import { TransactionBubble } from '@/entities/transaction';
import { TransactionRequestSheet, TransactionConfirmSheet } from '@/features/transfer-payment';
import type { ChatMessage, ChatRoom, TransactionContent } from '@/entities/chat/model/types';
import type { User } from '@/entities/user';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT } from '@/shared/styles/theme';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/ws-stomp';
const CHAT_INPUT_HEIGHT = 56;
const CHAT_INPUT_BOTTOM_OFFSET = 0;
const MESSAGES_BOTTOM_PAD = CHAT_INPUT_HEIGHT + CHAT_INPUT_BOTTOM_OFFSET + 16;

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
  padding: ${HEADER_HEIGHT + 80}px 0 ${MESSAGES_BOTTOM_PAD}px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LoadingWrapper = styled.div`
  display: flex; align-items: center; justify-content: center; flex: 1;
  font-family: ${typography.fontFamily}; font-size: ${typography.size.base}; color: ${colors.textSecondary};
`;

const ErrorWrapper = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 8px;
  font-family: ${typography.fontFamily}; font-size: ${typography.size.base}; color: ${colors.textSecondary};
`;

const RetryButton = styled.button`
  font-family: ${typography.fontFamily}; font-size: ${typography.size.sm}; color: ${colors.primary};
  background: none; border: none; cursor: pointer; text-decoration: underline;
`;

const ItemSummaryBar = styled.div`
  position: fixed; top: ${HEADER_HEIGHT}px; left: 0; right: 0; z-index: 4;
  background: ${colors.surface}; border-bottom: 1px solid ${colors.border};
`;

const EmptyMessages = styled.div`
  display: flex; align-items: center; justify-content: center; height: 120px;
  font-family: ${typography.fontFamily}; font-size: ${typography.size.base}; color: ${colors.textSecondary};
`;

interface ChatRoomResponse { data?: ChatRoom; }
interface MessagesResponse { content?: ChatMessage[]; data?: ChatMessage[] | { content?: ChatMessage[] }; }

export function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);

  const [reqSheetOpen, setReqSheetOpen] = useState(false);
  const [confirmSheetOpen, setConfirmSheetOpen] = useState(false);
  const [selectedConfirmMessage, setSelectedConfirmMessage] = useState<ChatMessage | null>(null);

  const rawId = params && params.roomId ? (Array.isArray(params.roomId) ? params.roomId[0] : params.roomId) : '';
  const isNewRoom = rawId === 'new';
  const roomId = isNewRoom ? -1 : Number(rawId);
  const newProductId = Number(searchParams?.get('productId'));

  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const stompRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const hasSentPending = useRef(false);
  const [isStompConnected, setIsStompConnected] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { data: currentUser } = useQuery<User>({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.USERS.PROFILE(userId!), accessToken ?? undefined);
      if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
      const json = await res.json() as User | { data?: User };
      return (json as { data?: User }).data || (json as User);
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });

  const { data: newRoomData, isLoading: newRoomLoading } = useQuery<ChatRoom>({
    queryKey: ['newChatRoomInit', newProductId],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.PRODUCTS.DETAIL(newProductId), accessToken ?? undefined);
      if (!res.ok) throw new Error('상품 정보를 불러오지 못했습니다.');
      const prod = await res.json() as any;
      return {
        id: -1,
        productId: prod.id,
        productTitle: prod.title,
        productThumbnailUrl: null,
        productPrice: prod.price,
        productStatus: prod.status,
        buyerId: currentUser?.id ?? -1,
        buyerNickname: currentUser?.nickname ?? '',
        sellerId: prod.sellerId,
        sellerNickname: prod.sellerNickname,
        lastMessage: null,
        lastSentAt: null,
        unreadCount: 0,
        roomStatus: 'ACTIVE',
      } as ChatRoom;
    },
    enabled: isNewRoom && !isNaN(newProductId) && !!currentUser,
  });

  const { data: fetchedRoom, isLoading: fetchedRoomLoading } = useQuery<ChatRoom>({
    queryKey: ['chatRoom', roomId, currentUser?.id],
    queryFn: async () => {
      const res = await apiClient.get(`${ENDPOINTS.CHATS.DETAIL(roomId)}?userId=${currentUser?.id}`, accessToken ?? undefined);
      if (!res.ok) throw new Error('채팅방 정보를 불러오지 못했습니다.');
      const json: any = await res.json();
      const d = json.data || json;
      
      if (d.product) {
        return {
          id: d.roomId,
          productId: d.product.productId,
          productTitle: d.product.title,
          productThumbnailUrl: d.product.imageUrl,
          productPrice: d.product.price,
          productStatus: d.product.status,
          partnerId: d.partner?.userId,
          partnerNickname: d.partner?.nickname,
          lastMessage: d.lastMessage,
          lastSentAt: d.lastSentAt,
          roomStatus: d.roomStatus,
          buyerId: -1,
          buyerNickname: '',
          sellerId: -1,
          sellerNickname: '',
          unreadCount: 0,
        } as any;
      }
      
      return d as ChatRoom;
    },
    enabled: !isNewRoom && !isNaN(roomId) && !!currentUser?.id,
  });

  const room = isNewRoom ? newRoomData : fetchedRoom;
  const roomLoading = isNewRoom ? newRoomLoading : fetchedRoomLoading;

  const { data: historyMessages, isLoading: messagesLoading, isError, refetch } = useQuery<ChatMessage[]>({
    queryKey: ['chatMessages', roomId],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.CHATS.MESSAGES(roomId), accessToken ?? undefined);
      if (!res.ok) throw new Error('메시지를 불러오지 못했습니다.');
      const json = await res.json() as MessagesResponse | ChatMessage[];
      if (Array.isArray(json)) return json;
      const body = json as MessagesResponse;
      if (Array.isArray(body.content)) return body.content as ChatMessage[];
      const d = body.data;
      if (Array.isArray(d)) return d as ChatMessage[];
      if (d && !Array.isArray(d) && Array.isArray((d as { content?: ChatMessage[] }).content)) {
        return (d as { content: ChatMessage[] }).content;
      }
      return [];
    },
    enabled: !isNewRoom && !isNaN(roomId),
  });

  useEffect(() => {
    if (historyMessages) {
      setLocalMessages((prev) => {
        // 백엔드에서 DESC로 오므로 ASC로 뒤집어줌
        const reversedHistory = [...historyMessages].reverse();
        
        // 이미 프론트에 있는 (최근에 소켓으로 받은 or 낙관적) 메시지 중 API 응답에 없는 것만 추림
        const historyIds = new Set(reversedHistory.map((m) => m.id));
        const optimisticOrNew = prev.filter((m) => !historyIds.has(m.id));
        
        // 합친 후 다시 보낸 시간순 오름차순(ASC) 정렬 보장
        const merged = [...reversedHistory, ...optimisticOrNew];
        merged.sort((a, b) => {
          const timeA = new Date((a.sentAt || (a as any).createdAt) as string).getTime();
          const timeB = new Date((b.sentAt || (b as any).createdAt) as string).getTime();
          return timeA - timeB;
        });
        
        return merged;
      });
    }
  }, [historyMessages]);

  useEffect(() => {
    // Only scroll to bottom on initial load or when a new message is appended at the end
    // For pagination, we shouldn't scroll to bottom. 
    // We'll trust that the user was already looking near the top.
    if (localMessages.length <= 30) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [localMessages.length]);

  useEffect(() => {
    if (!historyMessages || isError || !hasMore || localMessages.length === 0 || isFetchingMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const loadMore = async () => {
             const oldestId = localMessages[0].id;
             if (typeof oldestId === 'string' && oldestId.startsWith('local-')) return;
             
             setIsFetchingMore(true);
             try {
                const res = await apiClient.get(`${ENDPOINTS.CHATS.MESSAGES(roomId)}?cursor=${oldestId}&size=30`, accessToken ?? undefined);
                if (res.ok) {
                   const qs = await res.json() as any;
                   const moreMessages = Array.isArray(qs) ? qs : Array.isArray(qs.content) ? qs.content : Array.isArray(qs.data) ? qs.data : qs.data?.content || [];
                   if (moreMessages.length < 30) setHasMore(false);
                   if (moreMessages.length > 0) {
                      const reversedMore = [...moreMessages].reverse();
                      setLocalMessages(prev => {
                         const newIds = new Set(reversedMore.map(m => m.id));
                         const filteredPrev = prev.filter(m => !newIds.has(m.id));
                         return [...reversedMore, ...filteredPrev];
                      });
                   }
                }
             } catch (e) { console.error(e); }
             finally {
                 setIsFetchingMore(false);
             }
          };
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (topRef.current) observer.observe(topRef.current);
    
    return () => observer.disconnect();
  }, [historyMessages, isError, hasMore, localMessages[0]?.id, roomId, accessToken, isFetchingMore]);

  useEffect(() => {
    if (roomId > 0 && currentUser?.id && historyMessages && historyMessages.length > 0) {
      apiClient.patch(ENDPOINTS.CHATS.READ(roomId), null, accessToken ?? undefined).catch(console.error);
    }
  }, [roomId, currentUser?.id, accessToken, historyMessages]);

  useEffect(() => {
    if (isNewRoom || isNaN(roomId)) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      onConnect: () => {
        client.subscribe(`/sub/chat/room/${roomId}`, (frame) => {
          try {
            const msg = JSON.parse(frame.body) as ChatMessage;
            setLocalMessages((prev) => {
              const exists = prev.some((m) => m.id === msg.id);
              return exists ? prev : [...prev, msg];
            });
          } catch {
            // ignore
          }
        });
        setIsStompConnected(true);

        const pending = sessionStorage.getItem('pendingChatMsg');
        if (pending && currentUser?.id) {
          client.publish({
            destination: `/pub/chat/message`,
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            body: JSON.stringify({ roomId, senderId: currentUser.id, content: pending, type: 'TALK', isRead: false }),
          });
          sessionStorage.removeItem('pendingChatMsg');
          // No need to add local optimistic message, as WebSocket subscribe will catch it immediately.
        }
      },
      onDisconnect: () => {
        setIsStompConnected(false);
      },
      reconnectDelay: 5000,
    });
    client.activate();
    stompRef.current = client;
    return () => {
      client.deactivate();
      stompRef.current = null;
    };
  }, [roomId, accessToken, isNewRoom]);

  const currentUserId = currentUser?.id ?? null;

  const displayMessages = useMemo(() => {
    const result: (ChatMessage & { resolvedType?: 'PAYMENT_SUCCESS' | 'PAYMENT_FAIL' })[] = [];
    
    for (const msg of localMessages) {
      const msgType = msg.type || msg.messageType || 'TALK';
      
      if (msgType === 'PAYMENT_SUCCESS' || msgType === 'PAYMENT_FAIL') {
        for (let i = result.length - 1; i >= 0; i--) {
          const prevMsg = result[i];
          const prevType = prevMsg.type || prevMsg.messageType;
          if (prevType === 'PAYMENT_REQUEST' && prevMsg.content === msg.content && !prevMsg.resolvedType) {
             prevMsg.resolvedType = msgType;
             prevMsg.type = msgType; 
             prevMsg.messageType = msgType; 
             break;
          }
        }
      } else {
        result.push({ ...msg });
      }
    }
    
    return result;
  }, [localMessages]);
  const createChatMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(
        ENDPOINTS.CHATS.CREATE,
        { productId: newProductId },
        accessToken ?? undefined,
      );
      if (!res.ok) throw new Error('채팅방 생성 실패');
      const json = await res.json() as { data?: { id: number }; id?: number };
      return json.data ? json.data.id : json.id;
    },
  });

  const handleSend = useCallback(
    async (content: string) => {
      if (isNewRoom) {
        try {
          const newRoomId = await createChatMutation.mutateAsync();
          if (newRoomId) {
            sessionStorage.setItem('pendingChatMsg', content);
            router.replace(`/chat/${newRoomId}`);
          }
        } catch (e) {
          console.error(e);
        }
        return;
      }
      if (!stompRef.current?.connected) {
        const optimistic: ChatMessage = {
          id: `local-${Date.now()}`,
          roomId,
          senderId: currentUserId ?? -1,
          senderNickname: currentUser?.nickname ?? '나',
          content,
          sentAt: new Date().toISOString(),
          isRead: false,
        };
        setLocalMessages((prev) => [...prev, optimistic]);
        return;
      }
      stompRef.current.publish({
        destination: `/pub/chat/message`,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: JSON.stringify({ roomId, senderId: currentUserId ?? -1, content, type: 'TALK', isRead: false }),
      });
    },
    [roomId, accessToken, currentUserId, currentUser?.nickname, isNewRoom, createChatMutation, router]
  );

  const handleTransactionRequestSubmit = useCallback((location: string, time: string, price: number) => {
    if (!stompRef.current?.connected) return;
    const content = JSON.stringify({ locationName: location, time, price });
    stompRef.current.publish({
      destination: `/pub/chat/message`,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: JSON.stringify({ roomId, senderId: currentUserId ?? -1, content, type: 'PAYMENT_REQUEST', isRead: false }),
    });
    setReqSheetOpen(false);
  }, [roomId, accessToken, currentUserId]);

  const handleTransactionAction = useCallback((msg: ChatMessage, actionType: 'PAYMENT_SUCCESS' | 'PAYMENT_FAIL') => {
    if (!stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/pub/chat/message`,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: JSON.stringify({ roomId, senderId: currentUserId ?? -1, content: msg.content, type: actionType, isRead: false }),
    });
    setConfirmSheetOpen(false);
    setSelectedConfirmMessage(null);
  }, [roomId, accessToken, currentUserId]);

  const headerTitle = room
    ? (room as any).partnerNickname || (room.buyerId === currentUserId
      ? room.sellerNickname || '채팅'
      : room.buyerNickname || '채팅')
    : '채팅';
    
  const isLoading = roomLoading || messagesLoading;

  return (
    <Page>
      <HeaderBack title={headerTitle} onBack={() => router.back()} />
      {room && (
        <ItemSummaryBar>
          <ChatRoomItemSummary
            productId={room.productId}
            productTitle={room.productTitle}
            productThumbnailUrl={room.productThumbnailUrl || null}
            price={room.productPrice ?? 0}
            status={room.productStatus ?? room.roomStatus}
          />
        </ItemSummaryBar>
      )}
      {isError && !isLoading && (
        <ErrorWrapper>
          <span>메시지를 불러오지 못했습니다.</span>
          <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
        </ErrorWrapper>
      )}
      {!isError && (
        <MessagesArea>
          {isLoading && localMessages.length === 0 && (
            <LoadingWrapper aria-live="polite" aria-busy="true">불러오는 중...</LoadingWrapper>
          )}
          {!isLoading && displayMessages.length === 0 && (
            <EmptyMessages>아직 메시지가 없습니다. 먼저 인사해보세요!</EmptyMessages>
          )}
          {displayMessages.length > 0 && hasMore && <div ref={topRef} style={{ height: '1px' }} />}
          {isFetchingMore && <div style={{ textAlign: 'center', fontSize: '12px', color: '#888' }}>이전 메시지 불러오는 중...</div>}
          {displayMessages.map((msg) => {
            const isMine = currentUserId !== null && msg.senderId === currentUserId;
            const msgType = msg.type || msg.messageType || 'TALK';
            
            if (['ENTER', 'LEAVE', 'SYSTEM'].includes(msgType)) {
              return <SystemMessage key={msg.id} message={msg.content} />;
            }
            if (['PAYMENT_REQUEST', 'PAYMENT_SUCCESS', 'PAYMENT_FAIL'].includes(msgType)) {
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', width: '100%' }}>
                  <TransactionBubble
                    message={msg}
                    isMyMessage={isMine}
                    productThumbnailUrl={room?.productThumbnailUrl}
                    onCancel={() => handleTransactionAction(msg, 'PAYMENT_FAIL')}
                    onReject={() => handleTransactionAction(msg, 'PAYMENT_FAIL')}
                    onAccept={() => {
                      setSelectedConfirmMessage(msg);
                      setConfirmSheetOpen(true);
                    }}
                  />
                </div>
              );
            }
            if (msgType === 'MAP') {
              return <MapChatBubble key={msg.id} lat={msg.latitude || 0} lng={msg.longitude || 0} label={msg.locationName} isMine={isMine} sentAt={msg.sentAt || (msg as any).createdAt} />;
            }

            return isMine ? (
              <ChatBubbleMine key={msg.id} type={msgType} message={msg.content} sentAt={msg.sentAt || (msg as any).createdAt} imageUrl={msg.imageUrl} />
            ) : (
              <ChatBubbleOther
                key={msg.id}
                type={msgType}
                senderNickname={msg.senderNickname}
                message={msg.content}
                sentAt={msg.sentAt || (msg as any).createdAt}
                imageUrl={msg.imageUrl}
              />
            );
          })}
          <div ref={bottomRef} />
        </MessagesArea>
      )}
      <ChatInputArea 
        onSend={handleSend} 
        onSelectTransaction={() => setReqSheetOpen(true)}
        bottomOffset={CHAT_INPUT_BOTTOM_OFFSET} 
      />

      <TransactionRequestSheet
        isOpen={reqSheetOpen}
        onClose={() => setReqSheetOpen(false)}
        roomInfo={room ? { productTitle: room.productTitle, productPrice: room.productPrice, productThumbnailUrl: room.productThumbnailUrl } : null}
        onSubmit={handleTransactionRequestSubmit}
      />

      <TransactionConfirmSheet
        isOpen={confirmSheetOpen}
        onClose={() => setConfirmSheetOpen(false)}
        roomInfo={room ? { productTitle: room.productTitle, productThumbnailUrl: room.productThumbnailUrl } : null}
        content={selectedConfirmMessage ? JSON.parse(selectedConfirmMessage.content || '{}') : undefined}
        onConfirm={() => {
          if (selectedConfirmMessage) handleTransactionAction(selectedConfirmMessage, 'PAYMENT_SUCCESS');
        }}
      />
    </Page>
  );
}
