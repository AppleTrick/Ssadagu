'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { ChatInputArea } from '@/widgets/chat-input';
import { ChatBubbleMine, ChatBubbleOther, ChatRoomItemSummary } from '@/entities/chat';
import type { ChatMessage, ChatRoom } from '@/entities/chat';
import type { User } from '@/entities/user';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT } from '@/shared/styles/theme';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/ws';
const CHAT_INPUT_HEIGHT = 56;
const CHAT_INPUT_BOTTOM_OFFSET = 0; // 채팅방은 BottomNav 없음 → bottom: 0
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
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

const ItemSummaryBar = styled.div`
  position: fixed;
  top: ${HEADER_HEIGHT}px;
  left: 0;
  right: 0;
  z-index: 4;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
`;

const EmptyMessages = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

interface ChatRoomResponse {
  data?: ChatRoom;
}

interface MessagesResponse {
  content?: ChatMessage[];
  data?: ChatMessage[] | { content?: ChatMessage[] };
}

export function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const roomId = Number(rawId);

  const accessToken = useAuthStore((s) => s.accessToken);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const stompRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data: currentUser } = useQuery<User>({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.USERS.ME, accessToken ?? undefined);
      if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
      const json = await res.json() as User | { data?: User };
      if ((json as { data?: User }).data) return (json as { data: User }).data;
      return json as User;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });

  const { data: room, isLoading: roomLoading } = useQuery<ChatRoom>({
    queryKey: ['chatRoom', roomId, currentUser?.id],
    queryFn: async () => {
      const res = await apiClient.get(`${ENDPOINTS.CHATS.DETAIL(roomId)}?userId=${currentUser?.id}`, accessToken ?? undefined);
      if (!res.ok) throw new Error('채팅방 정보를 불러오지 못했습니다.');
      const json = await res.json() as ChatRoom | ChatRoomResponse;
      if ((json as ChatRoomResponse).data) return (json as ChatRoomResponse).data as ChatRoom;
      return json as ChatRoom;
    },
    enabled: !isNaN(roomId) && !!currentUser?.id,
  });

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
    enabled: !isNaN(roomId),
  });

  useEffect(() => {
    if (historyMessages) setLocalMessages(historyMessages);
  }, [historyMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  useEffect(() => {
    if (isNaN(roomId)) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      onConnect: () => {
        client.subscribe(`/topic/chat/${roomId}`, (frame) => {
          try {
            const msg = JSON.parse(frame.body) as ChatMessage;
            setLocalMessages((prev) => {
              const exists = prev.some((m) => m.id === msg.id);
              return exists ? prev : [...prev, msg];
            });
          } catch {
            // ignore parse errors
          }
        });
      },
      reconnectDelay: 5000,
    });
    client.activate();
    stompRef.current = client;
    return () => {
      client.deactivate();
      stompRef.current = null;
    };
  }, [roomId, accessToken]);

  const currentUserId = currentUser?.id ?? null;

  const handleSend = useCallback(
    (content: string) => {
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
        body: JSON.stringify({ content }),
      });
    },
    [roomId, accessToken, currentUserId, currentUser?.nickname],
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
          {localMessages.map((msg) =>
            currentUserId !== null && msg.senderId === currentUserId ? (
              <ChatBubbleMine key={msg.id} message={msg.content} sentAt={msg.sentAt} />
            ) : (
              <ChatBubbleOther
                key={msg.id}
                senderNickname={msg.senderNickname}
                message={msg.content}
                sentAt={msg.sentAt}
              />
            ),
          )}
          <div ref={bottomRef} />
        </MessagesArea>
      )}
      <ChatInputArea onSend={handleSend} bottomOffset={CHAT_INPUT_BOTTOM_OFFSET} />
    </Page>
  );
}
