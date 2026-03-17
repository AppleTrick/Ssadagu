'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { ChatInputArea } from '@/widgets/chat-input';
import { ChatBubbleMine, ChatBubbleOther, ChatRoomItemSummary, SystemMessage, PaymentChatBubble, MapChatBubble } from '@/entities/chat';
import type { ChatMessage, ChatRoom } from '@/entities/chat';
import type { User } from '@/entities/user';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT } from '@/shared/styles/theme';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/ws';
const CHAT_INPUT_HEIGHT = 56;
const CHAT_INPUT_BOTTOM_OFFSET = 0;
const MESSAGES_BOTTOM_PAD = CHAT_INPUT_HEIGHT + CHAT_INPUT_BOTTOM_OFFSET + 16;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: ${colors.bg};
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
  const pendingMsg = searchParams.get('pendingMsg');
  
  const rawId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const isNewRoom = rawId === 'new';
  const roomId = isNewRoom ? -1 : Number(rawId);
  const newProductId = Number(searchParams.get('productId'));

  const accessToken = useAuthStore((s) => s.accessToken);
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
      const res = await apiClient.get(ENDPOINTS.USERS.ME, accessToken ?? undefined);
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
      const json = await res.json() as ChatRoom | ChatRoomResponse;
      return (json as ChatRoomResponse).data || (json as ChatRoom);
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
    if (historyMessages) setLocalMessages(historyMessages);
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
                      setLocalMessages(prev => [...moreMessages, ...prev]);
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
        setIsStompConnected(true);
        client.subscribe(`/topic/chat/${roomId}`, (frame) => {
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

  useEffect(() => {
    if (pendingMsg && isStompConnected && !hasSentPending.current && stompRef.current?.connected) {
      hasSentPending.current = true;
      stompRef.current.publish({
        destination: `/app/chat/${roomId}`,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: JSON.stringify({ content: pendingMsg }),
      });
      const optimistic: ChatMessage = {
        id: `local-${Date.now()}`,
        roomId,
        senderId: currentUserId ?? -1,
        senderNickname: currentUser?.nickname ?? '나',
        content: pendingMsg,
        sentAt: new Date().toISOString(),
        isRead: false,
      };
      setLocalMessages((prev) => [...prev, optimistic]);
      router.replace(`/chat/${roomId}`);
    }
  }, [pendingMsg, isStompConnected, roomId, accessToken, currentUserId, currentUser, router]);

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
            router.replace(`/chat/${newRoomId}?pendingMsg=${encodeURIComponent(content)}`);
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
        destination: `/app/chat/${roomId}`,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: JSON.stringify({ content, type: 'TALK' }),
      });
    },
    [roomId, accessToken, currentUserId, currentUser?.nickname, isNewRoom, createChatMutation, router]
  );

  const headerTitle = room
    ? room.buyerId === currentUserId
      ? room.sellerNickname || '채팅'
      : room.buyerNickname || '채팅'
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
            productThumbnailUrl={room.productThumbnailUrl}
            price={0}
            status={room.roomStatus}
          />
        </ItemSummaryBar>
      )}
      {isLoading && (
        <LoadingWrapper aria-live="polite" aria-busy="true">불러오는 중...</LoadingWrapper>
      )}
      {isError && !isLoading && (
        <ErrorWrapper>
          <span>메시지를 불러오지 못했습니다.</span>
          <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
        </ErrorWrapper>
      )}
      {!isLoading && !isError && (
        <MessagesArea>
          {localMessages.length === 0 && (
            <EmptyMessages>아직 메시지가 없습니다. 먼저 인사해보세요!</EmptyMessages>
          )}
          {localMessages.length > 0 && hasMore && <div ref={topRef} style={{ height: '1px' }} />}
          {isFetchingMore && <div style={{ textAlign: 'center', fontSize: '12px', color: '#888' }}>이전 메시지 불러오는 중...</div>}
          {localMessages.map((msg) => {
            const isMine = currentUserId !== null && msg.senderId === currentUserId;
            const msgType = msg.type || msg.messageType || 'TALK';
            
            if (['ENTER', 'LEAVE', 'SYSTEM'].includes(msgType)) {
              return <SystemMessage key={msg.id} message={msg.content} />;
            }
            if (['PAYMENT_REQUEST', 'PAYMENT_SUCCESS', 'PAYMENT_FAIL'].includes(msgType)) {
              return <PaymentChatBubble key={msg.id} type={msgType as any} message={msg.content} sentAt={msg.sentAt} isMine={isMine} />;
            }
            if (msgType === 'MAP') {
              return <MapChatBubble key={msg.id} lat={msg.latitude || 0} lng={msg.longitude || 0} label={msg.locationName} isMine={isMine} sentAt={msg.sentAt} />;
            }

            return isMine ? (
              <ChatBubbleMine key={msg.id} type={msgType} message={msg.content} sentAt={msg.sentAt} imageUrl={msg.imageUrl} />
            ) : (
              <ChatBubbleOther
                key={msg.id}
                type={msgType}
                senderNickname={msg.senderNickname}
                message={msg.content}
                sentAt={msg.sentAt}
                imageUrl={msg.imageUrl}
              />
            );
          })}
          <div ref={bottomRef} />
        </MessagesArea>
      )}
      <ChatInputArea onSend={handleSend} bottomOffset={CHAT_INPUT_BOTTOM_OFFSET} />
    </Page>
  );
}
