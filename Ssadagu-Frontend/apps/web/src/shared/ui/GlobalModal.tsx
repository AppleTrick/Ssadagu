'use client';

import { ConfirmDialog } from '@/shared/ui';
import { useModalStore } from '@/shared/hooks/useModalStore';

export function GlobalModal() {
  const { 
    isOpen, 
    type, 
    title, 
    message, 
    confirmLabel, 
    cancelLabel, 
    onConfirm, 
    onCancel, 
    variant,
    close 
  } = useModalStore();

  if (!isOpen) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={() => {
        onCancel();
        close();
      }}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={type === 'confirm' ? cancelLabel : ''}
      onConfirm={onConfirm}
      variant={variant}
    />
  );
}
