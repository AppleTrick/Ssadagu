import { create } from 'zustand';

type ModalType = 'alert' | 'confirm';

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant: 'default' | 'danger';
  
  alert: (options: { title?: string; message: string; confirmLabel?: string; variant?: 'default' | 'danger' }) => Promise<void>;
  confirm: (options: { title?: string; message: string; confirmLabel?: string; cancelLabel?: string; variant?: 'default' | 'danger' }) => Promise<boolean>;
  close: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  confirmLabel: '확인',
  cancelLabel: '취소',
  onConfirm: () => {},
  onCancel: () => {},
  variant: 'default',

  alert: ({ title = '알림', message, confirmLabel = '확인', variant = 'default' }) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        type: 'alert',
        title,
        message,
        confirmLabel,
        variant,
        onConfirm: () => {
          set({ isOpen: false, variant: 'default' });
          resolve();
        },
        onCancel: () => {
          set({ isOpen: false, variant: 'default' });
          resolve();
        },
      });
    });
  },

  confirm: ({ title = '확인', message, confirmLabel = '확인', cancelLabel = '취소', variant = 'default' }) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmLabel,
        cancelLabel,
        variant,
        onConfirm: () => {
          set({ isOpen: false });
          resolve(true);
        },
        onCancel: () => {
          set({ isOpen: false });
          resolve(false);
        },
      });
    });
  },

  close: () => set({ isOpen: false }),
}));
