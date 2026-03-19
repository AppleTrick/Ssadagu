'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '@/entities/chat/model/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/ws-stomp';

/**
 * 실시간 채팅 메시징 처리 훅 (Features 계층)
 */
export function useChatMessaging(roomId: number, accessToken: string | null, userId: number | null) {
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [isStompConnected, setIsStompConnected] = useState(false);
  const stompRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (stompRef.current?.active || roomId <= 0 || !accessToken || !userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      debug: (str) => console.log('[STOMP DEBUG]', str),
      onConnect: () => {
        client.subscribe(`/sub/chat/room/${roomId}`, (frame) => {
          try {
            const msg = JSON.parse(frame.body) as ChatMessage;
            setSessionMessages((prev) => {
              const exists = prev.some((m) => m.id === msg.id);
              return exists ? prev : [...prev, msg];
            });
          } catch (e) {
            console.error('메시지 파싱 실패', e);
          }
        });
        setIsStompConnected(true);

        // 펜딩 메시지 처리
        const pending = sessionStorage.getItem('pendingChatMsg');
        if (pending && userId) {
          client.publish({
            destination: `/pub/chat/message`,
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ roomId, senderId: userId, content: pending, type: 'TALK', isRead: false }),
          });
          sessionStorage.removeItem('pendingChatMsg');
        }
      },
      onDisconnect: () => setIsStompConnected(false),
      reconnectDelay: 5000,
    });

    client.activate();
    stompRef.current = client;
  }, [roomId, accessToken, userId]);

  const disconnect = useCallback(() => {
    stompRef.current?.deactivate();
    stompRef.current = null;
    setIsStompConnected(false);
  }, []);

  const sendMessage = useCallback((destination: string, body: any) => {
    if (!stompRef.current?.connected) return false;
    
    stompRef.current.publish({
      destination,
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ roomId, ...body, isRead: false }),
    });
    return true;
  }, [roomId, accessToken]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const addOptimisticMessage = useCallback((msg: ChatMessage) => {
     setSessionMessages(prev => [...prev, msg]);
  }, []);

  return {
    sessionMessages,
    isStompConnected,
    sendMessage,
    addOptimisticMessage,
    resetSessionMessages: () => setSessionMessages([]),
  };
}
