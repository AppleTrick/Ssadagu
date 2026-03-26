'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import { useModalStore } from '@/shared/hooks/useModalStore';
import AttachmentMenu from './AttachmentMenu';

const MAX_LENGTH = 255;

interface ChatInputAreaProps {
  onSend: (content: string) => void;
  onAttach?: () => void;
  onSelectTransaction?: () => void;
  onSelectLocation?: () => void;
  onPhotosSelected?: (files: File[]) => void;
  onSelectCamera?: () => void;
}

const ChatInputArea = ({ onSend, onSelectTransaction, onSelectLocation, onPhotosSelected, onSelectCamera }: ChatInputAreaProps) => {
  const { alert: modalAlert } = useModalStore();
  const [value, setValue] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    resizeTextarea();
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
        onSelectLocation={() => {
          setAttachOpen(false);
          if (onSelectLocation) onSelectLocation();
          else modalAlert({ message: '지도 공유 기능은 준비 중입니다.' });
        }}
        onPhotosSelected={(files) => {
          setAttachOpen(false);
          if (onPhotosSelected) onPhotosSelected(files);
        }}
        onSelectTransaction={onSelectTransaction ? () => {
          setAttachOpen(false);
          onSelectTransaction();
        } : undefined}
        onSelectCamera={() => {
          setAttachOpen(false);
          if (onSelectCamera) onSelectCamera();
          else modalAlert({ message: '카메라 기능은 준비 중입니다.' });
        }}
      />
    <Bar>
      <AttachButton onClick={() => setAttachOpen((v) => !v)} aria-label="첨부">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </AttachButton>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요"
        maxLength={MAX_LENGTH}
        rows={1}
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

const Bar = styled.div`
  min-height: 56px;
  background: ${colors.surface};
  border-top: 1px solid ${colors.border};
  display: flex;
  flex-direction: row;
  align-items: flex-end;
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
  height: 36px;
`;

const Textarea = styled.textarea`
  flex: 1;
  min-height: 36px;
  max-height: 120px;
  background: ${colors.bg};
  border: none;
  border-radius: 18px;
  padding: 8px 16px;
  font-size: ${typography.size.base};
  color: ${colors.textPrimary};
  outline: none;
  font-family: inherit;
  line-height: 1.5;
  resize: none;
  overflow-y: auto;
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
