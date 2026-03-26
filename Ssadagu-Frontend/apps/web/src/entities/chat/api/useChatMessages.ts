'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ChatMessage } from '../model/types';

function parseMessages(json: unknown): ChatMessage[] {
  if (Array.isArray(json)) return json as ChatMessage[];
  const body = json as Record<string, unknown>;
  if (Array.isArray(body.content)) return body.content as ChatMessage[];
  const d = body.data;
  if (Array.isArray(d)) return d as ChatMessage[];
  if (d && !Array.isArray(d) && Array.isArray((d as Record<string, unknown>).content)) {
    return (d as { content: ChatMessage[] }).content;
  }
  return [];
}

/**
 * 채팅 메시지 커서 기반 무한 스크롤
 * - 첫 페이지: cursor 없이 최신 30개 (DESC)
 * - 이후 페이지: 가장 오래된 메시지 ID를 cursor로 전달 → 그 이전 메시지 30개 (DESC)
 */
export function useChatHistory(roomId: number, userId: number | null, accessToken: string | null) {
  return useInfiniteQuery<ChatMessage[]>({
    queryKey: ['chatMessages', roomId, userId],
    initialPageParam: null as number | null,
    queryFn: async ({ pageParam }) => {
      if (roomId <= 0) return [];
      const cursor = pageParam as number | null;
      const url = cursor
        ? `${ENDPOINTS.CHATS.MESSAGES(roomId)}?cursor=${cursor}&size=30`
        : ENDPOINTS.CHATS.MESSAGES(roomId);
      const res = await apiClient.get(url, accessToken ?? undefined);
      if (!res.ok) throw new Error('메시지를 불러오지 못했습니다.');
      return parseMessages(await res.json());
    },
    // lastPage는 DESC 정렬 → 마지막 요소가 가장 오래된 메시지
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 30) return null; // 더 이상 없음
      const oldestId = lastPage[lastPage.length - 1]?.id;
      return oldestId != null ? Number(oldestId) : null;
    },
    enabled: roomId > 0 && !!userId && !!accessToken,
  });
}
