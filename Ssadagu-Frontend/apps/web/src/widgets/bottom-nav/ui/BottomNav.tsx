"use client";

import styled from "@emotion/styled";
import { usePathname } from "next/navigation";
import Link from "next/link";
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

  return (
    <Nav>
      {navItems.map((item) => {
        const isActive = pathname
          ? item.path === "/"
            ? pathname === "/"
            : pathname.startsWith(item.path)
          : false;
        return (
          <NavItem key={item.path} href={item.path}>
            {item.icon(isActive)}
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
