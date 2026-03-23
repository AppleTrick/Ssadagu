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

    const setupGlobalWebsocket = async () => {
      try {
        // 1. 초기 안 읽음 개수 파악 & 내 모든 채팅방 roomId 수집
        const res = await apiClient.get(`${ENDPOINTS.CHATS.USER_ROOMS}?userId=${userId}`, accessToken);
        if (!res.ok) return;
        const json: any = await res.json();
        const rooms = (Array.isArray(json) ? json : (json?.data || json?.content || json?.response)) || [];
        if (!Array.isArray(rooms) || !isActive) return;

        // 초기 상태 주입
        const initialUnread = rooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
        setUnreadCount(initialUnread);

        // 2. 다중 채팅방 글로벌 소켓 연결 (STOMP)
        const client = new Client({
          webSocketFactory: () => new SockJS(SOCKET_URL),
          connectHeaders: { Authorization: `Bearer ${accessToken}` },
          // debug: (str) => console.log('[GLOBAL STOMP]', str),
          onConnect: () => {
             if (!isActive) return;
             // 참여 중인 모든 방을 순회하며 채널 구독
             rooms.forEach((room: any) => {
                const roomId = room.roomId || room.id;
                if (!roomId) return;
                client.subscribe(`/sub/chat/room/${roomId}`, (frame) => {
                   try {
                     const msg = JSON.parse(frame.body);
                     if (msg && Number(msg.senderId) !== Number(userId)) {
                        // 현재 사용자가 이 채팅방 화면(뷰)을 보고 있는 중이라면 배지를 올리지 않음 (실시간으로 읽고 있으므로)
                        const roomPath = `/chat/${roomId}`;
                        if (currentPathRef.current === roomPath) {
                           return; // 무시
                        }
                        
                        increment();
                        // 🔔 [핵심] 메시지가 오면 채팅 목록 페이지(ChatListPage)의 React Query 캐시를 강제로 파기하여, 
                        // 화면 밖(채팅 목록 등)에 있어도 최신 메시지와 시간, 안 읽음 수가 즉시 UI에 반영되도록 합니다.
                        queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
                     }
                   } catch (e) {
                     console.warn('STOMP 메시지 파싱 오류', e);
                   }
                });
             });
          },
          // 백엔드의 소켓 부담을 줄이기 위해 재접속은 보수적으로 10초
          reconnectDelay: 10000, 
        });

        client.activate();
        stompRef.current = client;

      } catch (err) {
        console.error('글로벌 소켓 설정 실패', err);
      }
    };

    setupGlobalWebsocket();

    return () => {
      isActive = false;
      if (stompRef.current) {
        stompRef.current.deactivate();
        stompRef.current = null;
      }
    };
  }, [userId, accessToken, setUnreadCount, increment]);
}
