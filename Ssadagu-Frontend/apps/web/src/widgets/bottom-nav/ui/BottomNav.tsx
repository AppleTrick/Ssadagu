"use client";

import styled from "@emotion/styled";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobalChatStomp, useNotificationStore } from "@/features/chat-messaging/lib/useGlobalChatStomp";
import { useMyProfile } from "@/entities/user";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import {
  colors,
  typography,
  BOTTOM_NAV_HEIGHT,
  zIndex,
} from "@/shared/styles/theme";

const navItems = [
  {
    label: "홈",
    path: "/home",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? colors.primary : "none"}
        stroke={active ? colors.primary : colors.inactiveTab}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "채팅",
    path: "/chat",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? colors.primary : "none"}
        stroke={active ? colors.primary : colors.inactiveTab}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "MY",
    path: "/my",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? colors.primary : "none"}
        stroke={active ? colors.primary : colors.inactiveTab}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const BottomNav = () => {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: currentUser } = useMyProfile();

  // 프론트 단독 다중 STOMP 구독 활성화
  useGlobalChatStomp();
  // 실시간으로 변동하는 배지 개수 불러오기 (Zustand)
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  // 채팅 탭 누르는 순간 데이터 미리 fetch (페이지 이동 전에 시작)
  const prefetchChatRooms = () => {
    if (!currentUser?.id || !accessToken) return;
    queryClient.prefetchQuery({
      queryKey: ['chatRooms', currentUser.id],
      queryFn: async () => {
        const res = await apiClient.get(
          `${ENDPOINTS.CHATS.USER_ROOMS}?userId=${currentUser.id}`,
          accessToken,
        );
        if (!res.ok) throw new Error('채팅 목록을 불러오지 못했습니다.');
        const json = await res.json();
        if (Array.isArray(json)) return json;
        if (json?.data && Array.isArray(json.data)) return json.data;
        return [];
      },
      staleTime: 30_000,
    });
  };

  return (
    <Nav>
      {navItems.map((item) => {
        const isActive = pathname
          ? item.path === "/"
            ? pathname === "/"
            : pathname.startsWith(item.path)
          : false;
        return (
          <NavItem
            key={item.path}
            href={item.path}
            onMouseEnter={item.path === '/chat' ? prefetchChatRooms : undefined}
            onTouchStart={item.path === '/chat' ? prefetchChatRooms : undefined}
          >
            <IconWrapper>
              {item.icon(isActive)}
              {item.path === "/chat" && unreadCount > 0 && (
                <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
              )}
            </IconWrapper>
            <NavLabel $active={isActive}>{item.label}</NavLabel>
          </NavItem>
        );
      })}
    </Nav>
  );
};

export default BottomNav;

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${BOTTOM_NAV_HEIGHT}px;
  background: ${colors.surface};
  border-top: 1px solid ${colors.border};
  display: flex;
  flex-direction: row;
  z-index: ${zIndex.bottomNav};
  /* GPU 합성 레이어 - 스크롤 시 repaint 방지 */
  transform: translateZ(0);
  will-change: transform;
`;

const NavItem = styled(Link)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-decoration: none;
  padding-bottom: 8px;
`;

const NavLabel = styled.span<{ $active: boolean }>`
  font-size: ${typography.size.xs};
  font-weight: ${typography.weight.medium};
  color: ${({ $active }) => ($active ? colors.primary : colors.inactiveTab)};
`;

const IconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Badge = styled.div`
  position: absolute;
  top: -4px;
  right: -8px;
  background-color: #FF3B30;
  color: white;
  font-size: 10px;
  font-weight: 700;
  height: 16px;
  min-width: 16px;
  padding: 0 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid ${colors.surface};
  box-sizing: content-box;
`;
