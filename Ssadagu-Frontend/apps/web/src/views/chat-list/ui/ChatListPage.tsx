'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMyProfile, type User } from '@/entities/user';
import styled from '@emotion/styled';
import { HeaderMain } from '@/widgets/header';
import { BottomNav } from '@/widgets/bottom-nav';
import { TabBar } from '@/widgets/tab-bar';
import { ChatListItem } from '@/entities/chat';
import type { ChatRoom } from '@/entities/chat';
import { apiClient } from '@/shared/api/client';
import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import {
  colors,
  typography,
  HEADER_HEIGHT,
  BOTTOM_NAV_HEIGHT,
} from '@/shared/styles/theme';

const TABS = [
  { label: '전체', value: 'all' },
  { label: '판매', value: 'sell' },
  { label: '구매', value: 'buy' },
];

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  background: ${colors.surface};
`;

const ContentArea = styled.main`
  flex: 1;
  min-height: 0;
  margin-bottom: ${BOTTOM_NAV_HEIGHT}px;
  overflow-y: auto;
`;

const TabContainer = styled.div`
  margin-top: ${HEADER_HEIGHT}px;
  flex-shrink: 0;
  z-index: 5;
  background: ${colors.surface};
`;

const ListWrapper = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 8px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const EmptyWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
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

interface ChatRoomsResponse {
  content?: ChatRoom[];
  data?: ChatRoom[] | { content?: ChatRoom[] };
}

export function ChatListPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const [activeTab, setActiveTab] = useState('all');

  const { data: currentUser } = useMyProfile();

  const { data: rooms, isLoading, isError, refetch } = useQuery<ChatRoom[]>({
    queryKey: ['chatRooms', currentUser?.id],
    queryFn: async () => {
      const res = await apiClient.get(`${ENDPOINTS.CHATS.USER_ROOMS}?userId=${currentUser?.id}`, accessToken ?? undefined);
      if (!res.ok) throw new Error('채팅 목록을 불러오지 못했습니다.');
      const json = await res.json();
      if (Array.isArray(json)) return json as ChatRoom[];
      if (json?.data && Array.isArray(json.data)) return json.data as ChatRoom[];
      return [];
    },
    enabled: !!currentUser?.id,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const handleRoomClick = useCallback(
    (roomId: string | number) => {
      router.push(`/chat/${roomId}`);
    },
    [router]
  );

  const filteredRooms = useMemo(() => {
    return (rooms ?? []).filter((room: any) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'sell') return room.myRole === 'SELLER';
      if (activeTab === 'buy') return room.myRole === 'BUYER';
      return true;
    });
  }, [rooms, activeTab]);

  const [visibleCount, setVisibleCount] = useState(20);

  // 탭이 변경될 때 렌더링 개수 초기화
  useEffect(() => {
    setVisibleCount(20);
  }, [activeTab]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredRooms.length) {
          setVisibleCount((prev) => Math.min(prev + 20, filteredRooms.length));
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, filteredRooms.length, visibleCount]
  );

  return (
    <Page>
      <HeaderMain title="채팅" />
      <TabContainer>
        <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </TabContainer>
      <ContentArea>
        {(!currentUser || isLoading) && (
          <LoadingWrapper aria-live="polite" aria-busy="true">불러오는 중...</LoadingWrapper>
        )}
        {isError && (
          <ErrorWrapper>
            <span>채팅 목록을 불러오지 못했습니다.</span>
            <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
          </ErrorWrapper>
        )}
        {currentUser && !isLoading && !isError && (
          <>
            {filteredRooms.length > 0 ? (
              <ListWrapper>
                {filteredRooms.slice(0, visibleCount).map((room: any, index: number) => {
                  const isLast = index === visibleCount - 1;
                  return (
                    <li
                      key={room.roomId || room.id}
                      ref={isLast ? lastElementRef : null}
                    >
                      <ChatListItem
                        room={room}
                        currentUserId={currentUser?.id}
                        onClick={handleRoomClick}
                      />
                    </li>
                  );
                })}
              </ListWrapper>
            ) : (
              <EmptyWrapper>채팅 내역이 없습니다.</EmptyWrapper>
            )}
          </>
        )}
      </ContentArea>
      <BottomNav />
    </Page>
  );
}
