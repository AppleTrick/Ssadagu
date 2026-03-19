'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ChatMessage } from '../model/types';

interface MessagesResponse { content?: ChatMessage[]; data?: ChatMessage[] | { content?: ChatMessage[] }; }

/**
 * 특정 채팅방의 메시지 내역을 조회하는 훅 (엔터티 계층)
 */
export function useChatHistory(roomId: number, userId: number | null, accessToken: string | null) {
  return useQuery<ChatMessage[]>({
    queryKey: ['chatMessages', roomId, userId],
    queryFn: async () => {
      if (roomId <= 0) return [];
      
      const res = await apiClient.get(ENDPOINTS.CHATS.MESSAGES(roomId), accessToken ?? undefined);
      if (!res.ok) throw new Error('메시지를 불러오지 못했습니다.');
      
      const json = await res.json() as MessagesResponse | ChatMessage[];
      
      // 다양한 백엔드 응답 패턴 대응
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
    enabled: roomId > 0 && !!userId && !!accessToken,
  });
}
