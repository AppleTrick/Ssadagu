'use client';

import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { create } from 'zustand';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

// 전역 알림(안 읽음 배지) 관리를 위한 Zustand 스토어
interface NotificationStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  increment: () => void;
  decrement: (amount?: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  increment: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrement: (amount = 1) => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - amount) })),
}));

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/ws-stomp';

/**
 * 프론트엔드 단독 멀티 구독 글로벌 소켓 (폴링 완전 대체)
 * 폴링을 사용하지 않고 접속 시 모든 채팅방에 STOMP Subscribe 를 걸어 100% 실시간 배지 피드백 구현
 */
export function useGlobalChatStomp() {
  const { userId, accessToken } = useAuthStore();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const increment = useNotificationStore((s) => s.increment);
  const stompRef = useRef<Client | null>(null);
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const currentPathRef = useRef(pathname);

  // 항상 최신 라우트 경로 보장
  useEffect(() => {
    currentPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!userId || !accessToken) return;

    let isActive = true;

    // 1. 초기 안 읽음 개수 파악 (소켓과 별개로 비동기 실행)
    apiClient.get(`${ENDPOINTS.CHATS.USER_ROOMS}?userId=${userId}`, accessToken)
      .then(async (res) => {
         if (!res.ok) return;
         const json: any = await res.json();
         const rooms = (Array.isArray(json) ? json : (json?.data || json?.content || json?.response)) || [];
         if (!Array.isArray(rooms) || !isActive) return;
         
         const initialUnread = rooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
         setUnreadCount(initialUnread);
      })
      .catch(console.error);

    // 2. 즉시 소켓 접속 및 유저 전용 채널 구독 (API 대기 안함)
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      onConnect: () => {
         if (!isActive) return;
         
         client.subscribe(`/sub/chat/user/${userId}`, (frame) => {
            try {
              const msg = JSON.parse(frame.body);
              const roomId = msg.roomId;

              if (msg && Number(msg.senderId) !== Number(userId)) {
                 const roomPath = `/chat/${roomId}`;
                 if (currentPathRef.current === roomPath) {
                    return; // 현재 보고 있는 채팅방이면 배지 증가 안함
                 }
                 
                 increment();
                 queryClient.invalidateQueries({ queryKey: ['chatRooms', userId] });
              }
            } catch (e) {
              console.warn('STOMP 메시지 파싱 오류', e);
            }
         });
      },
      reconnectDelay: 10000, 
    });

    client.activate();
    stompRef.current = client;

    return () => {
      isActive = false;
      if (stompRef.current) {
        stompRef.current.deactivate();
        stompRef.current = null;
      }
    };
  }, [userId, accessToken, setUnreadCount, increment, queryClient]);
}
