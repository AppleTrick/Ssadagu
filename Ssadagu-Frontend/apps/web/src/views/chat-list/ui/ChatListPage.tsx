'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/entities/user';
import styled from '@emotion/styled';
import { HeaderMain } from '@/widgets/header';
import { BottomNav } from '@/widgets/bottom-nav';
import { TabBar } from '@/widgets/tab-bar';
import { ChatListItem } from '@/entities/chat';
import type { ChatRoom } from '@/entities/chat';
import { apiClient } from '@/shared/api/client';
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
  min-height: 100dvh;
  background: ${colors.surface};
`;

const ContentArea = styled.main`
  flex: 1;
  margin-top: ${HEADER_HEIGHT}px;
  padding-bottom: ${BOTTOM_NAV_HEIGHT}px;
  overflow-y: auto;
`;

const TabContainer = styled.div`
  position: sticky;
  top: 0;
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
  const [activeTab, setActiveTab] = useState('all');

  const { data: currentUser } = useQuery<User>({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.USERS.ME, accessToken ?? undefined);
      if (!res.ok) throw new Error('사용자 정보 오류');
      const json = await res.json();
      if (json?.data) return json.data as User;
      return json as User;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });

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

  const filteredRooms = (rooms ?? []).filter((room: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'sell') return room.myRole === 'SELLER';
    if (activeTab === 'buy') return room.myRole === 'BUYER';
    return true;
  });

  return (
    <Page>
      <HeaderMain title="채팅" />
      <ContentArea>
        <TabContainer>
          <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        </TabContainer>
        {isLoading && (
          <LoadingWrapper aria-live="polite" aria-busy="true">불러오는 중...</LoadingWrapper>
        )}
        {isError && (
          <ErrorWrapper>
            <span>채팅 목록을 불러오지 못했습니다.</span>
            <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
          </ErrorWrapper>
        )}
        {!isLoading && !isError && (
          <>
            {filteredRooms.length > 0 ? (
              <ListWrapper>
                {filteredRooms.map((room: any) => (
                  <li key={room.roomId || room.id}>
                    <ChatListItem
                      room={room}
                      currentUserId={currentUser?.id}
                      onClick={() => router.push(`/chat/${room.roomId || room.id}`)}
                    />
                  </li>
                ))}
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
