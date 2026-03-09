'use client';

import { useState, type KeyboardEvent } from 'react';
import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import AttachmentMenu from './AttachmentMenu';

interface ChatInputAreaProps {
  onSend: (content: string) => void;
  onAttach?: () => void;
  bottomOffset?: number;
}

const ChatInputArea = ({ onSend, bottomOffset = 0 }: ChatInputAreaProps) => {
  const [value, setValue] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AttachmentMenu
        isOpen={attachOpen}
        onClose={() => setAttachOpen(false)}
        onSelectPhoto={() => alert('사진 첨부 기능은 준비 중입니다.')}
        onSelectLocation={() => alert('위치 공유 기능은 준비 중입니다.')}
      />
    <Bar $bottomOffset={bottomOffset}>
      <AttachButton onClick={() => setAttachOpen((v) => !v)} aria-label="첨부">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </AttachButton>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요"
      />
      <SendButton onClick={handleSend} aria-label="전송" disabled={!value.trim()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.surface} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </SendButton>
    </Bar>
    </>
  );
};

export default ChatInputArea;

const CHAT_INPUT_HEIGHT = 56;

const Bar = styled.div<{ $bottomOffset: number }>`
  position: fixed;
  bottom: ${({ $bottomOffset }) => $bottomOffset}px;
  left: 0;
  right: 0;
  height: ${CHAT_INPUT_HEIGHT}px;
  background: ${colors.surface};
  border-top: 1px solid ${colors.border};
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  z-index: 10;
`;

const AttachButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
`;

const Input = styled.input`
  flex: 1;
  height: 36px;
  background: ${colors.bg};
  border: none;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: ${typography.size.base};
  color: ${colors.textPrimary};
  outline: none;
  font-family: inherit;
  &::placeholder {
    color: ${colors.textSecondary};
  }
`;

const SendButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${colors.primary};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s;
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
