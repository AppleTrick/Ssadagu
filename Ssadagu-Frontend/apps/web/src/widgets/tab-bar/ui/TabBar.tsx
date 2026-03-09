'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';

interface Tab {
  label: string;
  value: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (value: string) => void;
}

const TabBar = ({ tabs, activeTab, onChange }: TabBarProps) => {
  return (
    <Bar>
      {tabs.map((tab) => (
        <TabItem
          key={tab.value}
          active={tab.value === activeTab}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </TabItem>
      ))}
    </Bar>
  );
};

export default TabBar;

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
`;

const TabItem = styled.button<{ active: boolean }>`
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-bottom: 2px solid ${({ active }) => (active ? colors.primary : 'transparent')};
  font-size: ${typography.size.base};
  font-weight: ${typography.weight.medium};
  color: ${({ active }) => (active ? colors.primary : colors.textSecondary)};
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1px;
`;
